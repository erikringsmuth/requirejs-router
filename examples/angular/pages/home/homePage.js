define(function(require) {
  'use strict';
  var app       = require('app'),
      angular   = require('angular'),
      template  = require('text!./homeTemplate.html'),
      Layout    = require('layouts/basicLayout/layout'),
      utilities = require('utilities');

  app.controller('HomeController', ['$scope', function ($scope) {
    utilities.formatCode(document.querySelector('body'));
  }]);

  return {
    layout: Layout.template,
    template: template
  };
});
