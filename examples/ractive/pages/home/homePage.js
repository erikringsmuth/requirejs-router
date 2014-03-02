define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      homeTemplate = require('text!./homeTemplate.html'),
      Layout = require('layouts/basicLayout/layout'),
      utilities = require('utilities');

  var HomePage = Ractive.extend({
    template: homeTemplate,

    init: function() {
      utilities.formatCode(this.el);
      this.on('teardown', function() {
        console.log('teardown homePage');
      });
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': HomePage }
  });
});
