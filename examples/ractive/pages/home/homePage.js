define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      homeTemplate = require('text!./homeTemplate.html'),
      Layout = require('layouts/basicLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var home;

      var layout = new Layout({
        el: selector,

        init: function() {
          this.on('teardown', function() {
            home.teardown();
          });
        }
      });

      var Home = Ractive.extend({
        template: homeTemplate,

        init: function() {
          this.on('teardown', function() {
            console.log('teardown homePage');
          });
        }
      });

      home = new Home({
        el: layout.contentPlaceholder
      });
    }
  };
});
