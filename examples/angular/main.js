define([], function() {
  'use strict';

  // Configure require.js paths and shims
  require.config({
    paths: {
      'text': 'bower_components/requirejs-text/text',
      'router': 'bower_components/requirejs-router/router',
      'angular': 'bower_components/angular/angular',
      'utilities': '../common/utilities',
      'prettify': 'bower_components/google-code-prettify/src/prettify'
    },
    shim: {
      'angular': { exports: 'angular' }
    }
  });

  // Load the router
  require(['router'], function(router) {
    router
      .registerRoutes({
         // matches '/', '/examples/angular/' (both localhost), or '/requirejs-router/examples/angular/' (gh-pages server)
        home: { path: /^\/(requirejs-router\/)?(examples\/angular\/)?$/i, moduleId: 'pages/home/homePage' },
        demo: { path: '/demo/:pathArg1', moduleId: 'pages/demo/demoPage' },
        sidebar1: { path: '/sidebar1', moduleId: 'pages/sidebar1/sidebar1Page' },
        sidebar2: { path: '/sidebar2', moduleId: 'pages/sidebar2/sidebar2Page' },
        notFound: { path: '*', moduleId: 'pages/notFound/notFoundPage' }
      })
      .on('routeload', function onRouteLoad(controller) {
        // Swap the body with the controller's layout and template
        document.querySelector('body').innerHTML = controller.layout;
        document.querySelector('content-placeholder').innerHTML = controller.template;
      })
      .init(); // Set up event handlers and trigger the initial page load
  });
});
