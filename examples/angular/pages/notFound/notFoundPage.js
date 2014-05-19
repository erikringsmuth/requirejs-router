define(function(require) {
  'use strict';
  var app       = require('app'),
      template  = require('text!./homeTemplate.html');

  app.controller('HomeController', ['$scope', function ($scope) {
    $scope.greeting = 'Erik';
  }]);

  return template;
});
