define(function(require) {
  'use strict';
  var Nex = require('nex'),
      Handlebars = require('handlebars'),
      sidebar1Template = require('text!./sidebar1Template.html'),
      Layout = require('layouts/sidebarLayout/layout');

  return Nex.defineComponent('sidebar1-page', {
    template: Handlebars.compile(sidebar1Template),
    layout: Layout
  });
});
