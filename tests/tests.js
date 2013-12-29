/*global require*/
(function() {
  'use strict';

  require.config({
    paths: {
      'router': '../router'
    }
  });

  require(['router'], function(router) {
    var routes = {
      route1: {path: '/example/path', module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match the path.'},
      route2: {path: '/example/*', module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match the path with a wildcard.'},
      route3: {path: '/example/path', queryParameters: ['queryParam2=example%20string'], module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match the path and a query parameter'},
      route4: {queryParameters: ['queryParam1=true', 'queryParam2=example%20string'], module: 'info/infoView', testShouldMatch: true, testFailMessage: 'should match the query parameters'},
      route5: {path: '*', module: 'notFound/notFoundView', testShouldMatch: true, testFailMessage: 'the '*' route should match everything.'},
      route6: {path: '/example/path', queryParameters: ['queryParam3=false'], module: 'info/infoView', testShouldMatch: false, testFailMessage: 'shouldn\'t match because the query parameter doesn\'t exits.'}
    };

    var body = document.querySelector('body');

    var runTest = function testRoute(windowLocation, route) {
      var passed = router.testRoute(windowLocation, route) === route.testShouldMatch;
      var message = 'Path: "' + route.path + '", Query Parameters: ' + JSON.stringify(route.queryParameters);
      if (passed) {
        body.innerHTML += '<br />Test succeeded - ' + message;
      } else {
        body.innerHTML += '<br /><span style="color: red;">Test failed - ' + message + '</span>';
      }
    };

    var windowLocation = {
      href: '',
      pathname: '',
      search: '',
      hash: ''
    };

    // These tests assume the window.location object is consistent across browsers, which it isn't. Hint... IE
    windowLocation = {
      href: 'http://domain.com/example/path?queryParam1=true&queryParam2=example%20string',
      pathname: '/example/path',
      search: '?queryParam1=true&queryParam2=example%20string',
      hash: ''
    };
    body.innerHTML += '<br /><br />Regular path and query parameters<br />Uri: ' + windowLocation.href;
    for (var i in routes) {
      runTest(windowLocation, routes[i]);
    }

    windowLocation = {
      href: 'http://domain.com/#/example/path?queryParam1=true&queryParam2=example%20string',
      pathname: '/',
      search: '',
      hash: '#/example/path?queryParam1=true&queryParam2=example%20string'
    };
    body.innerHTML += '<br /><br />Hash path and query parameters<br />Uri: ' + windowLocation.href;
    for (i in routes) {
      runTest(windowLocation, routes[i]);
    }

    windowLocation = {
      href: 'http://domain.com/#!/example/path?queryParam1=true&queryParam2=example%20string',
      pathname: '/',
      search: '',
      hash: '#!/example/path?queryParam1=true&queryParam2=example%20string'
    };
    body.innerHTML += '<br /><br />Hash bang path and query parameters<br />Uri: ' + windowLocation.href;
    for (i in routes) {
      runTest(windowLocation, routes[i]);
    }

    windowLocation = {
      href: 'http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string',
      pathname: '/other/path',
      search: '?queryParam3=false',
      hash: '#/example/path?queryParam1=true&queryParam2=example%20string'
    };
    body.innerHTML += '<br /><br />Regular path and query parameters with hash path and query parameters<br />Uri: ' + windowLocation.href;
    for (i in routes) {
      runTest(windowLocation, routes[i]);
    }

    windowLocation = {
      href: 'http://domain.com/other/path?queryParam3=false#!/example/path?queryParam1=true&queryParam2=example%20string',
      pathname: '/other/path',
      search: '?queryParam3=false',
      hash: '#!/example/path?queryParam1=true&queryParam2=example%20string'
    };
    body.innerHTML += '<br /><br />Regular path and query parameters with hash bang path and query parameters<br />Uri: ' + windowLocation.href;
    for (i in routes) {
      runTest(windowLocation, routes[i]);
    }
  });
})();
