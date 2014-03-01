define([], function() {
  'use strict';

  // Configure require.js paths and shims
  require.config({
    paths: {
      'text': 'bower_components/requirejs-text/text',
      'rv': 'bower_components/requirejs-ractive/rv',
      'router': 'bower_components/requirejs-router/router',
      'amd-loader': 'bower_components/requirejs-ractive/amd-loader',
      'ractive': 'bower_components/ractive/Ractive'
    }
  });

  // Load the router
  require(['router'], function(router) {

    var currentView;

    router
      .registerRoutes({
         // matches '/', '/examples/ractive/' (both localhost), or '/requirejs-router/examples/ractive/' (gh-pages server)
        home: { path: /^\/(requirejs-router\/)?(examples\/ractive\/)?$/i, moduleId: 'pages/home/homePage' },
        demo: { path: '/demo/:pathArg1', moduleId: 'pages/demo/demoPage' },
        sidebar1: { path: '/sidebar1', moduleId: 'pages/sidebar1/sidebar1Page' },
        sidebar2: { path: '/sidebar2', moduleId: 'pages/sidebar2/sidebar2Page' },
        notFound: { path: '*', moduleId: 'pages/notFound/notFoundPage' }
      })
      .on('routeload', function onRouteLoad(module, routeArguments) {
        // When a route loads, render the view and attach it to the document
        var render = function() {
          module.createView('body', routeArguments);
          scroll(0, 0);
        };

        if (currentView) {
          currentView.teardown(render);
        } else {
          render();
        }
      })
      .init(); // Set up event handlers and trigger the initial page load
  });
});
