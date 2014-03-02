define(function(require) {
  'use strict';
  var Nex = require('nex'),
      Handlebars = require('handlebars'),
      notFoundTemplate = require('text!./notFoundTemplate.html'),
      Layout = require('layouts/basicLayout/layout'),
      utilities = require('utilities');

  return Nex.defineComponent('not-found-page', {
    template: Handlebars.compile(notFoundTemplate),

    layout: Layout,

    render: function() {
      this.html(this.template(this));
      utilities.formatCode(this);
      return this;
    }
  });
});
