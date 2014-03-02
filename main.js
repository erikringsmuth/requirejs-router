define([], function() {
  'use strict';

  // Configure require.js paths and shims
  require.config({
    paths: {
      'text': 'bower_components/requirejs-text/text',
      'rv': 'bower_components/requirejs-ractive/rv',
      'router': 'bower_components/requirejs-router/router',
      'amd-loader': 'bower_components/requirejs-ractive/amd-loader',
      'Ractive': 'bower_components/ractive/Ractive',
      'utilities': 'examples/common/utilities',
      'prettify': 'bower_components/google-code-prettify/src/prettify'
    }
  });

  // Load the router
  require(['router'], function(router) {

    // Keep track of the currently loaded view so we can run teardown before loading the new view
    var view;

    router
      .registerRoutes({
         // matches '/' (localhost) or '/requirejs-router/' (gh-pages server)
        home: { path: /^\/(requirejs-router\/)?$/i, moduleId: 'pages/home/homePage' },
        examples: { path: '/examples', moduleId: 'pages/examples/examplesPage' },
        demo: { path: '/demo', moduleId: 'pages/demo/demoPage' },
        notFound: { path: '*', moduleId: 'pages/notFound/notFoundPage' }
      })
      .on('routeload', function onRouteLoad(View) {
        // When a route loads, render the view and attach it to the document
        var render = function() {
          view = new View({ el: 'body' });
        };

        if (view) {
          view.teardown(render);
        } else {
          render();
        }
      })
      .init(); // Set up event handlers and trigger the initial page load
  });
});
