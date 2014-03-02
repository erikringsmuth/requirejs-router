// {nex.js} - Unleashing the power of AMD for web applications.
//
// Version: 0.8.0
// 
// The MIT License (MIT)
// Copyright (c) 2014 Erik Ringsmuth
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
// OR OTHER DEALINGS IN THE SOFTWARE.

(function(root, factory) {
  'use strict';

  // UMD (Universal Module Definition)
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.Nex = factory(root.b);
  }
}(this, function() {
  'use strict';

  var Nex = {
    // Define a nex component by calling `var MyComponent = Nex.defineComponent('my-component', { template: ... })`
    defineComponent: function defineComponent(componentName, componentProperties) {
      if (typeof(componentProperties) === 'undefined') componentProperties = {};

      // Your component's constructor function. Create a component like this `var myComponent = new MyComponent()`.
      var Component = function Component() {

        // The DOM element. This defaults to a component tag but you can override it by setting the tagName property.
        //
        // Example:
        // Nex.defineComponent('my-component');
        // <component name="my-component"></component>
        var component = document.createElement(componentProperties.tagName || 'component');
        component.componentName = componentName;
        component.setAttribute('name', componentName);
        var hasBeenRendered = false;

        // Extend the component with the componentProperties
        // This is used to set className, id, etc.
        for (var property in componentProperties) {
          if (componentProperties.hasOwnProperty(property)) {
            component[property] = componentProperties[property];
          }
        }

        // component.components - sub-components that are automatically created, rendered, and attached to this component
        if (typeof(component.components) !== 'object') component.components = [];
        var registeredComponents = {};

        // Attach components to this component
        var attachComponent = function attachComponent(subComponent, componentName) {
          var placeholderElement = component.querySelector('component [name="' + componentName + '"]');
          if (placeholderElement) placeholderElement.parentElement.replaceChild(subComponent, placeholderElement);
        };

        // component.registerComponent(component, [componentName]) - register a component and optionally set or override it's name
        component.registerComponent = function registerComponent(Component, componentName) {
          if (typeof(componentName) === 'undefined') componentName = Component.componentName;
          if (typeof(Component) === 'function') Component = new Component();
          registeredComponents[componentName] = Component;
          if (hasBeenRendered) attachComponent(Component, componentName);
        };

        // Register all of the components
        for (var i = 0; i < component.components.length; i++) {
          component.registerComponent(component.components[i]);
        }

        // component.layout - the layout contains your site's layout (header, footer, etc.)
        if (typeof(component.layout) !== 'undefined') {
          // If the layout is a constructor function create an instance
          if (typeof component.layout === 'function') {
            component.layout = new component.layout();
          }
          // Register this component with the layout. This will attach it to the layout. It uses a reserved component name
          // 'content-placeholder'. Every layout must have this element <component name="content-placeholder"></component>.
          component.layout.registerComponent(component, 'content-placeholder');
        }

        // component.outerEl - this refers to the layout component if it exists, otherwise it's a reference to this component
        if (typeof(component.outerEl) !== 'undefined') throw 'outerEl is a read only property that is automatically populated.';
        component.outerEl = component.layout ? component.layout.outerEl : component;

        // component.model - the model that gets passed to the template
        if (typeof(component.model) === 'undefined') component.model = {};

        // component.template() - called by component.render() to generate the component's HTML
        // Defaults to work like a precompiled template that returns an empty HTML string.
        if (typeof(component.template) === 'undefined') {
          component.template = function() {
            console.log('You should implement `component.template()`.');
            return '';
          };
        }

        // component.render(), actually component.innerRender() - call the template with the element's model and replace its
        // HTML. We wrap the original render method so that rendering this component will also render its layout and
        // attach its components.
        var ModelConstructorFunction;
        var innerRender = function innerRender() {
          // Allow the model to be defined as a constructor function so that variables don't need to be evaluated
          // until render time
          if (typeof(ModelConstructorFunction) === 'function' || typeof(component.model) === 'function') {
            if (typeof(ModelConstructorFunction) !== 'function') {
              ModelConstructorFunction = component.model;
            }
            component.model = new ModelConstructorFunction();
          }

          // Compile the template and set the elements's HTML
          if (typeof(component.template) === 'function') {
            // Compiled template
            component.html(component.template(component));
          } else if (typeof(component.template) === 'string') {
            // Simple, non-dynamic HTML
            component.html(component.template);
          }
          
          return component;
        };

        // innerRender() is actually overridden by specifying a component.render() method
        if (typeof(component.render) !== 'undefined') innerRender = component.render;

        component.render = function render() {
          // Call the method that renders this component
          var innerRenderReturnValue = innerRender.call(component, arguments);

          // Attach sub-components
          for (var componentName in registeredComponents) {
            if(registeredComponents.hasOwnProperty(componentName)) {
              attachComponent(registeredComponents[componentName], componentName);
            }
          }

          hasBeenRendered = true;

          // Return the value from the original render method
          return innerRenderReturnValue;
        };

        // component.html() - replace the element's HTML with the htmlString
        //
        // This also sets up event listeners defined in the htmlString.
        component.html = function html(htmlString) {
          if (Nex.utilities.html5) {
            component.innerHTML = htmlString;
          } else {
            // IE8 workaround since el.innerHTML and el.insertAdjacentHTML fail when an event is currently being
            // triggered on the element. Create a new element and set it's innerHTML which will work since no event
            // is occurring on this temp element.
            var tempEl = document.createElement('div');
            tempEl.innerHTML = htmlString;

            // Clear the component and add the new HTML
            while (component.firstChild) component.removeChild(component.firstChild);
            while (tempEl.firstChild) component.appendChild(tempEl.firstChild);
          }
          addEventListeners(Nex.utilities.parseEventTypes(htmlString));
        };

        // component.attachTo(selector|element) - attach this component to the element
        component.attachTo = function attachTo(selector) {
          var element;
          if (typeof(selector) === 'string') {
            element = document.querySelector(selector);
          } else if (selector.appendChild) {
            element = selector;
          } else {
            throw 'You can\'t attach the component to ' + selector;
          }
          if (Nex.utilities.html5) {
            element.innerHTML = '';
          } else {
            while (element.firstChild) element.removeChild(element.firstChild);
          }
          element.appendChild(component.outerEl);
        };

        // component.remove() - remove the component from the DOM
        if (typeof(component.remove) === 'undefined') {
          component.remove = function remove() {
            if (component.parentElement !== null) {
              component.parentElement.removeChild(component);
            }
          };
        }

        // component.dispatchEvent(event) - dispatch an event and call the event handler in it's target's
        // `on-eventtype="eventHandler"'` attribute
        component.dispatchEvent = function dispatchEvent(event) {
          // Check if the event was triggered in a nested nex element
          if (!event._outOfOriginatingViewScope) {
            if (!event.target) event.target = event.srcElement; // IE8
            var attrs = event.target.attributes;
            // Not an array, it's a NamedNodeMap object {'length': 1, '0': {'name': 'on-click', value: 'eventHandlerName'}}
            for (var i = 0; i < attrs.length; i++) {
              // Check if the element has a on-eventtype attribute that matches this event listener's event type
              if (attrs[i].name.substring(0, 3) === 'on-' && attrs[i].name.substring(3) === event.type) {
                component[attrs[i].value].call(component, event);
              }
            }
            event._outOfOriginatingViewScope = true;
          }
        };

        // Set up the element's event listeners. These are defined in the template and parsed in component.html(htmlString). The
        // event listeners are bound to the component. Typically all event types will have event listeners bound after the first
        // render. There is only one event listener per type. This even listener delegates calling the correct event handler.
        //
        // Example:
        // <!-- myTemplate.html -->
        // <component name="my-component"> <!-- this is the element the event listeners are bound to -->
        //   <input name="first-name" placeholder="Enter your name" />
        //   <button on-click="sendForm">Send</button>
        // </component>
        //
        // var MyComponent = Nex.defineComponent('my-component', {
        //   template: Handlebars.compile(myTemplate),
        //   sendForm: function (event) {
        //     this; // will reference the component
        //     event.target; // will reference the element the action took place on. This is the button in this example.
        //   }
        // })
        var eventListeners = {};
        var addEventListeners = function addEventListeners(eventTypes) {
          for (var i = 0; i < eventTypes.length; i++) {
            var eventType = eventTypes[i];
            // We only need to set up one event listener for each type
            if (!eventListeners[eventType]) {
              if (window.addEventListener) {
                if (Nex.utilities.captureOnlyEventTypes[eventType]) {
                  component.addEventListener(eventType, component.dispatchEvent, true);
                } else {
                  component.addEventListener(eventType, component.dispatchEvent, false);
                }
              } else {
                // IE 8 and older, events are prefixed with 'on'
                component.attachEvent('on' + eventType, component.dispatchEvent);
              }
              eventListeners[eventType] = true;
            }
          }
        };

        // component.ready() - a hook to add additional logic when creating an instance of the component
        if (typeof(component.ready) === 'function') {
          component.ready.apply(component, arguments);
        }

        // Do the initial render of the component
        if (component.autoRender !== false) {
          component.render.call(component);
        }

        return component;
      };

      // Set the component name
      Component.componentName = componentName;

      return Component;
    },

    // Utility methods and properties
    utilities: {
      // Check for html5 support
      html5: 'querySelector' in document && 'localStorage' in window && 'addEventListener' in window,

      // These events only have a capture phase, they don't bubble
      captureOnlyEventTypes: { 'blur': true, 'focus': true, 'mouseenter': true, 'mouseleave': true, 'resize': true, 'scroll': true },

      // Parse the HTML string to get 'on-eventtype' attributes. This is used to set up event handlers.
      // This is built for speed, not accuracy. The check won't guarantee it's an attribute. It doesn't
      // hurt to listen to non-existent types and that rarely happens even with the simple regex matcher.
      parseEventTypes: function parseEventTypes(htmlString) {
        // Matches a string like '<button on-click="eventCallback">Send</button>' and returns [' on-click'].
        // We split on the '-' later. JavaScript regex doesn't have lookbehind support to clean this up ahead
        // of time.
        var matches = htmlString.match(/\son-\w+(?==")/g);
        var eventTypes = [];
        if (matches) {
          for (var i = 0; i < matches.length; i++) {
            var eventType = matches[i].split('-').splice(1).join('-');
            if (eventTypes.indexOf(eventType) === -1) eventTypes.push(eventType);
          }
        }
        return eventTypes;
      }
    }
  };

  return Nex;
}));
