define(function(require) {
  'use strict';
  var app       = require('app'),
      template  = require('text!./demoTemplate.html'),
      Layout    = require('layouts/basicLayout/layout'),
      router    = require('router');

  app.controller('DemoController', ['$scope', function ($scope) {
    $scope.routeArguments = router.routeArguments();
  }]);

  return {
    layout: Layout.template,
    template: template
  };
});
