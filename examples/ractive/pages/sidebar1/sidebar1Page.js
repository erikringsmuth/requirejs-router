define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      sidebar1Template = require('text!./sidebar1Template.html'),
      Layout = require('layouts/sidebarLayout/layout');

  var Sidebar1Page = Ractive.extend({
    template: sidebar1Template,

    init: function() {
      this.on('teardown', function() {
        console.log('teardown sidebar1Page');
      });
    }
  });

  return Layout.extend({
    components: { 'content-placeholder': Sidebar1Page }
  });
});
