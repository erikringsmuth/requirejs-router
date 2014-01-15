// RequireJS Router.
//
// Version: 0.1.8
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
    //   routeLoadedCallback: function(module) { /** create an instance of the view, render it, and attach it to the document */ }
    // })
    config: function config(properties) {
      // Copy properties from the config object - this extends the router
      for (var property in properties) {
        router[property] = properties[property];
      }

      // router.routes.*.matchesUrl() - each route has this method to determine if the route matches the URL
      //
      // You can override this with your own function to do a custom matcher.
      for (var routeName in router.routes) {
        (function(route) {
          if (typeof(route.matchesUrl) === 'undefined') {
            route.matchesUrl = function matchesUrl() {
              return router.testRoute(route);
            };
          }
        })(router.routes[routeName]);
      }

      // Set up the window hashchange and popstate event listeners
      if (window.addEventListener) {
        window.addEventListener('hashchange', router.urlChangeEventHandler, false);
        window.addEventListener('popstate', router.urlChangeEventHandler, false);
      } else {
        // IE 8 and lower
        window.attachEvent('hashchange', router.urlChangeEventHandler);
        window.attachEvent('popstate', router.urlChangeEventHandler);
      }

      return router;
    },

    // router.routes - all defined routes
    //
    // Example
    // {
    //   root: {path: '/', module: 'info/infoView'},
    //   api: {path: '/api', module: 'api/apiView'},
    //   example: {path: '/example', module: 'example/exampleView'},
    //   notFound: {path: '*', module: 'notFound/NotFoundView'}
    // }
    routes: {},

    // router.routeLoadedCallback(module) - Called when RequireJS finishes loading a module for a route. This takes one parameter which is the module that was loaded.
    routeLoadedCallback: function routeLoadedCallback() {
      console.log('`router.routeLoadedCallback(module)` has not been implemented.');
    },

    // router.loadCurrentRoute() - triggers RequireJS to load the module for the current route
    loadCurrentRoute: function loadCurrentRoute() {
      var route = router.currentRoute();
      if (route !== null) {
        require([route.module], router.routeLoadedCallback);
      }
      return router;
    },

    // router.testRoute(route) - determines if the route matches the current URL
    testRoute: function testRoute(route) {
      var urlProperties = parseUrl(router.currentUrl());
      var path = urlProperties.path;
      var search = urlProperties.search;

      // All checks are for fail cases. If nothing fails then we return true at the end.
      //
      // Example URL = 'http://domain.com/#/example/path?queryParam1=true&queryParam2=example%20string'
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

    // router.urlChangeEventHandler() - called when a hashchange or popstate event is triggered and calls router.loadCurrentRoute()
    urlChangeEventHandler: function urlChangeEventHandler() {
      router.loadCurrentRoute();
    },

    // router.currentUrl() - gets the current URL from the address bar. You can override this when unit testing.
    currentUrl: function currentUrl() {
      return window.location.href;
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
    }
  };

  // Private variables and methods

  // parseUrl(url) - parses the url to get the path and search
  //
  // Example URL = 'http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string'
  // returns {
  //   path = '/example/path',
  //   search = '?queryParam1=true&queryParam2=example%20string'
  // }
  //
  // The URL must contain the leading 'protocol://'. We can't rely on `window.location.path` and `window.location.search`
  // because IE implemented it differently than other browsers.
  var parsedUrlCache = {};
  var parseUrl = function parseUrl(url) {
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
  };

  // Return the router
  return router;
});
