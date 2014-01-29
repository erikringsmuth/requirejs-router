## RequireJS Router
> A scalable, lazy loading, AMD router.

The RequireJS Router lazy loads your modules as you navigate to each page. You're site could contain 10MB of Javascript and HTML templates and it would only load the 10KB needed for the current page.

## Configuration

Here's an example `main.js` using the RequireJS Router to run your app.
```js
define([], function() {
  'use strict';

  // Configure require.js paths and shims
  require.config({
    paths: {
      'text': 'bower_components/requirejs-text/text',
      'router': 'bower_components/requirejs-router/router'
    }
  });

  // Load the router
  require(['router'], function(router) {
    router.config({
      // Define all of your routes here
      routes: {
        // matches an exact path
        home: {path: '/home', moduleId: 'home/homeView'},
        
        // matches using a wildcard
        customer: {path: '/customer/*', moduleId: 'customer/customerView'},
        
        // matches using a path variable
        order: {path: '/orders/:id', moduleId: 'order/orderView'},
        
        // matches '/this' or '/that'
        eitherOr: {testRoute: function() { return router.testRoute({path: '/this'}) || router.testRoute({path: '/that'}); }, moduleId: 'other/otherView'}},

        // matches a pattern like '/word/number'
        regex: {path: /^\/\w+\/\d+/i, moduleId: 'regex/regexView'}},

        // matches everything else
        notFound: {path: '*', moduleId: 'notFound/notFoundView'}
      },

      // When a route loads, render the view and attach it to the document
      routeLoadedCallback: function routeLoadedCallback(module, routeArguments) {
        var body = document.querySelector('body');
        body.innerHTML = '';
        body.appendChild(new module(routeArguments).outerEl);
      }
    });

    // Trigger the initial page load
    router.loadCurrentRoute();
  });
});
```

## Router Properties
- `router.config()` - Configure the router
- `router.routes` - The routes
- `router.loadCurrentRoute()` - Tells the router to load the module for the current route
- `router.routeLoadedCallback(module, routeArguments)` - Called when the route's AMD module finishes loading
- `router.routeArguments(route, url)` - Gets the path variables and query parameter values
- `router.urlPath(url)` - Returns the hash path if it exists otherwise returns the normal path
- `router.activeRoute` - A reference to the active route - ex: `{path: '/home', moduleId: 'home/homeView'}`
- `router.testRoute(route)` - Test if the route matches the current URL
- `router.currentUrl()` - Gets the current URL from the address bar. You can mock this when unit testing.
- `router.urlChangeEventHandler()` - Called when a hashchange or popstate event is triggered. This calls `router.loadCurrentRoute()`.

## routes
A route has 4 properties
- `path` (string) - The URL path
- `moduleId` (string) - The AMD module ID
- `testRoute()` (function) - Optionally use this to write custom route matchers
- `active` (boolean) - indicates if it's the active route

A simple route object would look like this `{path: '/home', moduleId: 'home/homeView'}`. When you navigate to `/home` it will load the `home/homeView` module.

### route.path
- The simplest path is an exact match like `/home`.
- You can use wildcards to match a segment of a path. For example `/customer/*/name` will match `/customer/123/name`.
- You can use path variables to match a segment of a path. For example `/customer/:id/name` will match `/customer/123/name`. This will set `routeArguments.id = 123` in the `routeLoadedCallback(module, routeArguments)`.
- You can use a regular expression to do awesome pattern matching. For example `/^\/\w+\/\d+/i` will match a pattern like `/word/number`.
- The catch-all path `'*'` will match everything. This is generally used to load a "Not Found" view.

### route.moduleId
This is the AMD module ID. This is the ID you would use in a `require` or `define` statement like `require(['moduleId'], function(module) {})`.

### route.testRoute()
If you need more control over your route matching you can override `route.testRoute()` to specify your own logic. This is useful if you need to check for an either-or case or use regex to test complicated paths.

### route.active
Indicates if it's the active route. `true` if it's the active route, `false` otherwise.

## loadCurrentRoute()
Tells the router to load the module for the current route. Use this to trigger the initial page load. This will also get called by the `urlChangeEventHandler()` any time a hashchange or popstate event is triggered.

## routeLoadedCallback(module, routeArguments)
Called when the route's AMD module finishes loading. Use this to render the view and attach it to the document. The module and route arguments will be passed as arguments. Implement this function in the router config. A simple function like this will do everything you need.

```js
function routeLoadedCallback(module, routeArguments) {
  var body = document.querySelector('body');
  body.innerHTML = '';
  body.appendChild(new module(routeArguments).outerEl);
}
```

## routeArguments(route, url)

Route arguments contain path variables and query parameters. For example:
```js
// This route and URL
var route = {path: '/customer/:id'};
var url = 'http://domain.com/customer/123?orderBy=descending&filter=true';

var routeArguments = router.routeArguments(route, url);

// Will result in these route arguments
routeArguments = {
  id: 123,
  orderBy: 'descending',
  filter: true
};
```

The route arguments are parsed into their boolean, numeric, or decoded string formats.

## urlPath(url)
Routes are first compared against the hash path (a hash starting in `#/` or `#!/`) and fall back to the regular path if no hash path exists. This allows one set of routes to work with both hashchange and HTML5 pushState. When a hashchange, popstate, or page load occures the router will find the first matching route and load that module.

