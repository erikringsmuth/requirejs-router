define([], function() {
  'use strict';

  // Configure require.js paths and shims
  require.config({
    paths: {
      'text': 'bower_components/requirejs-text/text',
      'router': 'bower_components/requirejs-router/router',
      'nex': 'bower_components/nex-js/nex',
      'handlebars': 'bower_components/handlebars/handlebars',
      'utilities': '../common/utilities',
      'prettify': 'bower_components/google-code-prettify/src/prettify'
    },
    shim: {
      'handlebars': {
        exports: 'Handlebars'
      }
    }
  });

  // Load the router
  require(['router'], function(router) {
    router
      .registerRoutes({
         // matches '/', '/examples/nex/' (both localhost), or '/requirejs-router/examples/nex/' (gh-pages server)
        home: { path: /^\/(requirejs-router\/)?(examples\/nex\/)?$/i, moduleId: 'pages/home/homePage' },
        demo: { path: '/demo/:pathArg1', moduleId: 'pages/demo/demoPage' },
        sidebar1: { path: '/sidebar1', moduleId: 'pages/sidebar1/sidebar1Page' },
        sidebar2: { path: '/sidebar2', moduleId: 'pages/sidebar2/sidebar2Page' },
        notFound: { path: '*', moduleId: 'pages/notFound/notFoundPage' }
      })
      .on('routeload', function onRouteLoad(View, routeArguments) {
        // When a route loads, render the view and attach it to the document
        new View(routeArguments).attachTo('body');
      })
      .init(); // Set up event handlers and trigger the initial page load
  });
});
