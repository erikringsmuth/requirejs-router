define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      sidebar2Template = require('text!./sidebar2Template.html'),
      Layout = require('layouts/sidebarLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var layout = new Layout({
        el: selector
      });

      var Home = Ractive.extend({
        template: sidebar2Template,

        init: function() {
          this.on('teardown', function() {
            console.log('teardown sidebar2Page');
          });
        }
      });

      new Home({
        el: layout.contentPlaceholder
      });
    }
  };
});
