/*global require*/
(function() {
  'use strict';

  require.config({
    paths: {
      'router': '../router'
    }
  });

  require(['router'], function(router) {
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
      route1: {path: '/example/path', module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match the path.'},
      route2: {path: '/example/*', module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match the path with a wildcard.'},
      route3: {path: '/example/path', queryParameters: ['queryParam2=example%20string'], module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match the path and a query parameter'},
      route4: {queryParameters: ['queryParam1=true', 'queryParam2=example%20string'], module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match the query parameters'},
      route5: {queryParameters: ['queryParam1'], module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match based on the existence of a query parameter'},
      route6: {path: '*', module: 'notFound/notFoundView', testShouldMatch: true, testFailMessage: 'the '*' route should match everything.'},
      route7: {path: '/example/path', queryParameters: ['queryParam3=false'], module: 'info/infoView', testShouldMatch: false, testFailMessage: 'shouldn\'t match because the query parameter doesn\'t exits.'}
    };

    var body = document.querySelector('body');

    // Override `router.currentUrl()` to return the test URL instead of the `window.location.href`
    var url = '';
    router.currentUrl = function() { return url; };

    // Act
    // Test every URL against every route
    for (var urlIndex in urls) {
      url = urls[urlIndex];
      body.innerHTML += '<br /><br />URL: ' + url;
      for (var routeIndex in routes) {
        var route = routes[routeIndex];
        var message = 'Path: "' + route.path + '", Query Parameters: ' + JSON.stringify(route.queryParameters);

        // Assert
        if (router.testRoute(route) === route.testShouldMatch) {
          body.innerHTML += '<br />Test succeeded - ' + message;
        } else {
          body.innerHTML += '<br /><span style="color: red;">Test failed - ' + message + '. - ' + route.testFailMessage + '</span>';
        }
      }
    }
  });
})();
