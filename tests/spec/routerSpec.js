/*global define*/
/*jshint loopfunc: true*/
define([
  'amd/describe',
  'amd/it',
  'amd/expect',
  'amd/spyOn',
  'router'
], function(describe, it, expect, spyOn, router) {
  'use strict';

  describe('router.config()', function() {
    // Arrange, Act
    router.config({
      routes: {
        route1: {path: '/example/path'},
        route2: {path: '/second/path'}
      }
    });

    it('should add a matchesUrl() method to every route', function() {
      // Assert
      for (var route in router.routes) {
        expect(router.routes[route].matchesUrl).toBeDefined();
      }
    });
  });

  describe('router.loadCurrentRoute()', function() {
    it('should call router.routeLoadedCallback(module, routeArguments) when it\'s done loading the route\'s module', function() {
      // Arrange
      var mockRoute = {path: '/example/path', module: 'example/exampleView'};
      var mockUrl = 'http://domain.com/example/path?queryParam=true';
      var mockRouteArguments = {queryParam: true};
      var MockModule = function() {};
      spyOn(router, 'currentRoute').and.returnValue(mockRoute);
      spyOn(router, 'currentUrl').and.returnValue(mockUrl);
      spyOn(router, 'routeArguments').and.returnValue(mockRouteArguments);
      spyOn(router, 'routeLoadedCallback');
      spyOn(window, 'require').and.callFake(function() {
        // This part of the test isn't precise since it's completely replacing the anonymouse require callback. There's no other
        // way to do this so this will have to do.
        router.routeLoadedCallback.call(router, MockModule, router.routeArguments(mockRoute, mockUrl));
      });

      // Act
      router.loadCurrentRoute();

      // Assert
      expect(router.currentRoute).toHaveBeenCalled();
      expect(router.currentUrl).toHaveBeenCalled();
      expect(window.require.calls.argsFor(0)[0]).toEqual(['example/exampleView']);
      expect(router.routeArguments.calls.argsFor(0)).toEqual([mockRoute, mockUrl]);
      expect(router.routeLoadedCallback.calls.argsFor(0)).toEqual([MockModule, mockRouteArguments]);
    });
  });

  describe('router.currentRoute()', function() {
    it('should return the first route that matches the URL', function() {
      // Arrange
      router.config({
        routes: {
          route1: {path: '/first/path'},
          route2: {path: '/second/path'},
          route3: {path: '/third/path'}
        }
      });
      spyOn(router, 'currentUrl').and.returnValue('http://domain.com/second/path?queryParam=true');

      // Act
      var actual = router.currentRoute();

      // Assert
      expect(actual).toEqual(router.routes.route2);
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
    it('should return window.location.href', function() {
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

    // it('should return true on a route with an optional path where the optional path doesn\'t exist', function() {
    //   router.currentUrl = function() { return 'http://domain.com/example'; };
    //   var result = router.testRoute({path: '/example(/path)'});
    //   expect(result).toEqual(true);
    // });

    // it('should return true on a route with an optional path where the full path exists', function() {
    //   router.currentUrl = function() { return 'http://domain.com/example/path'; };
    //   var result = router.testRoute({path: '/example(/path)'});
    //   expect(result).toEqual(true);
    // });

    // it('should return true on a route with an optional path with a trailing slash where the optional path doesn\'t exist', function() {
    //   router.currentUrl = function() { return 'http://domain.com/example'; };
    //   var result = router.testRoute({path: '/example/(path)'});
    //   expect(result).toEqual(true);
    // });

    // it('should return true on a route with an optional path with a trailing slash where the full path exists', function() {
    //   router.currentUrl = function() { return 'http://domain.com/example/path'; };
    //   var result = router.testRoute({path: '/example/(path)'});
    //   expect(result).toEqual(true);
    // });

    // it('should return true on a route with an optional path argument where the optional path doesn\'t exist', function() {
    //   router.currentUrl = function() { return 'http://domain.com/example'; };
    //   var result = router.testRoute({path: '/example(/:id)'});
    //   expect(result).toEqual(true);
    // });

    // it('should return true on a route with an optional path argument where the full path exists', function() {
    //   router.currentUrl = function() { return 'http://domain.com/example/path'; };
    //   var result = router.testRoute({path: '/example(/:id)'});
    //   expect(result).toEqual(true);
    // });

    // it('should return true when matching on multiple optional paths', function() {
    //   router.currentUrl = function() { return 'http://domain.com/example/path'; };
    //   var result = router.testRoute({path: '/(example)(/:id)'});
    //   expect(result).toEqual(true);
    // });
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

    // it('should parse the path arguments when an optional path exists', function() {
    //   var route = {path: '/example(/path)'};
    //   var url = 'http://domain.com/example?queryParam=true';
    //   var result = router.routeArguments(route, url);
    //   expect(result.queryParam).toEqual(true);
    // });

    // it('should parse the path arguments when an optional path exists', function() {
    //   var route = {path: '/example/(path)'};
    //   var url = 'http://domain.com/example?queryParam=true';
    //   var result = router.routeArguments(route, url);
    //   expect(result.queryParam).toEqual(true);
    // });

    // it('should parse the path arguments in an optional path', function() {
    //   var url = 'http://domain.com/example/123';
    //   var route = {path: '/example(/:id)'};
    //   var result = router.routeArguments(route, url);
    //   expect(result.id).toEqual(123);
    // });

    // it('should parse the path arguments in an optional path with a trailing slash', function() {
    //   var url = 'http://domain.com/example/123';
    //   var route = {path: '/example/(:id)'};
    //   var result = router.routeArguments(route, url);
    //   expect(result.id).toEqual(123);
    // });

    // it('should not populate the optional path argument if it doesn\'t exist', function() {
    //   var url = 'http://domain.com/example';
    //   var route = {path: '/example(/:id)'};
    //   var result = router.routeArguments(route, url);
    //   expect(result.id).toBeUndefined();
    // });

    // it('should parse arguments out of multiple optional paths', function() {
    //   router.currentUrl = function() { return 'http://domain.com/example/123'; };
    //   var result = router.testRoute({path: '/(example)(/:id)'});
    //   expect(result.id).toEqual(123);
    // });
  });
});
