define(function(require) {
  'use strict';
  var Nex = require('nex'),
      Handlebars = require('handlebars'),
      sidebar2Template = require('text!./sidebar2Template.html'),
      Layout = require('layouts/sidebarLayout/layout');

  return Nex.defineComponent('home-page', {
    template: Handlebars.compile(sidebar2Template),
    layout: Layout
  });
});
