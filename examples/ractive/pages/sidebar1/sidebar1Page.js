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

      var Sidebar1Page = Ractive.extend({
        template: sidebar1Template,

        init: function() {
          this.on('teardown', function() {
            layout.teardown();
            console.log('teardown sidebar1Page');
          });
        }
      });

      return new Sidebar1Page({
        el: layout.contentPlaceholder
      });
    }
  };
});
