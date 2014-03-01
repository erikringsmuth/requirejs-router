define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      sidebar2Template = require('text!./sidebar2Template.html'),
      Layout = require('layouts/sidebarLayout/layout');

  var Sidebar2Page = Ractive.extend({
    template: sidebar2Template,

    init: function() {
      this.on('teardown', function() {
        console.log('teardown sidebar2Page');
      });
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': Sidebar2Page }
  });
});
