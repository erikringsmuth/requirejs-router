define(function(require) {
  'use strict';
  var Ractive         = require('Ractive'),
      layoutTemplate  = require('rv!./layoutTemplate'),
      router          = require('router');

  return Ractive.extend({
    template: layoutTemplate,

    data: {
      routes: router.routes
    }
  });
});
