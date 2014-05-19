define(function(require) {
  'use strict';
  var angular = require('angular');

  var app = angular.module('app', []);
  app.run(['$compile', function ($compile) {
    app.attach = function attach(template, scope, el) {
      if (typeof el === 'string') {
        el = document.querySelector(el);
      }
      el.innerHTML = '';
      el.appendChild($compile(template)(scope)[0]);
    };
  }]);

  return app;
});
