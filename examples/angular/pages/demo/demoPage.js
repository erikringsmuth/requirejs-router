define(function(require) {
  'use strict';
  var angular = require('angular');

  var app = angular.module('app', []);
  app.controller('App1', function ($scope) {
    $scope.greeting = 'Erik';
  });
  angular.bootstrap(document, ['app']);
});
