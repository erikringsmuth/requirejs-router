define(function(require) {
  'use strict';
  var Nex = require('nex'),
      Handlebars = require('handlebars'),
      demoTemplate = require('text!./demoTemplate.html'),
      Layout = require('layouts/basicLayout/layout');

  return Nex.defineComponent('demo-page', {
    template: Handlebars.compile(demoTemplate),
    layout: Layout,
    ready: function(routeArguments) {
      this.model.routeArguments = routeArguments;
    },
    render: function() {
      this.html(this.template(this));
      this.querySelector('#route-arguments').innerHTML = JSON.stringify(this.model.routeArguments, null, 2);
      return this;
    }
  });
});
