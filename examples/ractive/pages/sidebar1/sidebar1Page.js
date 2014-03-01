define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      sidebar1Template = require('text!./sidebar1Template.html'),
      Layout = require('layouts/sidebarLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var layout = new Layout({
        el: selector
      });

      var Home = Ractive.extend({
        template: sidebar1Template,

        init: function() {
          this.on('teardown', function() {
            console.log('teardown sidebar1Page');
          });
        }
      });

      new Home({
        el: layout.contentPlaceholder
      });
    }
  };
});
