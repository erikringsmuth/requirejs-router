// RequireJS Router - A scalable, lazy loading, AMD router.
//
// Version: 0.2.1
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

/*global define, require, console*/
/*jshint loopfunc: true*/
define([], function() {
  'use strict';

  // Private static variables
  var cachedUrlPaths = {},
      hasBeenInitialized = false;

  // Public interface

  // There can only be one instance of the router
  var router = {
    // router.config() - configure the router
    //
    // Example
    // router.config({
    //   routes: {
    //     root: {path: '/', module: 'home/homeView'},
    //     api: {path: '/api', module: 'api/apiView'},
    //     example: {path: '/customer/:id', module: 'customer/customerView'},
    //     notFound: {path: '*', module: 'notFound/NotFoundView'}
    //   },
    //   routeLoadedCallback: function(module, routeArguments) { /** create an instance of the view, render it, and attach it to the document */ }
    // })
    config: function config(properties) {
      // Copy properties from the config object - this extends the router
      for (var property in properties) {
        router[property] = properties[property];
      }

      // Check and configure each route
      // router.routes.*.matchesUrl() - each route has this method to determine if the route matches the URL
      //
      // You can override this with your own function to do a custom matcher.
      for (var routeName in router.routes) {
        var route = router.routes[routeName];
        if (typeof(route.path) === 'undefined' && typeof(route.matchesUrl) === 'undefined') {
          throw 'Every route must have a path or matchesUrl()';
        }
        if (typeof(route.matchesUrl) === 'undefined') {
          (function(route) {
            route.matchesUrl = function matchesUrl() {
              return router.testRoute(route);
            };
          })(route);
        }
      }

      // Set up the window hashchange and popstate event listeners the first time the router is configured
      if (!hasBeenInitialized) {
        if (window.addEventListener) {
          window.addEventListener('hashchange', router.urlChangeEventHandler, false);
          window.addEventListener('popstate', router.urlChangeEventHandler, false);
        } else {
          // IE 8 and lower
          window.attachEvent('hashchange', router.urlChangeEventHandler);
          window.attachEvent('popstate', router.urlChangeEventHandler);
        }
        hasBeenInitialized = true;
      }

      return router;
    },

    // router.routes - all defined routes
    routes: {},

    // router.routeLoadedCallback(module, routeArguments) - Called when RequireJS finishes loading a module for a route
    routeLoadedCallback: function routeLoadedCallback() {
      console.log('`router.routeLoadedCallback(module)` has not been implemented.');
    },

    // router.loadCurrentRoute() - triggers RequireJS to load the module for the current route
    loadCurrentRoute: function loadCurrentRoute() {
      var route = router.currentRoute();
      if (route !== null) {
        var url = router.currentUrl();
        require([route.module], function(module) {
          router.routeLoadedCallback.call(router, module, router.routeArguments(route, url));
        });
      }
      return router;
    },

    // router.currentRoute() - the current route (ex: {path: '/', module: 'home/homeView', matchesUrl: function() { /** Returns true or false */ }})
    currentRoute: function currentRoute() {
      for (var i in router.routes) {
        var route = router.routes[i];
        if (route.matchesUrl()) {
          return route;
        }
      }
      return null;
    },

    // router.urlChangeEventHandler() - called when a hashchange or popstate event is triggered and calls router.loadCurrentRoute()
    urlChangeEventHandler: function urlChangeEventHandler() {
      router.loadCurrentRoute();
    },

    // router.currentUrl() - gets the current URL from the address bar. You can override this when unit testing.
    currentUrl: function currentUrl() {
      return window.location.href;
    },

    // router.testRoute(route) - determines if the route matches the current URL
    testRoute: function testRoute(route) {
      // This algorithm tries to succeed or fail as quickly as possible.
      //
      // Example path = '/example/path'
      // Example route: `exampleRoute: {path: '/example/*', module: 'example/exampleView'}`
      var path = router.urlPath(router.currentUrl());

      // If the route path is '*', or an exact match then the route path is considered a match
      if (route.path === '*' || route.path === path) {
        return true;
      }

      // Look for wildcards
      if (route.path.indexOf('*') === -1 && route.path.indexOf(':') === -1) {
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
        // The path segments must be equal, be a wildcard segment '*', or be a path parameter like ':id'
        var routeSegment = routePathSegments[i];
        if (routeSegment !== pathSegments[i] && routeSegment !== '*' && routeSegment.charAt(0) !== ':') {
          // The path segment wasn't the same string and it wasn't a wildcard or parameter
          return false;
        }
      }

      // Nothing failed. The route matches the URL.
      return true;
    },

    // router.routeArguments(route, url) - parse the url to get the route arguments
    routeArguments: function routeArguments(route, url) {
      var args = {};
      var path = router.urlPath(url);

      // Example pathSegments = ['', example', 'path']
      var pathSegments = path.split('/');

      // Example routePathSegments = ['', 'example', '*']
      var routePathSegments = [];
      if (route && route.path) {
        routePathSegments = route.path.split('/');
      }

      // Get path variables
      // URL '/customer/123'
      // and route `{path: '/customer/:id'}`
      // gets id = '123'
      for (var segmentIndex in routePathSegments) {
        var routeSegment = routePathSegments[segmentIndex];
        if (routeSegment.charAt(0) === ':') {
          args[routeSegment.substring(1)] = pathSegments[segmentIndex];
        }
      }

      // Get the query parameter values
      // The search is the query parameters including the leading '?'
      var searchIndex = url.indexOf('?');
      var search = '';
      if (searchIndex !== -1) {
        search = url.substring(searchIndex);
        var hashIndex = search.indexOf('#');
        if (hashIndex !== -1) {
          search = search.substring(0, hashIndex);
        }
      }
      // If it's a hash URL we need to get the search from the hash
      var hashPathIndex = url.indexOf('#/');
      var hashBangPathIndex = url.indexOf('#!/');
      if (hashPathIndex !== -1 || hashBangPathIndex !== -1) {
        var hash = '';
        if (hashPathIndex !== -1) {
          hash = url.substring(hashPathIndex);
        } else {
          hash = url.substring(hashBangPathIndex);
        }
        searchIndex = hash.indexOf('?');
        if (searchIndex !== -1) {
          search = hash.substring(searchIndex);
        }
      }

      var queryParameters = search.substring(1).split('&');
      // split() on an empty string has a strange behavior of returning [''] instead of []
      if (queryParameters.length === 1 && queryParameters[0] === '') {
        queryParameters = [];
      }
      for (var i in queryParameters) {
        var queryParameter = queryParameters[i];
        var queryParameterParts = queryParameter.split('=');
        args[queryParameterParts[0]] = queryParameterParts.splice(1).join('=');
      }

      // Parse the arguments into unescaped strings, numbers, or booleans
      for (var arg in args) {
        var value = args[arg];
        if (value === 'true') {
          args[arg] = true;
        } else if (value === 'false') {
          args[arg] = false;
        } else if (!isNaN(value) && value !== '') {
          // numeric
          args[arg] = +value;
        } else {
          // string
          args[arg] = decodeURIComponent(value);
        }
      }

      return args;
    },

    // urlPath(url) - parses the url to get the path
    //
    // This will return the hash path if it exists or return the real path if no hash path exists
    //
    // Example URL = 'http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string'
    // path = '/example/path'
    //
    // Note: The URL must contain the protocol like 'http(s)://'
    urlPath: function urlPath(url) {
      // Check the cache to see if we've already parsed this URL
      if (typeof(cachedUrlPaths[url]) !== 'undefined') {
        return cachedUrlPaths[url];
      }

      // The relative URI is everything after the third slash including the third slash
      // Example relativeUri = '/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string'
      var relativeUri = '/' + url.split('/').splice(3).join('/');

      // The path is everything in the relative URI up to the first ? or #
      // Example path = '/other/path'
      var path = relativeUri.split(/[\?#]/)[0];

      // The hash is everything from the first # up to the the search starting with ? if it exists
      // Example hash = '#/example/path'
      var hashIndex = relativeUri.indexOf('#');
      if (hashIndex !== -1) {
        var hash = relativeUri.substring(hashIndex).split('?')[0];
        if (hash.substring(0, 2) === '#/') {
          // Hash path
          path = hash.substring(1);
        } else if (hash.substring(0, 3) === '#!/') {
          // Hashbang path
          path = hash.substring(2);
        }
      }

      // Cache the path for this URL
      cachedUrlPaths[url] = path;

      return path;
    }
  };

  // Return the router
  return router;
});
