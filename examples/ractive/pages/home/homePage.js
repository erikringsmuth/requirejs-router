define(function(require) {
  'use strict';
  var Ractive       = require('Ractive'),
      homeTemplate  = require('rv!./homeTemplate'),
      Layout        = require('layouts/basicLayout/layout'),
      utilities     = require('utilities');

  var HomePage = Ractive.extend({
    template: homeTemplate,

    init: function() {
      utilities.formatCode(this.el);
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': HomePage }
  });
});
