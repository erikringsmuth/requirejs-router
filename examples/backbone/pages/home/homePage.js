define(function(require) {
  'use strict';
  var Backbone = require('backbone'),
      _ = require('underscore'),
      homeTemplate = require('text!./homeTemplate.html'),
      Layout = require('layouts/basicLayout/layout'),
      utilities = require('utilities');

  var HomePage = Backbone.View.extend({
    template: _.template(homeTemplate),

    render: function() {
      this.$el.html(this.template(this));
      utilities.formatCode(this.el);
      return this;
    }
  });

  return Layout.extend({
    content: HomePage
  });
});
