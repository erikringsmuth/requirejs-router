define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      homeTemplate = require('text!./homeTemplate.html'),
      Layout = require('js/searchLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var layout = new Layout({
        el: selector
      });

      var Home = Ractive.extend({
        template: homeTemplate,

        init: function() {
          this.on('teardown', function() {
            console.log('teardown homePage');
          });
        }
      });

      new Home({
        el: layout.contentPlaceholder
      });
    }
  };
});
