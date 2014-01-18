/*global define*/
/*jshint loopfunc: true*/
define([
  'amd/describe',
  'amd/it',
  'amd/expect',
  'router'
], function(describe, it, expect, router) {
  'use strict';

  describe('Configuring the router', function() {
    router.config({
      routes: {
        route1: {path: '/example/path'},
        route2: {path: '/second/path'}
      }
    });

    it('should add a matchesUrl() method to every route', function() {
      for (var route in router.routes) {
        expect(router.routes[route].matchesUrl).toBeDefined();
      }
    });
  });

  describe('Calling urlPath(url) should return "/example/path"', function() {
    // These URLs will all have the same path
    var urls = [
      'http://domain.com/example/path?queryParam=true',
      'http://domain.com/#/example/path?queryParam=true',
      'http://domain.com/#!/example/path?queryParam=true',
      'http://domain.com/example/path?queryParam2=false#notHashPath',
      'http://domain.com/other/path?queryParam2=false#/example/path?queryParam1=true',
      'http://domain.com/other/path?queryParam2=false#!/example/path?queryParam1=true',
      'http://domain.com/other/path?queryParam2=false#!/example/path?queryParam1=true#secondHash'
    ];

    for (var i in urls) {
      (function(url){
        it('for URL ' + url, function() {
          expect(router.urlPath(url)).toEqual('/example/path');
        });
      })(urls[i]);
    }
  });

  describe('Calling testRoute(route)', function() {
    it('with route {path: "/example/path"} and URL "http://domain.com/example/path?queryParam=true" should return true', function() {
      router.currentUrl = function() { return 'http://domain.com/example/path?queryParam=true'; };
      var result = router.testRoute({path: '/example/path'});
      expect(result).toEqual(true);
    });
    
    it('with route {path: "/example/*"} and URL "http://domain.com/example/path?queryParam=true" should return true', function() {
      router.currentUrl = function() { return 'http://domain.com/example/path?queryParam=true'; };
      var result = router.testRoute({path: '/example/*'});
      expect(result).toEqual(true);
    });
    
    it('with route {path: "/:patharg/path"} and URL "http://domain.com/example/path?queryParam=true" should return true', function() {
      router.currentUrl = function() { return 'http://domain.com/example/path?queryParam=true'; };
      var result = router.testRoute({path: '/:patharg/path'});
      expect(result).toEqual(true);
    });
    
    it('with route {path: "/*/:patharg"} and URL "http://domain.com/example/path?queryParam=true" should return true', function() {
      router.currentUrl = function() { return 'http://domain.com/example/path?queryParam=true'; };
      var result = router.testRoute({path: '/*/:patharg'});
      expect(result).toEqual(true);
    });
    
    it('with route {path: "*"} and URL "http://domain.com/example/path?queryParam=true" should return true', function() {
      router.currentUrl = function() { return 'http://domain.com/example/path?queryParam=true'; };
      var result = router.testRoute({path: '*'});
      expect(result).toEqual(true);
    });
    
    it('with route {path: "/example/route/"} and URL "http://domain.com/example/path?queryParam=true" should return false', function() {
      router.currentUrl = function() { return 'http://domain.com/example/path?queryParam=true'; };
      var result = router.testRoute({path: '/example/route/'});
      expect(result).toEqual(false);
    });
    
    it('with route {path: "/example/route/longer"} and URL "http://domain.com/example/path?queryParam=true" should return false', function() {
      router.currentUrl = function() { return 'http://domain.com/example/path?queryParam=true'; };
      var result = router.testRoute({path: '/example/route/longer'});
      expect(result).toEqual(false);
    });
    
    it('with route {path: "/other/route"} and URL "http://domain.com/other/path?queryParam2=false#/example/path?queryParam1=true" should return false', function() {
      router.currentUrl = function() { return 'http://domain.com/other/path?queryParam2=false#/example/path?queryParam1=true'; };
      var result = router.testRoute({path: '/other/route'});
      expect(result).toEqual(false);
    });
  });

  describe('Calling routeArguments(route, url)', function() {
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
  });
});
