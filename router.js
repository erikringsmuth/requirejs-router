// RequireJS Router.
//
// Author: Erik Ringsmuth
// Version: 0.1.3
// License: MIT

/*global define, require, console*/
/*jshint loopfunc: true*/
define([], function() {
  'use strict';

  // There can only be one instance of the router
  var router = {
    // Configure the router.
    //
    // router.config({
    //   routes: {
    //     '': {module: 'info/infoView'},
    //     '#/': {module: 'info/infoView'},
    //     '#/api': {module: 'api/apiView'},
    //     '#/example': {module: 'example/exampleView'},
    //     'not-found': {module: 'notFound/notFoundView'}
    //   },
    //   hashChangeEventHandler: function() {},
    //   routeLoadedCallback: function(Module) {},
    //   notFoundCallback: function() {}
    // })
    config: function config(properties) {
      // Copy properties from the properties
      for (var property in properties) {
        router[property] = properties[property];
      }

      // Setup routes like this.
      //
      // {
      //   '': {module: 'info/infoView'},
      //   '#/': {module: 'info/infoView'},
      //   '#/api': {module: 'api/apiView'},
      //   '#/example': {module: 'example/exampleView'},
      //   'not-found': {module: 'notFound/notFoundView'}
      // }
      if (typeof(router.routes) === 'undefined') router.routes = {};

      // The default implemenation of the `hashChangeEventHandler()` is to load the active route. You typically would want to
      // override this and call your main view's `render()` method and have `render()` call `loadActiveRoute()` once the main
      // view has rendered the header, footer, and any other common elements.
      if (typeof(router.hashChangeEventHandler) === 'undefined') router.hashChangeEventHandler = function hashChangeEventHandler() {
        router.loadActiveRoute();
      };

      // Called when the route's module has been successfully loaded. This takes one parameter which is the module that was loaded.
      if (typeof(router.routeLoadedCallback) === 'undefined') router.routeLoadedCallback = function routeLoadedCallback() {
        console.log('`Router.routeLoadedCallback()` has not been implemented.');
      };

      // Called when a route fails to load. This will look for the 'not-found' route and load that module.
      if (typeof(router.notFoundCallback) === 'undefined') router.notFoundCallback = function notFoundCallback() {
        require([router.routes['not-found'].module], router.routeLoadedCallback);
      };

      // Add `isActive()` property to each route
      for (var route in router.routes) {
        (function(route) {
          router.routes[route].isActive = function isActive() {
            if (route === router.uriFragmentPath()) {
              return true;
            }
            return false;
          };
        })(route);
      }

      // Set up the window hashchange event listener
      window.addEventListener('hashchange', router.hashChangeEventHandler);

      return router;
    },

    // The current URI fragment (hash) path
    // Example URI 'http://host/#/fragmentpath?fragmentSearchParam1=true' will return '#/fragmentpath'
    uriFragmentPath: function uriFragmentPath() {
      var hash = window.location.hash;
      var searchParametersIndex = hash.indexOf('?');
      if (searchParametersIndex === -1) {
        return hash;
      }
      return hash.substring(0, searchParametersIndex);
    },

    // The current URI fragment (hash) search parameters
    // Example URI 'http://host/#/fragmentpath?fragmentSearchParam1=true' will return '?fragmentSearchParam1=true'
    uriFragmentSearchParameters: function uriFragmentSearchParameters() {
      var hash = window.location.hash;
      var searchParametersIndex = hash.indexOf('?');
      if (searchParametersIndex === -1) {
        return '';
      }
      return hash.substring(searchParametersIndex);
    },

    // Returns the active route
    // Example route `'#/example': {module: 'example/exampleView'}` will return `'#/example'`
    activeRoute: function activeRoute() {
      for (var route in router.routes) {
        if (router.routes[route].isActive()) {
          return route;
        }
      }
      return null;
    },

    // Load the active route
    loadActiveRoute: function loadActiveRoute() {
      var route = router.activeRoute();
      if (route !== null) {
        require([router.routes[route].module], router.routeLoadedCallback, router.notFoundCallback);
      } else {
        router.notFoundCallback();
      }
      return router;
    }
  };

  // Return the router
  return router;
});
