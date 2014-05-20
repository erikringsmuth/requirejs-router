define(function(require) {
  'use strict';
  var app       = require('app'),
      template  = require('text!./layoutTemplate.html'),
      router    = require('router');

  app.controller('SidebarLayoutController', ['$scope', function ($scope) {
    $scope.routes = router.routes;
  }]);

  return { template: template };
});
