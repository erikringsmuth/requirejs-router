define(function(require) {
  'use strict';
  var Ractive = require('Ractive'),
      demoTemplate = require('rv!./demoTemplate'),
      Layout = require('layouts/layout/layout'),
      router = require('router'),
      utilities = require('utilities');

  var DemoPage = Ractive.extend({
    template: demoTemplate,

    init: function() {
      this.set('routeArguments', router.routeArguments());
      utilities.formatCode(this.el);
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': DemoPage }
  });
});
