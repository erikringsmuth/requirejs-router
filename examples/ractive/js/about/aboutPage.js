define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      aboutTemplate = require('text!./aboutTemplate.html'),
      Layout = require('js/simpleLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var layout = new Layout({
        el: selector
      });

      var Home = Ractive.extend({
        template: aboutTemplate,

        init: function() {
          this.on('teardown', function() {
            console.log('teardown aboutPage');
          });
        }
      });

      new Home({
        el: layout.contentPlaceholder
      });
    }
  };
});
