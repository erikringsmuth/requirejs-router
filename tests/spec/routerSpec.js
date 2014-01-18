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
        route1: {path: '/some/path'}
      }
    });

    it('should add a `matchesUrl()` method to every route', function() {
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
});
