define(function(require) {
  'use strict';
  var Ractive     = require('ractive'),
      apiTemplate = require('rv!./apiTemplate'),
      Layout      = require('layouts/layout/layout'),
      utilities   = require('utilities');

  var HomePage = Ractive.extend({
    template: apiTemplate,

    init: function() {
      utilities.formatCode(this.el);
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': HomePage }
  });
});
