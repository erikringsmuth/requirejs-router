define(function(require) {
  'use strict';
  var Backbone = require('backbone'),
      _ = require('underscore'),
      demoTemplate = require('text!./demoTemplate.html'),
      Layout = require('layouts/basicLayout/layout'),
      router = require('router');

  var DemoPage = Backbone.View.extend({
    template: _.template(demoTemplate),

    model: {},

    render: function() {
      this.model.routeArguments = router.routeArguments();
      this.$el.html(this.template(this));
      this.$el.find('#route-arguments').html(JSON.stringify(this.model.routeArguments, null, 2));
      return this;
    }
  });

  return Layout.extend({
    content: DemoPage
  });
});
