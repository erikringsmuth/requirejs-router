define(function(require) {
  'use strict';
  var app       = require('app'),
      template  = require('text!./homeTemplate.html'),
      Layout    = require('layouts/basicLayout/layout');

  app.controller('HomeController', ['$scope', function ($scope) {
    //app.attach(template, $scope, 'HomeController');
    $scope.greeting = 'Erik';
  }]);

  return template;
});
