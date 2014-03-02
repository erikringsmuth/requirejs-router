define(function(require) {
  'use strict';
  var Ractive = require('Ractive'),
      sidebar1Template = require('rv!./sidebar1Template'),
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
