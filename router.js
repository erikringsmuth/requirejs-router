// RequireJS Router.
//
// Author: Erik Ringsmuth
// License: MIT

/*global define, require, console*/
/*jshint loopfunc: true*/
define([], function() {
  'use strict';

  // RequireJS constructor.
  //
  // var router = new Router({
  //   routes: {
  //     '': {module: 'info/infoView'},
  //     '#/': {module: 'info/infoView'},
  //     '#/api': {module: 'api/apiView'},
  //     '#/example': {module: 'example/exampleView'}
  //   },
  //   hashChangeEventHandler: function() {},
  //   routeLoadedCallback: function(Module) {},
  //   notFoundCallback: function() {}
  // })
  var Router = function Router(config) {
    // Instance
    var router = this;

    // Copy properties from the config
    for (var property in config) {
      router[property] = config[property];
    }

    // Setup routes like this.
    //
    // {
    //   '': {module: 'info/infoView'},
    //   '#/': {module: 'info/infoView'},
    //   '#/api': {module: 'api/apiView'},
    //   '#/example': {module: 'example/exampleView'}
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

    // Called when a route fails to load. This should be overridden to display a 404 page.
    if (typeof(router.notFoundCallback) === 'undefined') router.notFoundCallback = function notFoundCallback() {
      console.log('`Router.notFoundCallback()` has not been implemented.');
    };

    // Add `isActive()` property to each route
    for (var route in router.routes) {
      (function(route) {
        router.routes[route].isActive = function isActive() {
          if (route === Router.uriHashRoute()) {
            return true;
          }
          return false;
        };
      })(route);
    }

    // Returns the active route
    // Example route `'#/example': {module: 'example/exampleView'}` will return `'#/example'`
    router.activeRoute = function activeRoute() {
      for (var route in router.routes) {
        if (router.routes[route].isActive()) {
          return route;
        }
      }
      return null;
    };

    // Load the active route
    router.loadActiveRoute = function loadActiveRoute() {
      var route = router.activeRoute();
      if (route !== null) {
        require([router.routes[route].module], router.routeLoadedCallback, router.notFoundCallback);
      } else {
        router.notFoundCallback();
      }

      return router;
    };

    // Set up the window hashchange event listener
    window.addEventListener('hashchange', router.hashChangeEventHandler);
  };

  // Static methods

  // The current URI hash path
  // Example URI 'http://host/#/hashroute?hashSearchParam1=true' will return '#/hashroute'
  Router.uriHashRoute = function uriHashRoute() {
    var hash = window.location.hash;
    var searchParametersIndex = hash.indexOf('?');
    if (searchParametersIndex === -1) {
      return hash;
    }
    return hash.substring(0, searchParametersIndex);
  };

  // The current URI search parameters
  // Example URI 'http://host/#/hashroute?hashSearchParam1=true' will return '?hashSearchParam1=true'
  Router.uriHashSearchParameters = function uriHashSearchParameters() {
    var hash = window.location.hash;
    var searchParametersIndex = hash.indexOf('?');
    if (searchParametersIndex === -1) {
      return '';
    }
    return hash.substring(searchParametersIndex);
  };

  // Return the Router
  return Router;
});
