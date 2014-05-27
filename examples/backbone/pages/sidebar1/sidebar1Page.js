define(function(require) {
  'use strict';
  var Backbone          = require('backbone'),
      _                 = require('underscore'),
      sidebar1Template  = require('text!./sidebar1Template.html'),
      Layout            = require('layouts/sidebarLayout/layout');

  var Sidebar1Page = Backbone.View.extend({
    template: _.template(sidebar1Template),

    render: function() {
      this.$el.html(this.template(this));
      return this;
    }
  });

  return Layout.extend({
    content: Sidebar1Page
  });
});
