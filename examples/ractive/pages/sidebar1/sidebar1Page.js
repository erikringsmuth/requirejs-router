define(function(require) {
  'use strict';
  var Ractive           = require('ractive'),
      sidebar1Template  = require('rv!./sidebar1Template'),
      Layout            = require('layouts/sidebarLayout/layout');

  var Sidebar1Page = Ractive.extend({
    template: sidebar1Template
  });

  return Layout.extend({
    components: { 'content-placeholder': Sidebar1Page }
  });
});
