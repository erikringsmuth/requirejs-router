// RequireJS Router.
//
// Author: Erik Ringsmuth
// Version: 0.1.4
// License: MIT

/*global define, require, console*/
/*jshint loopfunc: true*/
define([], function() {
  'use strict';

  // Cache parsed URLs
  var parsedUrlCache = {};

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
      // Copy properties from the config object
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

      // router.urlChangeEventHandler() - called when a hashchange or popstate event is triggered and calls router.loadCurrentRoute()
      if (typeof(router.urlChangeEventHandler) === 'undefined') {
        router.urlChangeEventHandler = function urlChangeEventHandler() {
          router.loadCurrentRoute();
        };
      }

      // router.routeLoadedCallback(Module) - Called when RequireJS finishes loading a module for a route. This takes one parameter which is the module that was loaded.
      if (typeof(router.routeLoadedCallback) === 'undefined') {
        router.routeLoadedCallback = function routeLoadedCallback() {
          console.log('`router.routeLoadedCallback(Module)` has not been implemented.');
        };
      }

      // router.routes.*.matchesUrl() - each route has this method to determine if the route matches the URL
      //
      // You can override this with your own function to do a custom matcher.
      for (var routeName in router.routes) {
        (function(route) {
          if (typeof(route.matchesUrl) === 'undefined') {
            route.matchesUrl = function matchesUrl() {
              return router.testRoute(window.location.href, route);
            };
          }
        })(router.routes[routeName]);
      }

      // Set up the window hashchange and popstate event listeners
      // Todo: use event listeners compatible with IE8-
      window.addEventListener('hashchange', router.urlChangeEventHandler);
      window.addEventListener('popstate', router.urlChangeEventHandler);

      return router;
    },

    // router.testRoute(url, route) - determines if the route matches the URL
    testRoute: function testRoute(url, route) {
      var urlProperties = router.parseUrl(url);
      var path = urlProperties.path;
      var search = urlProperties.search;

      // All checks are for fail cases. If nothing fails then we return true at the end.
      //
      // Example URL = 'http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string'
      // path = '/example/path'
      // search = '?queryParam1=true&queryParam2=example%20string'
      //
      // Example route: `exampleRoute: {path: '/example/*', module: 'example/exampleView'}`
      
      // Check the path. If the route path is undefined, '*', or an exact match then the route path is considered a match.
      if (typeof(route.path) !== 'undefined' && route.path !== '*' && route.path !== path) {
        // Look for wildcards
        if (route.path.indexOf('*') === -1) {
          // No wildcards and we already made sure it wasn't an exact match so the test fails
          return false;
        }

        // Example pathSegments = ['', example', 'path']
        var pathSegments = path.split('/');

        // Example routePathSegments = ['', 'example', '*']
        var routePathSegments = route.path.split('/');

        // There must be the same number of path segments or it isn't a match
        if (pathSegments.length !== routePathSegments.length) {
          return false;
        }

        // Check equality of each path segment
        for (var i in routePathSegments) {
          // The path segments must be equal or the route must specify a wildcard segment '*'
          if (routePathSegments[i] !== pathSegments[i] && routePathSegments[i] !== '*') {
            // The path segment wasn't the same string and it wasn't a wildcard
            return false;
          }
        }
      }

      // Check the query parameters
      for (var queryParameterIndex in route.queryParameters) {
        // If the search string contains the queryParameter string then it's a match, otherwise the test fails
        if (search.indexOf(route.queryParameters[queryParameterIndex]) === -1) {
          return false;
        }
      }

      // Nothing failed. The route matches the URL.
      return true;
    },

    // router.parseUrl(url) - parses the url to get the path and search
    //
    // Example URL = 'http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string'
    //
    // The URL must contain the leading 'protocol://'. We can't rely on `window.location` because IE implemented it
    // differently than other browsers.
    parseUrl: function parseUrl(url) {
      // Check the cache to see if we've already parsed this URL
      if (typeof(parsedUrlCache[url]) !== 'undefined') {
        return parsedUrlCache[url];
      }

      // The relative URI is everything after the third slash including the third slash
      // Example relativeUri = '/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string'
      var relativeUri = '/' + url.split('/').splice(3).join('/');

      // The path is everything in the relative URI up to the first ? or #
      // Example path = '/other/path'
      var path = relativeUri;
      if (relativeUri.indexOf('?') !== -1 || relativeUri.indexOf('#') !== -1) {
        path = relativeUri.split(/[\?#]/)[0];
      }

      // The hash is everything from the first # on
      // Example hash = '#/example/path?queryParam1=true&queryParam2=example%20string'
      var hash = '';
      var hashIndex = relativeUri.indexOf('#');
      if (hashIndex !== -1) {
        hash = relativeUri.substring(hashIndex);
      }

      // The search is everything from the first ? up to but not including the first #
      // Example search = '?queryParam3=false'
      var search = '';
      var relativeUriWithoutHash = relativeUri;
      if (hashIndex !== -1) {
        relativeUriWithoutHash = relativeUri.substring(0, hashIndex);
      }
      var searchIndex = relativeUriWithoutHash.indexOf('?');
      if (searchIndex !== -1) {
        search = relativeUriWithoutHash.substring(searchIndex);
      }

      // If it's a hash route we need to get the path and search from the hash
      // Example isHashRoute = true
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
          // Example search = '?queryParam1=true&queryParam2=example%20string'
          search = hash.substring(hashSearchParametersIndex);
          if (isHashRoute) {
            // Example path = '/example/path'
            path = hash.substring(1, hashSearchParametersIndex);
          } else if (isHashBangRoute) {
            path = hash.substring(2, hashSearchParametersIndex);
          }
        }
      }

      // Remove trailing slash from the path for consistency
      if (path.length !== 1 && path[path.length - 1] === '/') {
        path = path.substring(0, path.length - 1);
      }

      // Cache the properties for this URL and return them
      parsedUrlCache[url] = {
        path: path,
        search: search
      };
      return parsedUrlCache[url];
    },

    // router.currentRoute() - the current route (ex: {path: '/', module: 'info/infoView', matchesUrl: function() { /** Returns true or false */ }})
    currentRoute: function currentRoute() {
      for (var i in router.routes) {
        var route = router.routes[i];
        if (route.matchesUrl()) {
          return route;
        }
      }
      return null;
    },

    // router.loadCurrentRoute() - triggers RequireJS to load the module for the current route
    loadCurrentRoute: function loadCurrentRoute() {
      var route = router.currentRoute();
      if (route !== null) {
        require([route.module], router.routeLoadedCallback);
      }
      return router;
    }
  };

  // Return the router
  return router;
});
