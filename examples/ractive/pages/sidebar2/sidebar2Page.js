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

      var Sidebar2Page = Ractive.extend({
        template: sidebar2Template,

        init: function() {
          this.on('teardown', function() {
            layout.teardown();
            console.log('teardown sidebar2Page');
          });
        }
      });

      return new Sidebar2Page({
        el: layout.contentPlaceholder
      });
    }
  };
});
