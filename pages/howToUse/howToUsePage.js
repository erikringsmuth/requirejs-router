define(function(require) {
  'use strict';
  var Ractive = require('Ractive'),
      howToUseTemplate = require('rv!./howToUseTemplate'),
      Layout = require('layouts/layout/layout'),
      utilities = require('utilities');

  var HomePage = Ractive.extend({
    template: howToUseTemplate,

    init: function() {
      utilities.formatCode(this.el);
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': HomePage }
  });
});
