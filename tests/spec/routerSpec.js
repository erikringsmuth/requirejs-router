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
        route1: {path: '/example/path', module: 'info/infoView'},
        route2: {path: '/example/*', module: 'info/infoView'}
      }
    });

    it('should add a `matchesUrl()` method to every route', function() {
      for (var route in router.routes) {
        expect(router.routes[route].matchesUrl).toBeDefined();
      }
    });
  });

  describe('Calling testRoute()', function() {
    // Arrange
    // These URLs will all have the same path and query parameters
    var urls = [
      'http://domain.com/example/path?queryParam1=true&queryParam2=example%20string',
      'http://domain.com/example/path/?queryParam1=true&queryParam2=example%20string',
      'http://domain.com/#/example/path?queryParam1=true&queryParam2=example%20string',
      'http://domain.com/#!/example/path?queryParam1=true&queryParam2=example%20string',
      'http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string',
      'http://domain.com/other/path?queryParam3=false#!/example/path?queryParam1=true&queryParam2=example%20string'
    ];

    // Test that these routes all match or fail correctly against all of the URLs
    var routes = {
      route1: {path: '/example/path', expectMatch: true, expectMessage: 'should be an exact match on the path.'},
      route2: {path: '/example/*', expectMatch: true, expectMessage: 'should match the path with a wildcard.'},
      route3: {path: '/example/path', queryParameters: ['queryParam2=example%20string'], expectMatch: true, expectMessage: 'should match the path and a query parameter'},
      route4: {queryParameters: ['queryParam1=true', 'queryParam2=example%20string'], expectMatch: true, expectMessage: 'should match the query parameters'},
      route5: {queryParameters: ['queryParam1'], expectMatch: true, expectMessage: 'should match based on the existence of a query parameter'},
      route6: {path: '*', expectMatch: true, expectMessage: 'should match every route.'},
      route7: {path: '/example/path', queryParameters: ['queryParam3=false'], expectMatch: false, expectMessage: 'shouldn\'t match because the query parameter doesn\'t exits.'}
    };

    // Override `router.currentUrl()` to return the test URL instead of the `window.location.href`
    var url = '';
    router.currentUrl = function() { return url; };

    // Act
    // Test every route against every URL
    for (var routeIndex in routes) {
      var route = routes[routeIndex];

      describe('on route ' + JSON.stringify({path: route.path, queryParameters: route.queryParameters}), function() {
        for (var urlIndex in urls) {
          url = urls[urlIndex];

          describe('and URL "' + url, function() {
            it(route.expectMessage, function() {
              var result = router.testRoute(route);
              expect(result).toEqual(route.expectMatch);
            });
          });
        }
      });
    }
  });
});
