define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      notFoundTemplate = require('text!./notFoundTemplate.html'),
      Layout = require('js/searchLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var layout = new Layout({
        el: selector
      });

      var Home = Ractive.extend({
        template: notFoundTemplate,

        init: function() {
          this.on('teardown', function() {
            console.log('teardown notFoundPage');
          });
        }
      });

      new Home({
        el: layout.contentPlaceholder
      });
    }
  };
});
