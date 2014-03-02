define(function(require) {
  'use strict';
  var Nex = require('nex'),
      Handlebars = require('handlebars'),
      layoutTemplate = require('text!./layoutTemplate.html'),
      router = require('router');

  return Nex.defineComponent('layout', {
    template: Handlebars.compile(layoutTemplate),

    model: {
      routes: router.routes
    }
  });
});
