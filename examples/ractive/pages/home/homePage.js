define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      homeTemplate = require('text!./homeTemplate.html'),
      Layout = require('layouts/basicLayout/layout');

  return {
    createView: function(selector, routeArguments) {
      var layout = new Layout({
        el: selector // Attach the layout to the selector specified in main.js (body)
      });

      var HomePage = Ractive.extend({
        template: homeTemplate,

        init: function() {
          this.on('teardown', function() {
            layout.teardown();
            console.log('teardown homePage');
          });
        }
      });

      return new HomePage({
        el: layout.contentPlaceholder // Attach the home page to the layout
      });
    }
  };
});
