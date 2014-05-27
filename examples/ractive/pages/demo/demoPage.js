define(function(require) {
  'use strict';
  var Ractive       = require('Ractive'),
      demoTemplate  = require('rv!./demoTemplate'),
      Layout        = require('layouts/basicLayout/layout'),
      router        = require('router');

  var DemoPage = Ractive.extend({
    template: demoTemplate,

    init: function() {
      this.set('routeArguments', router.routeArguments());
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': DemoPage }
  });
});
