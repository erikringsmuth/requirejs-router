define(function(require) {
  'use strict';
  var Backbone = require('backbone'),
      _ = require('underscore'),
      notFoundTemplate = require('text!./notFoundTemplate.html'),
      Layout = require('layouts/basicLayout/layout');

  return Backbone.View.extend({
    template: _.template(notFoundTemplate),

    render: function() {
      this.$el.html(this.template(this));
      return this;
    }
  });
});
