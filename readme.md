## RequireJS Router
> A scalable, lazy loading, AMD router.

> [erikringsmuth.github.io/requirejs-router](http://erikringsmuth.github.io/requirejs-router/)

The RequireJS Router lazy loads your modules as you navigate to each page. You're site could contain 10MB of Javascript and HTML templates and it would only load the 10KB needed for the current page.

The router works with `hashchange` and HTML5 `pushState`. One set of routes will match regular paths `/`, hash paths `#/`, and hashbang paths `#!/`.

## Configuration

Here's an example `main.js` using the RequireJS Router to run the app.
```js
define([], function() {
  'use strict';

  // Configure require.js paths and shims
  require.config({
    paths: {
      'text': 'bower_components/requirejs-text/text',
      'router': 'bower_components/requirejs-router/router'
    }
  });

  // Load the router
  require(['router'], function(router) {
    router
      .registerRoutes({
        // matches an exact path
        home: { path: '/home', moduleId: 'home/homeView' },
        
        // matches using a wildcard
        customer: { path: '/customer/*', moduleId: 'customer/customerView' },
        
        // matches using a path variable
        order: { path: '/orders/:id', moduleId: 'order/orderView' },
        
        // matches a pattern like '/word/number'
        regex: { path: /^\/\w+\/\d+$/i, moduleId: 'regex/regexView' },
        
        // matches everything else
        notFound: { path: '*', moduleId: 'notFound/notFoundView' }
      })
      .on('routeload', function(module, routeArguments) {
        // When a route loads, render the view and attach it to the document
        var body = document.querySelector('body');
        body.innerHTML = '';
        body.appendChild(new module(routeArguments).outerEl);
      })
      .init(); // Set up event handlers and trigger the initial page load
  });
});
```

## Navigation
There are three ways to trigger a route change. `hashchange`, `popstate`, and a full page load.

#### hashchange
If you're using `hashchange` you don't need to do anything. Clicking a link `<a href="#/new/page">New Page</a>` will fire a `hashchange` event and tell the router to load the new route. You don't need to handle the event in your Javascript.

#### pushState
If you're using HTML5 `pushState` you need one extra step. The `pushState()` method was not meant to change the page, it was only meant to push state into history. This is an "undo" feature for single page applications. To use `pushState()` to navigate to another route you need to call it like this.

```js
history.pushState(stateObj, title, url); // push a new URL into the history stack
history.go(0); // go to the current state in the history stack, this fires a popstate event
```

#### Full page load
You can also do a full page load which will call `router.init()` in `main.js` to load the new route.

## Demo Site
There are a number of demos showing how to route with popular MV* frameworks and libraries here. 
[http://erikringsmuth.github.io/requirejs-router/#/examples](http://erikringsmuth.github.io/requirejs-router/#/examples)

## Install
[Download](https://github.com/erikringsmuth/requirejs-router/archive/master.zip) or run `bower install requirejs-router`.

## Build [![Build Status](https://travis-ci.org/erikringsmuth/requirejs-router.png?branch=master)](https://travis-ci.org/erikringsmuth/requirejs-router)
- Clone `git@github.com:erikringsmuth/requirejs-router.git`
- Run `npm install` to install dependencies
- Run `gulp` to lint and minify your code. This will also watch for changes.

## Running Tests
Open `/tests/AmdSpecRunner.html` and make sure all tests pass.
