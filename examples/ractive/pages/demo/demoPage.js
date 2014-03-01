define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      demoTemplate = require('text!./demoTemplate.html'),
      Layout = require('layouts/basicLayout/layout'),
      router = require('router');

  var DemoPage = Ractive.extend({
    template: demoTemplate,

    init: function() {
      this.set('routeArguments', router.routeArguments());

      this.on('teardown', function() {
        console.log('teardown demoPage');
      });
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': DemoPage }
  });
});
