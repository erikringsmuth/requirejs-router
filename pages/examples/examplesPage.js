define(function(require) {
  'use strict';
  var Ractive           = require('ractive'),
      examplesTemplate  = require('rv!./examplesTemplate'),
      Layout            = require('layouts/layout/layout'),
      utilities         = require('utilities');

  var ExamplesPage = Ractive.extend({
    template: examplesTemplate,

    init: function() {
      utilities.formatCode(this.el);
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': ExamplesPage }
  });
});
