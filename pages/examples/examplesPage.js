define(function(require) {
  'use strict';
  var Ractive = require('Ractive'),
      examplesTemplate = require('rv!./examplesTemplate'),
      Layout = require('layouts/layout/layout');

  var ExamplesPage = Ractive.extend({
    template: examplesTemplate
  });

  return Layout.extend({
    components: { 'content-placeholder': ExamplesPage }
  });
});
