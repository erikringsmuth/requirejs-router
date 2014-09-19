/*global define*/
/*jshint loopfunc: true*/
define([
  'amd/describe',
  'amd/it',
  'amd/expect',
  'amd/beforeEach',
  'amd/spyOn',
  'amd/createSpy',
  'router'
], function(describe, it, expect, beforeEach, spyOn, createSpy, router) {
  'use strict';

  describe('router.init(options)', function() {
    beforeEach(function() {
      // Arrange
      spyOn(window, 'addEventListener');
      spyOn(router, 'on');
      spyOn(router, 'fire');
    });

    it('should set up event listeners'/*, function() {
      // Jasmine has problems spying on `window.addEventListener`
      expect(window.addEventListener).toHaveBeenCalled();
    }*/);

    it('should set up an event handler to call loadCurrentRoute on statechange events', function() {
      // Act
      router.init();

      // Assert
      expect(router.on).toHaveBeenCalled();
      expect(router.on.calls.argsFor(0)[0]).toEqual('statechange');
    });

    it('should not set up an event handler to call loadCurrentRoute on statechange events if the option is turned off', function() {
      // Act
      router.init({loadCurrentRouteOnStateChange: false});

      // Assert
      expect(router.on).not.toHaveBeenCalled();
    });

    it('should fire the initial statechange event to load the current route', function() {
      // Act
      router.init();

      // Assert
      expect(router.fire).toHaveBeenCalled();
      expect(router.fire.calls.argsFor(0)).toEqual(['statechange']);
    });

    it('should not fire the initial statechange event to load the current route if the option is turned off', function() {
      // Act
      router.init({triggerInitialStateChange: false});

      // Assert
      expect(router.fire).not.toHaveBeenCalled();
    });
  });

  describe('router.registerRoutes(routes)', function() {
    it('should add routes to the router', function() {
      // Arrange
      var routes = {
        route1: {path: '/example/path'},
        route2: {path: '/second/path'}
      };

      // Act
      router.registerRoutes(routes);

      // Assert
      expect(router.routes.route1).toBeDefined();
      expect(router.routes.route1.path).toEqual('/example/path');
      expect(router.routes.route2).toBeDefined();
      expect(router.routes.route2.path).toEqual('/second/path');
    });

    it('should add additional routes to the router', function() {
      // Arrange
      var routes = {
        route1: {path: '/new/route1'},
        route3: {path: '/third/path'}
      };

      // Act
      router.registerRoutes(routes);

      // Assert
      expect(router.routes.route1.path).toEqual('/new/route1');
      expect(router.routes.route2.path).toEqual('/second/path');
      expect(router.routes.route3.path).toEqual('/third/path');
    });
  });

  describe('router.on(eventName, eventHandler)', function() {
    // Arrange
    var testCallback = createSpy('testCallback');

    // Act
    router.on('testevent', testCallback);

    // Assert
    it('should set up the event handler so that it is called when the event is triggered', function() {
      router.fire('testevent');
      expect(testCallback).toHaveBeenCalled();
    });
  });

  describe('router.fire(eventName, arg1, arg2, ...)', function() {
    // Arrange
    var testCallback = createSpy('testCallback');
    router.on('testevent', testCallback);

    // Act
    router.fire('testevent', 'firstArg', 'secondArg');

    // Assert
    it('should call all eventName callbacks with the event args', function() {
      expect(testCallback).toHaveBeenCalled();
      expect(testCallback.calls.argsFor(0)).toEqual(['firstArg', 'secondArg']);
    });
  });

  describe('router.off(eventName, eventHandler)', function() {
    // Arrange
    var testCallback = createSpy('testCallback');
    router.on('testevent', testCallback);

    // Act
    router.off('testevent', testCallback);
    router.fire('testevent', 'firstArg', 'secondArg');

    // Assert
    it('should un-register the event handler', function() {
      expect(testCallback).not.toHaveBeenCalled();
    });
  });

  describe('router.loadCurrentRoute()', function() {
    // Arrange
    var mockRouteArguments = {queryParam: true};
    var MockModule = function() {};

    beforeEach(function() {
      router.registerRoutes({
        route1: {path: '/first/path', moduleId: 'firstModule'},
        route2: {path: '/second/path', moduleId: 'secondModule'},
        route3: {path: '/third/path', moduleId: 'thirdModule'}
      });

      spyOn(router, 'testRoute').and.callFake(function(route) { return route.path === '/second/path'; });
      spyOn(router, 'routeArguments').and.returnValue(mockRouteArguments);
      spyOn(router, 'fire');
      spyOn(window, 'require').and.callFake(function() {
        // This part of the test isn't precise since it's completely replacing the anonymouse require callback. There's no other
        // way to do this so this will have to do.
        router.fire('routeload', MockModule, router.routeArguments(router.routes.route2, window.location.href));
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

    it('should mark the matched route as active', function() {
      expect(router.activeRoute).toBe(router.routes.route2);
      expect(router.routes.route2.active).toEqual(true);
    });

    it('should call RequireJS to load the module for the active route', function() {
      expect(window.require.calls.argsFor(0)[0]).toEqual(['secondModule']);
    });

    it('should get the route arguments', function() {
      expect(router.routeArguments.calls.argsFor(0)).toEqual([router.routes.route2, window.location.href]);
    });

    it('should call router.fire(\'routeload\', module, routeArguments) when it\'s done loading the route\'s module', function() {
      expect(router.fire).toHaveBeenCalled();
      expect(router.fire.calls.argsFor(0)).toEqual(['routeload', MockModule, mockRouteArguments]);
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

  describe('router.testRoute(route, [url])', function() {
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

    it('should consider a value like 00123 a string not a number', function() {
      var route = {path: '/customer/:id'};
      var url = 'http://domain.com/customer/00123?queryParam=true';
      var result = router.routeArguments(route, url);
      expect(result.id).toEqual('00123');
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
