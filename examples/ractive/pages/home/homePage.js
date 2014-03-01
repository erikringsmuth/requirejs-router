define(function(require) {
  'use strict';
  var Ractive = require('ractive'),
      homeTemplate = require('text!./homeTemplate.html'),
      Layout = require('layouts/basicLayout/layout'),
      prettify = require('prettify'),
      utilities = require('utilities'),
      $ = require('jquery');

  return {
    createView: function(selector, routeArguments) {
      var home;

      var layout = new Layout({
        el: selector,

        init: function() {
          this.on('teardown', function() {
            home.teardown();
          });
        }
      });

      var Home = Ractive.extend({
        template: homeTemplate,

        init: function() {
          $.ajax('main.js')
            .done(function(data) {
              this.nodes.mainJs.innerHTML = prettify.prettyPrintOne(data);
            }.bind(this));
          $.ajax('pages/home/homePage.js')
            .done(function(data) {
              this.nodes.homePageJs.innerHTML = prettify.prettyPrintOne(data);
            }.bind(this));
          $.ajax('layouts/basicLayout/layout.js')
            .done(function(data) {
              this.nodes.layoutJs.innerHTML = prettify.prettyPrintOne(data);
            }.bind(this));
          $.ajax('layouts/basicLayout/layoutTemplate.html')
            .done(function(data) {
              this.nodes.layoutHtml.innerHTML = prettify.prettyPrintOne(utilities.escape(data));
            }.bind(this));

          this.on('teardown', function() {
            console.log('teardown homePage');
          });
        }
      });

      home = new Home({
        el: layout.contentPlaceholder
      });
    }
  };
});