For example, these URLs all have this path `/example/path`.
- `http://domain.com/example/path?queryParam=true`
- `http://domain.com/#/example/path?queryParam=true`
- `http://domain.com/#!/example/path?queryParam=true`
- `http://domain.com/other/path?queryParam2=false#/example/path?queryParam=true`

The 4th URL example ignores the normal path and query parameters since it has a hash path.

## activeRoute
A reference to the active route. Example: `{path: '/home', moduleId: 'home/homeView'}`

## testRoute(route)
Compares the route against the current URL. Returns `true` if it matches, `false` otherwise.

## currentUrl()
Gets the current URL from the address bar. You can mock this when unit testing.

## urlChangeEventHandler()
Called when a hashchange or popstate event is triggered. This calls `router.loadCurrentRoute()`. You can override this if you need a hook to do something before `loadCurrentRoute()` is called.

## How to use
There is only one instance of the router. Using RequireJS to load the router in multiple modules will always load the same router.

There are two ways MV* frameworks handle routing and rendering. You can have `main.js` render your layout view (header, footer, etc.) then use the router to load the content view and insert it into the layout. This is the top-down approach.

Alternatively you can have `main.js` directly load the content view and have the content view inject the layout and attach it to itself. This is the bottom-up IoC approach.

### IoC approach
Example framework: [nex-js](http://erikringsmuth.github.io/nex-js/)

Here's an example ineraction:

1. The user clicks a link in the header `<li><a href="#/order">Orders</a></li>`
2. A hashchange event is triggered and is intercepted by the router which loads the `'order/orderView'` module
3. The router calls the `routeLoadedCallback(module, routeArguments)` with `OrderView` being passed in as the module
4. Your `routeLoadedCallback(module, routeArguments)` callback renders the `OrderView` which injects and renders it's `layoutView` and attaches it to the document

You're done. The layout is re-rendered with the "Orders" link marked as active and the content section populated with a new `OrderView`.

Look at the `main.js` configuration at the top of this document for an example setup.

### Top-down approach
Example framework: [Backbone.js](http://backbonejs.org/)

Here's an example ineraction:

1. The user clicks a link in the header `<li><a href="#/order">Orders</a></li>`
2. A hashchange event is triggered and is intercepted by the `urlChangeEventHandler()`
3. Override the `urlChangeEventHandler()` to call `layoutView.render()` which draws your header, footer, and an empty main-content section. At this point the header has the "Orders" link marked as active `<li class="active"><a href="#/order">Orders</a></li>`.
4. The last step in `layoutView.render()` calls `router.loadCurrentRoute()` which uses RequireJS to load the `'order/orderView'` module
5. When the module finishes loading the `routeLoadedCallback(module, routeArguments)` is called with `OrderView` being passed in as the module
6. Your `routeLoadedCallback(module, routeArguments)` creates a new instance of `OrderView`, renders it, and attaches it to the layoutView's main-content section

You're done. The layoutView is re-rendered with the header links updated and the main-content section populated with a new `OrderView`.

Here's an example router and layout view setup with the top-down approach.
```js
var LayoutView = Backbone.View.extend({
  // Draw the header, footer, and an empty main-content section
  render: function() {
    this.$el.html(this.template({model: this.model}));

    // Tell the router to load the current route, this calls `router.routeLoadedCallback()` when it's done
    router.loadCurrentRoute();
    return this;
  }
});

// Create one instance of your layout for your entire site
var layoutView = new LayoutView();

router.config({
  routes: {
    home: {path: '/', moduleId: 'home/homeView'},
    order: {path: '/order', moduleId: 'order/orderView'},
    notFound: {path: '*', moduleId: 'notFound/notFoundView'}
  },

  // Re-render the layout before loading the current route's module
  urlChangeEventHandler: function urlChangeEventHandler() {
    layoutView.render.call(layoutView);
  },

  // Called when the route's module finishes loading
  routeLoadedCallback: function routeLoadedCallback(module, routeArguments) {
    // Attach the child view to the layoutView's main-content section
    var mainContent = layoutView.el.querySelector('#content');
    mainContent.innerHTML = '';
    mainContent.appendChild(new module(routeArguments).render().el);
  }
});

// Trigger the initial page load
router.loadCurrentRoute();
```

The top-down approach is more involved than the IoC approach and ties you to one layout view for your site. This works in most cases but the IoC approach almost completely decouples the view rendering from the routing.

## Demo Site
The RequireJS Router was written alongside [nex-js](http://erikringsmuth.github.io/nex-js/). The site's source is available in the [gh-pages branch of nex-js](https://github.com/erikringsmuth/nex-js/tree/gh-pages). The router is configured in [/js/main.js](https://github.com/erikringsmuth/nex-js/blob/gh-pages/js/main.js). Both nex-js and the RequireJS Router are licensed under MIT.

## Install
[Download](https://github.com/erikringsmuth/requirejs-router/archive/master.zip) or run `bower install requirejs-router` in node.

## Build [![Build Status](https://travis-ci.org/erikringsmuth/requirejs-router.png?branch=master)](https://travis-ci.org/erikringsmuth/requirejs-router)
- In node.js
- Run `npm install` to install dependencies
- Run `gulp` to lint and minify your code. This will also watch for changes.

## Running Tests
Open `/tests/AmdSpecRunner.html` and make sure all tests pass. The tests are written using Jasmine.
