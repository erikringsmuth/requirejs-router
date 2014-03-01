define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      demoTemplate = require('text!./demoTemplate.html'),
      Layout = require('layouts/basicLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var layout = new Layout({
        el: selector
      });

      var DemoPage = Ractive.extend({
        template: demoTemplate,

        data: {
          routeArguments: routeArguments
        },

        init: function() {
          this.on('teardown', function() {
            layout.teardown();
            console.log('teardown demoPage');
          });
        }
      });

      return new DemoPage({
        el: layout.contentPlaceholder
      });
    }
  };
});
