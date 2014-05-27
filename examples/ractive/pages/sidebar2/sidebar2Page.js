define(function(require) {
  'use strict';
  var Ractive           = require('ractive'),
      sidebar2Template  = require('rv!./sidebar2Template'),
      Layout            = require('layouts/sidebarLayout/layout');

  var Sidebar2Page = Ractive.extend({
    template: sidebar2Template
  });

  return Layout.extend({
    components: { 'content-placeholder': Sidebar2Page }
  });
});
