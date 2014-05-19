define(function(require) {
  'use strict';
  var app       = require('app'),
      template  = require('text!./layoutTemplate.html'),
      router    = require('router');

  app.controller('BasicLayoutController', ['$scope', function ($scope) {
    //app.attach(template, $scope, 'body');
    $scope.routes = router.routes;
  }]);

  return template;
});
