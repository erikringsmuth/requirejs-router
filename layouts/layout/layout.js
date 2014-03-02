define(function(require) {
  'use strict';
  var Ractive = require('Ractive'),
      layoutTemplate = require('text!./layoutTemplate.html'),
      router = require('router');

  return Ractive.extend({
    template: layoutTemplate,

    data: {
      routes: router.routes
    }
  });
});
