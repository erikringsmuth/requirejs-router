/*global define*/
/*jshint loopfunc: true*/
define([
  'amd/describe',
  'amd/it',
  'amd/expect',
  'amd/beforeEach',
  'amd/spyOn',
  'router'
], function(describe, it, expect, beforeEach, spyOn, router) {
  'use strict';

  describe('router.config()', function() {
    // Arrange
    spyOn(window, 'addEventListener');

    // Act
    router.config({
      routes: {
        route1: {path: '/example/path'},
        route2: {path: '/second/path'}
      }
    });

    // Assert
    it('should add routes to the router', function() {
      expect(router.routes.route1).toBeDefined();
      expect(router.routes.route1.path).toEqual('/example/path');
      expect(router.routes.route2).toBeDefined();
      expect(router.routes.route2.path).toEqual('/second/path');
    });

    it('should set up event listeners'/*, function() {
      // Jasmine has problems spying on `window.addEventListener`
      expect(window.addEventListener).toHaveBeenCalled();
    }*/);
  });

  describe('router.routeLoadedCallback()', function() {
    it('should throw an exception if you don\'t implement it', function() {
      expect(router.routeLoadedCallback).toThrow();
    });
  });

  describe('router.loadCurrentRoute()', function() {
    // Arrange
    var mockUrl = 'http://domain.com/example/path?queryParam=true';
    var mockRouteArguments = {queryParam: true};
    var MockModule = function() {};

    beforeEach(function() {
      router.config({
        routes: {
          route1: {path: '/first/path', moduleId: 'firstModule'},
          route2: {path: '/second/path', moduleId: 'secondModule'},
          route3: {path: '/third/path', moduleId: 'thirdModule'}
        }
      });
      spyOn(router, 'testRoute').and.callFake(function(route) { return route.path === '/second/path'; });
      spyOn(router, 'currentUrl').and.returnValue(mockUrl);
      spyOn(router, 'routeArguments').and.returnValue(mockRouteArguments);
      spyOn(router, 'routeLoadedCallback');
      spyOn(window, 'require').and.callFake(function() {
        // This part of the test isn't precise since it's completely replacing the anonymouse require callback. There's no other
        // way to do this so this will have to do.
        router.routeLoadedCallback.call(router, MockModule, router.routeArguments(router.routes.route2, router.currentUrl()));
      });

      // Act
      router.loadCurrentRoute();
    });
    
    // Assert
    it('should call router.testRoute(route) until it finds the matching route', function() {
      expect(router.testRoute.calls.count()).toEqual(2);
      expect(router.testRoute.calls.argsFor(0)[0]).toBe(router.routes.route1);
      expect(router.testRoute.calls.argsFor(1)[0]).toBe(router.routes.route2);
    });

    it('should mark the active route as active', function() {
      expect(router.activeRoute).toBe(router.routes.route2);
      expect(router.routes.route2.active).toEqual(true);
    });

    it('should call RequireJS to load the module for the active route', function() {
      expect(window.require.calls.argsFor(0)[0]).toEqual(['secondModule']);
    });

    it('should get the route arguments', function() {
      expect(router.currentUrl).toHaveBeenCalled();
      expect(router.routeArguments.calls.argsFor(0)).toEqual([router.routes.route2, mockUrl]);
    });

    it('should call router.routeLoadedCallback(module, routeArguments) when it\'s done loading the route\'s module', function() {
      expect(router.routeLoadedCallback.calls.argsFor(0)).toEqual([MockModule, mockRouteArguments]);
    });
  });

  describe('router.urlChangeEventHandler()', function() {
    it('should call loadCurrentRoute()', function() {
      // Arrange
      spyOn(router, 'loadCurrentRoute');

      // Act
      router.urlChangeEventHandler();

      // Assert
      expect(router.loadCurrentRoute).toHaveBeenCalled();
    });
  });

  describe('router.currentUrl()', function() {
    it('should return get the current URL from the address bar', function() {
      // Act
      var actual = router.currentUrl();

      // Assert
      expect(actual).toEqual(window.location.href);
    });
  });

  describe('router.urlPath(url)', function() {
    it('should return the path on a url without a hash or search', function() {
      var url = 'http://domain.com/example/path';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should return the path on a url with a search', function() {
      var url = 'http://domain.com/example/path?queryParam=true';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should return the path on a url with a hash', function() {
      var url = 'http://domain.com/example/path#hash';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should return the hash path if it exists', function() {
      var url = 'http://domain.com/#/example/path';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should correctly ignore the query parameters when a hash path exists', function() {
      var url = 'http://domain.com/#/example/path?queryParam=true';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should return the hashbang path if it exists', function() {
      var url = 'http://domain.com/#!/example/path?queryParam=true';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should correctly ignore the query parameters when a hashbang path exists', function() {
      var url = 'http://domain.com/#!/example/path?queryParam=true';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should correctly ignore the hash and return the path if it\'s not a hash path', function() {
      var url = 'http://domain.com/example/path?queryParam2=false#notHashPath';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should return the hash path when there is both a path and a hash path', function() {
      var url = 'http://domain.com/other/path?queryParam2=false#/example/path?queryParam1=true';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should return the hashbang path when there is both a path and a hashbang path', function() {
      var url = 'http://domain.com/other/path?queryParam2=false#!/example/path?queryParam1=true';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });

    it('should ignore an additional hash after a hashpath', function() {
      var url = 'http://domain.com/other/path?queryParam2=false#!/example/path?queryParam1=true#secondHash';
      var result = router.urlPath(url);
      expect(result).toEqual('/example/path');
    });
  });

  describe('router.testRoute(route)', function() {
    it('should return true on an exact match', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({path: '/example/path'});
      expect(result).toEqual(true);
    });
    
    it('should return true when matching with a wildcard', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({path: '/example/*'});
      expect(result).toEqual(true);
    });
    
    it('should return true when matching with a path argument', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({path: '/:patharg/path'});
      expect(result).toEqual(true);
    });
    
    it('should return true when matching on a combination of wildcards and path arguments', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({path: '/*/:patharg'});
      expect(result).toEqual(true);
    });
    
    it('should always return true when matching on "*"', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({path: '*'});
      expect(result).toEqual(true);
    });
    
    it('should not match when one path has a trailing \'/\' but the other doesn\'t', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({path: '/example/route/'});
      expect(result).toEqual(false);
    });
    
    it('should return false if the route path does not have the same number of path segments as the URL path', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({path: '/example/route/longer'});
      expect(result).toEqual(false);
    });
    
    it('should ignore the real path and use the hash path if it exists', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({path: '/other/route'});
      expect(result).toEqual(false);
    });

    it('should match a regex pattern', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({ path: /^\/\w+\/\w+/i });
      expect(result).toEqual(true);
    });

    it('should not match a regex pattern that doesn\'t match', function() {
      spyOn(router, 'urlPath').and.returnValue('/example/path');
      var result = router.testRoute({ path: /^\/\w+\//i });
      expect(result).toEqual(true);
    });
  });

  describe('router.routeArguments(route, url)', function() {
    it('should parse string query parameters', function() {
      var route = {path: '/example/path'};
      var url = 'http://domain.com/example/path?queryParam=example%20string';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual('example string');
    });

    it('should parse boolean query parameters', function() {
      var route = {path: '/example/path'};
      var url = 'http://domain.com/example/path?queryParam=true';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual(true);
    });

    it('should parse number query parameters', function() {
      var route = {path: '/example/path'};
      var url = 'http://domain.com/example/path?queryParam=12.34';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual(12.34);
    });

    it('should get the query parameter from the hash path if it exists', function() {
      var route = {path: '/example/path'};
      var url = 'http://domain.com/other/path?queryParam=wrong#!/example/path?queryParam=correct';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual('correct');
    });

    it('should correctly get a query param with an equals sign in the value', function() {
      var route = {path: '/example/path'};
      var url = 'http://domain.com/other/path?queryParam=wrong#!/example/path?queryParam=some=text';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual('some=text');
    });

    it('should get the query param if it\'s followed by a hash', function() {
      var route = {path: '/example/path'};
      var url = 'http://domain.com/other/path?queryParam=true#hash';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual(true);
    });

    it('should parse string path parameters', function() {
      var route = {path: '/person/:name'};
      var url = 'http://domain.com/person/jon?queryParam=true';
      var result = router.routeArguments(route, url);
      expect(result.name).toEqual('jon');
    });

    it('should parse number path parameters', function() {
      var route = {path: '/customer/:id'};
      var url = 'http://domain.com/customer/123?queryParam=true';
      var result = router.routeArguments(route, url);
      expect(result.id).toEqual(123);
    });

    it('should parse complicated URLs', function() {
      var route = {path: '/customer/:id'};
      var url = 'http://domain.com/customer/123?queryParam=false#!/customer/456?queryParam=true&queryParam2=some%20string';
      var result = router.routeArguments(route, url);
      expect(result.id).toEqual(456);
      expect(result.queryParam).toEqual(true);
      expect(result.queryParam2).toEqual('some string');
    });

    it('should parse the query parameters if no route is specified', function() {
      var route = null;
      var url = 'http://domain.com/?queryParam=true';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual(true);
    });

    it('should parse the query parameters if no route path is specified', function() {
      var route = {};
      var url = 'http://domain.com/?queryParam=true';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual(true);
    });

    it('should not add an empty string value when the search is empty', function() {
      var route = {};
      var url = 'http://domain.com/';
      var result = router.routeArguments(route, url);
      expect(result.hasOwnProperty('')).toBeFalsy();
    });

    it('won\'t blow up on a regex path', function() {
      var route = { path: /^\/\w+\/\d+/i };
      var url = 'http://domain.com/customer/123?queryParam=true';
      var result = router.routeArguments(route, url);
      expect(result.queryParam).toEqual(true);
    });
  });
});
