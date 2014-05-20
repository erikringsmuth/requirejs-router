define(function(require) {
  'use strict';
  var app       = require('app'),
      angular   = require('angular'),
      template  = require('text!./demoTemplate.html'),
      Layout    = require('layouts/basicLayout/layout'),
      router    = require('router');

  app.controller('DemoController', ['$scope', function ($scope) {
    $scope.routeArguments = router.routeArguments();
    $scope.routeArgumentsJson = JSON.stringify($scope.routeArguments, null, 2);
  }]);

  return {
    layout: Layout.template,
    template: template
  };
});
