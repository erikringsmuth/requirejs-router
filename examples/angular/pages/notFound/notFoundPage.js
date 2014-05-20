define(function(require) {
  'use strict';
  var app       = require('app'),
      angular   = require('angular'),
      template  = require('text!./notFoundTemplate.html'),
      Layout    = require('layouts/basicLayout/layout');

  app.controller('NotFoundController', ['$scope', function ($scope) { }]);

  return {
    layout: Layout.template,
    template: template
  };
});
