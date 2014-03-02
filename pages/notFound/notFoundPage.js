define(function(require) {
  'use strict';
  var Ractive = require('Ractive'),
      notFoundTemplate = require('rv!./notFoundTemplate'),
      Layout = require('layouts/layout/layout');

  var NotFoundPage = Ractive.extend({
    template: notFoundTemplate
  });
  
  return Layout.extend({
    components: { 'content-placeholder': NotFoundPage }
  });
});
