define(function(require) {
  'use strict';
  var Backbone = require('backbone'),
      _ = require('underscore'),
      demoTemplate = require('text!./demoTemplate.html'),
      Layout = require('layouts/basicLayout/layout');

  return Backbone.View.extend({
    template: _.template(demoTemplate),

    initialize: function(options, routeArguments) {
      this.model.routeArguments = routeArguments;
    },

    render: function() {
      this.$el.html(this.template(this));
      this.$el.find('#route-arguments').html(JSON.stringify(this.model.routeArguments, null, 2));
      return this;
    }
  });
});
