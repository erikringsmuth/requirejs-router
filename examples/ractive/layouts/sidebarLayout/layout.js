define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      layoutTemplate = require('text!./layoutTemplate.html'),
      router = require('router');

  return Ractive.extend({
    template: layoutTemplate,

    contentPlaceholder: '#content-placeholder',

    data: {
      routes: router.routes
    },

    init: function() {
      this.on('teardown', function() {
        console.log('teardown simpleLayout');
      });
    }
  });
});
