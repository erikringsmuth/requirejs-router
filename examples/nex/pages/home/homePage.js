define(function(require) {
  'use strict';
  var Nex           = require('nex'),
      Handlebars    = require('handlebars'),
      homeTemplate  = require('text!./homeTemplate.html'),
      Layout        = require('layouts/basicLayout/layout'),
      utilities     = require('utilities');

  return Nex.defineComponent('home-page', {
    template: Handlebars.compile(homeTemplate),

    layout: Layout,

    render: function() {
      this.html(this.template(this));
      utilities.formatCode(this);
      return this;
    }
  });
});
