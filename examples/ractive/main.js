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
        home: { path: /^\/(requirejs-router\/)?(examples\/ractive\/)?$/i, moduleId: 'js/home/homePage' },

        // matches using a path variable
        demo: { path: '/demo/:pathArg1', moduleId: 'js/demo/demoPage' },

        // Info about the library or framework
        about: { path: '/about', moduleId: 'js/about/aboutPage' },

        // All other routes
        notFound: { path: '*', moduleId: 'js/notFound/notFoundPage' }
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
