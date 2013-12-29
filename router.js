// RequireJS Router.
//
// Author: Erik Ringsmuth
// Version: 0.1.4
// License: MIT
//
// The router uses `window.location` to determine the active route. You configure routes using the path
// and query parameters. The first matching route is selected as the active route. Hash paths and query
// parameters will also match. If a hash path exists (a hash starting in #/ or #!/) it will ignore the
// regular path and query parameters and match against the hash path and query parameters instead.
//
// Example `window.location`s that will match against the same path and query parameters.
// http://domain.com/example/path?queryParam1=true&queryParam2=example%20string
// http://domain.com/#/example/path?queryParam1=true&queryParam2=example%20string
// http://domain.com/#!/example/path?queryParam1=true&queryParam2=example%20string
// http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string
// http://domain.com/other/path?queryParam3=false#!/example/path?queryParam1=true&queryParam2=example%20string
//
// In all of these cases
// path = '/example/path'
// queryParameters = ['queryParam1=true', 'queryParam2=example%20string']
// 
// The 4th and 5th examples will ignore the normal path and query parameters since a hash path exists.
//
// To match on the path you can either specify the exact string or include wildcards '*' to match sections
// of the path between slashes '/' or the start of the query. To match against the query you specify an array
// of query parameters. When you specify a path and query parameters or multiple query parameters it matches
// against ALL of the options you specify. The one exception is the path '*' which will match everything.
// These are some examples.
// 
// routes: {
//   route1: {path: '/example/path', module: 'info/infoView'}, // matches
//   route2: {path: '/example/*', module: 'info/infoView'}, // matches
//   route3: {path: '/example/path', queryParameters: ['queryParam2=example%20string'], module: 'info/infoView'}, // matches
//   route4: {queryParameters: ['queryParam1=true', 'queryParam2=example%20string'], module: 'info/infoView'}, // matches
//   route5: {path: '*', module: 'notFound/notFoundView'}, // matches everything - this route would typically be used to load a 404 page
//   route6: {path: '/example/*' queryParameters: ['queryParam3=false'], module: 'info/infoView'} // doesn't match - the query parameter fails the match
// }
//
// API
//
// There is only one instance of the router. Using RequireJS to load the router in multiple modules will
// always load the same router.
//
// Here's an example of loading and configuring the router followed by triggering the initial page load.
// This effectively runs your app.
//
// require(['router'], function(router) {
//   router.config({
//     routes: {
//       root: {path: '/', module: 'info/infoView'},
//       api: {path: '/api', module: 'api/apiView'},
//       example: {path: '/example', module: 'example/exampleView'},
//       notFound: {path: '*', module: 'notFound/NotFoundView'}
//     },
//
//     routeLoadedCallback: function routeLoadedCallback(View) {
//       var body = document.querySelector('body');
//       body.innerHTML = null;
//       body.appendChild(new View().render().outerEl);
//     }
//   }).loadCurrentRoute();
// });
//
// Router properties:
// router.config() - configure the router
// router.routes - all defined routes
// router.routeLoadedCallback(Module) - called when RequireJS finishes loading a module for a route
// router.loadCurrentRoute() - triggers RequireJS to load the module for the current route
// router.currentRoute() - the current route (ex: {path: '/', module: 'info/infoView', matches: function() { /** Returns true or false */ }})
// router.uriChangeEventHandler() - called when a hashchange or popstate event is triggered and calls router.loadCurrentRoute()
// router.testRoute(windowLocation, route) - determines if the path and queryParameters match the URI
// router.routes.*.matches() - each route has this method to determine if the route matches the window location

