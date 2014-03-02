define([], function() {
  'use strict';

  // Configure require.js paths and shims
  require.config({
    paths: {
      'text': 'bower_components/requirejs-text/text',
      'router': 'bower_components/requirejs-router/router',
      'backbone': 'bower_components/backbone/backbone',
      'underscore': 'bower_components/underscore/underscore',
      'jquery': 'bower_components/jquery/dist/jquery.min',
      'utilities': '../common/utilities',
      'prettify': 'bower_components/google-code-prettify/src/prettify'
    },
    shim: {
      'jquery': {
        exports: '$'
      },
      'underscore': {
        exports: '_'
      },
      'backbone': {
        deps: ['jquery', 'underscore'],
        exports: 'Backbone'
      }
    }
  });

  // Load the router
  require(['router', 'jquery'], function(router, $) {
    router
      .registerRoutes({
         // matches '/', '/examples/backbone/' (both localhost), or '/requirejs-router/examples/backbone/' (gh-pages server)
        home: { path: /^\/(requirejs-router\/)?(examples\/backbone\/)?$/i, moduleId: 'pages/home/homePage' },
        demo: { path: '/demo/:pathArg1', moduleId: 'pages/demo/demoPage' },
        sidebar1: { path: '/sidebar1', moduleId: 'pages/sidebar1/sidebar1Page' },
        sidebar2: { path: '/sidebar2', moduleId: 'pages/sidebar2/sidebar2Page' },
        notFound: { path: '*', moduleId: 'pages/notFound/notFoundPage' }
      })
      .on('routeload', function onRouteLoad(View, routeArguments) {
        // When a route loads, render the view and attach it to the document
        $('body').html('');
        $('body').append(new View(null, routeArguments).render().el);
      })
      .init(); // Set up event handlers and trigger the initial page load
  });
});
