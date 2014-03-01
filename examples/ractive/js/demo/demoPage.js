define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      demoTemplate = require('text!./demoTemplate.html'),
      Layout = require('js/searchLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var layout = new Layout({
        el: selector
      });

      var Home = Ractive.extend({
        template: demoTemplate,

        data: {
          routeArguments: routeArguments
        },

        init: function() {
          this.on('teardown', function() {
            console.log('teardown demoPage');
          });
        }
      });

      new Home({
        el: layout.contentPlaceholder
      });
    }
  };
});
