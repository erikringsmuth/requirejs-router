define(function(require) {
  'use strict';
  var Ractive = require('Ractive'),
      downloadTemplate = require('rv!./downloadTemplate'),
      Layout = require('layouts/layout/layout'),
      utilities = require('utilities');

  var HomePage = Ractive.extend({
    template: downloadTemplate,

    init: function() {
      utilities.formatCode(this.el);
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': HomePage }
  });
});
