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
      routes: {}
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
      'http://domain.com/example/path?queryParam1=true&queryParam2=example%20string&queryParam3=12.34&queryParam4',
      'http://domain.com/example/path/?queryParam1=true&queryParam2=example%20string&queryParam3=12.34&queryParam4',
      'http://domain.com/#/example/path?queryParam1=true&queryParam2=example%20string&queryParam3=12.34&queryParam4',
      'http://domain.com/#!/example/path?queryParam1=true&queryParam2=example%20string&queryParam3=12.34&queryParam4',
      'http://domain.com/other/path?queryParam5=false#/example/path?queryParam1=true&queryParam2=example%20string&queryParam3=12.34&queryParam4',
      'http://domain.com/other/path?queryParam5=false#!/example/path?queryParam1=true&queryParam2=example%20string&queryParam3=12.34&queryParam4'
    ];

    // Test that these routes all match or fail correctly against all of the URLs
    var routes = {
      route1: {path: '/example/path', expectMatch: true, expectedPathArguments: {queryParam1: true, queryParam2: 'example string', queryParam3: 12.43}, expectMessage: 'should be an exact match on the path.'},
      
      route2: {path: '/example/*', expectMatch: true, expectedPathArguments: {queryParam1: true, queryParam2: 'example string', queryParam3: 12.43}, expectMessage: 'should match the path with a wildcard.'},
      
      route3: {path: '/example/path', queryParameters: ['queryParam2=example%20string'], expectMatch: true, expectedPathArguments: {queryParam1: true, queryParam2: 'example string', queryParam3: 12.43}, expectMessage: 'should match the path and a query parameter'},
      
      route4: {queryParameters: ['queryParam1=true', 'queryParam2=example%20string'], expectMatch: true, expectedPathArguments: {queryParam1: true, queryParam2: 'example string', queryParam3: 12.43}, expectMessage: 'should match the query parameters'},
      
      route5: {queryParameters: ['queryParam1'], expectMatch: true, expectedPathArguments: {queryParam1: true, queryParam2: 'example string', queryParam3: 12.43}, expectMessage: 'should match based on the existence of a query parameter'},
      
      route6: {path: '*', expectMatch: true, expectedPathArguments: {queryParam1: true, queryParam2: 'example string', queryParam3: 12.43}, expectMessage: 'should match every route.'},
      
      route7: {path: '/example/path', queryParameters: ['queryParam5=false'], expectMatch: false, expectMessage: 'shouldn\'t match because the query parameter doesn\'t exits on the hash route.'},
      
      route8: {path: '/:patharg/path', expectMatch: true, expectedPathArguments: {queryParam1: true, queryParam2: 'example string', queryParam3: 12.43, patharg: 'example'}, expectMessage: 'should match and set the path argument'},

      route9: {path: '/:patharg1/:patharg2', queryParameters: ['queryParam3=12.34'], expectMatch: true, expectedPathArguments: {queryParam1: true, queryParam2: 'example string', queryParam3: 12.43, patharg1: 'example', patharg2: 'path'}, expectMessage: 'should match on two path arguments'},

      route10: {queryParameters: ['queryParam2=example'], expectMatch: false, expectMessage: 'shouldn\'t match because the query parameter is only a parial match'},

      route11: {queryParameters: ['queryParam4=example'], expectMatch: false, expectMessage: 'shouldn\'t match because the URL query parameter doesn\'t have a value'}
    };

    // Override `router.currentUrl()` to return the test URL instead of the `window.location.href`
    var url = '';
    router.currentUrl = function() { return url; };

    // Act
    // Test every route against every URL
    for (var routeIndex in routes) {
      (function(route) {
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
      })(routes[routeIndex]);
    }
  });
});