/*global define, require, console*/
/*jshint loopfunc: true*/
define([], function() {
  'use strict';

  // There can only be one instance of the router
  var router = {
    // router.config() - configure the router
    //
    // Example
    // router.config({
    //   routes: {
    //     root: {path: '/', module: 'info/infoView'},
    //     api: {path: '/api', module: 'api/apiView'},
    //     example: {path: '/example', module: 'example/exampleView'},
    //     notFound: {path: '*', module: 'notFound/NotFoundView'}
    //   },
    //   routeLoadedCallback: function(Module) { /** create an instance of the view, render it, and attach it to the document */ }
    // })
    config: function config(properties) {
      // Copy properties from the properties
      for (var property in properties) {
        router[property] = properties[property];
      }

      // router.routes - all defined routes
      //
      // Example
      // {
      //   root: {path: '/', module: 'info/infoView'},
      //   api: {path: '/api', module: 'api/apiView'},
      //   example: {path: '/example', module: 'example/exampleView'},
      //   notFound: {path: '*', module: 'notFound/NotFoundView'}
      // }
      if (typeof(router.routes) === 'undefined') {
        router.routes = {};
      }

      // router.uriChangeEventHandler() - called when a hashchange or popstate event is triggered and calls router.loadCurrentRoute()
      if (typeof(router.uriChangeEventHandler) === 'undefined') {
        router.uriChangeEventHandler = function uriChangeEventHandler() {
          router.loadCurrentRoute();
        };
      }

      // router.routeLoadedCallback(Module) - Called when RequireJS finishes loading a module for a route. This takes one parameter which is the module that was loaded.
      if (typeof(router.routeLoadedCallback) === 'undefined') {
        router.routeLoadedCallback = function routeLoadedCallback() {
          console.log('`Router.routeLoadedCallback()` has not been implemented.');
        };
      }

      // router.routes.*.matches() - each route has this method to determine if the route matches the window location
      for (var routeName in router.routes) {
        (function(route) {
          route.matches = function matches() {
            return router.testRoute(window.location, route);
          };
        })(router.routes[routeName]);
      }

      // Set up the window hashchange and popstate event listeners
      // Todo: use event listeners compatible with IE8-
      window.addEventListener('hashchange', router.uriChangeEventHandler);
      window.addEventListener('popstate', router.uriChangeEventHandler);

      return router;
    },

    // router.testRoute(windowLocation, route) - determines if the path and queryParameters match the URI
    testRoute: function testRoute(windowLocation, route) {
      // Before we test we need the actual path and search from `window.location`
      var path = windowLocation.pathname;
      var search = windowLocation.search;

      // If it's a hash route we need to get the path and search from the hash
      var hash = windowLocation.hash;
      var isHashRoute = (hash.substring(0, 2) === '#/') ? true : false;
      var isHashBangRoute = (hash.substring(0, 3) === '#!/') ? true : false;
      if (isHashRoute || isHashBangRoute) {
        var hashSearchParametersIndex = hash.indexOf('?');
        if (hashSearchParametersIndex === -1) {
          // There is no search string in the hash
          search = '';
          if (isHashRoute) {
            path = hash.substring(1);
          } else if (isHashBangRoute) {
            path = hash.substring(2);
          }
        } else {
          // There is a search string in the hash
          search = hash.substring(hashSearchParametersIndex);
          if (isHashRoute) {
            path = hash.substring(1, hashSearchParametersIndex);
          } else if (isHashBangRoute) {
            path = hash.substring(2, hashSearchParametersIndex);
          }
        }
      }

      // All set, ready to test
      // Check the path. If the route path is undefined, '*', or an exact match then we don't need to check anything else on the path.
      if (typeof(route.path) !== 'undefined' && route.path !== '*' && route.path !== path) {
        // Look for wildcards
        if (route.path.indexOf('*') === -1) {
          // no wildcards
          return false;
        }
        var pathSegments = path.split('/');
        var routePathSegments = route.path.split('/');
        if (pathSegments.length !== routePathSegments.length) {
          return false;
        }
        for (var i in routePathSegments) {
          if (routePathSegments[i] !== pathSegments[i] && routePathSegments[i] !== '*') {
            // The path segment didn't match and it wasn't a wildcard
            return false;
          }
        }
      }

      // Check the query parameters
      for (var queryParameterIndex in route.queryParameters) {
        if (search.indexOf(route.queryParameters[queryParameterIndex]) === -1) {
          return false;
        }
      }

      return true;
    },

    // router.currentRoute() - the current route (ex: {path: '/', module: 'info/infoView', matches: function() { /** Returns true or false */ }})
    currentRoute: function currentRoute() {
      for (var i in router.routes) {
        var route = router.routes[i];
        if (router.testRoute(window.location, route)) {
          return route;
        }
      }
      return null;
    },

    // router.loadCurrentRoute() - triggers RequireJS to load the module for the current route
    loadCurrentRoute: function loadCurrentRoute() {
      var route = router.currentRoute();
      if (route !== null) {
        require([route.module], router.routeLoadedCallback, router.notFoundCallback);
      }
      return router;
    }
  };

  // Return the router
  return router;
});
