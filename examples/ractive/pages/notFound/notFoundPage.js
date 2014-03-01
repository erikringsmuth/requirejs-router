define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      notFoundTemplate = require('text!./notFoundTemplate.html'),
      Layout = require('layouts/basicLayout/layout');

  var NotFoundPage = Ractive.extend({
    template: notFoundTemplate,

    init: function() {
      this.on('teardown', function() {
        console.log('teardown notFoundPage');
      });
    }
  });
  
  return Layout.extend({
    components: { 'content-placeholder': NotFoundPage }
  });
});
