define(function(require) {
  'use strict';
  var Backbone = require('backbone'),
      _ = require('underscore'),
      layoutTemplate = require('text!./layoutTemplate.html'),
      router = require('router');

  return Backbone.View.extend({
    template: _.template(layoutTemplate),

    model: {
      routes: router.routes
    },

    render: function() {
      this.$el.html(this.template(this));
      return this;
    }
  });
});
