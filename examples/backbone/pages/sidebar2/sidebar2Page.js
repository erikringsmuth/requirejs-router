define(function(require) {
  'use strict';
  var Backbone          = require('backbone'),
      _                 = require('underscore'),
      sidebar2Template  = require('text!./sidebar2Template.html'),
      Layout            = require('layouts/sidebarLayout/layout');

  var Sidebar2Page =  Backbone.View.extend({
    template: _.template(sidebar2Template),

    render: function() {
      this.$el.html(this.template(this));
      return this;
    }
  });

  return Layout.extend({
    content: Sidebar2Page
  });
});
