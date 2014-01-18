## RequireJS Router
A scalable, lazy loading, AMD router.

Other frameworks load all of your app's Javascript up front. You can optimize your site by compiling it down to one file but that still doesn't solve the problem. The RequireJS Router lazy loads your modules as you navigate to each page. You're site could contain 10mb of Javascript and HTML templates and it would only load the 10kb needed for the current page.

## Router Properties
- `router.config()` - configure the router
- `router.routes` - all defined routes
- `router.routeLoadedCallback(module, routeArguments)` - called when RequireJS finishes loading a module for a route
- `router.loadCurrentRoute()` - triggers RequireJS to load the module for the current route
- `router.testRoute(route)` - test if the route path and query parameters match the current URL
- `router.urlChangeEventHandler()` - called when a hashchange or popstate event is triggered and calls `router.loadCurrentRoute()`
- `router.currentRoute()` - the current route - ex: `{path: '/', queryParameters: [], module: 'home/homeView', matchesUrl: function() {...}}`
- `router.currentUrl()` - gets the current URL from the address bar. You can mock this when unit testing.
- `router.urlPath(url)` - returns the hash path if it exists otherwise returns the normal path
- `router.routeArguments(route, url)` - creates an object with the path variables and query parameter values

## routes
A route has 3 properties
- `path` (string) - the URL path
- `module` (string) - the path to the RequireJS module
- `matchesUrl()` function - tests the route to see if it matches the current URL

A simple route object would look like this `{path: '/home', module: 'home/homeView'}`. When you navigate to `/home` it will load the `homeView` module.

### route path
- The simplest path is an exact match like `/home`.
- You can use wildcards to match a segment of a path. For example `/customer/*/name` will match `/customer/123/name`.
- You can use path variables to match a segment of a path. For example `/customer/:id/name` will match `/customer/123/name`. This will set `routeArguments.id = 123` in the `routeLoadedCallback(module, routeArguments)`.
- The catch-all path `'*'` will match everything. This is generally used to load a "Not Found" view.

### route matchesUrl()
If you need more control over your route you can override the `route.matchesUrl()` function and specify your own logic. This is useful if you need to check for an either-or case.

### Example routes
```js
routes: {
  // matches an exact path
  route1: {path: '/home', module: 'home/homeView'},
  
  // matches using a wildcard
  route2: {path: '/customer/*', module: 'customer/customerView'},
  
  // matches using a path variable
  route2: {path: '/customer/:id', module: 'customer/customerView'},
  
  // matches everything
  route7: {path: '*', module: 'notFound/notFoundView'}
}
```

## routeLoadedCallback(module, routeArguments)
When a new route is loaded it will call this with the AMD module and the route arguments. Use this method to render the view and attach it to the document.

The route arguments contain path variables and query parameters. For example:
```js
// This route and URL
route = {path: '/customer/:id'};
url = 'http://domain.com/customer/123?orderBy=descending&filter=true';

// Will result in these route arguments
routeArguments = {
  id: 123,
  orderBy: 'descending',
  filter: true
}
```

## loadCurrentRoute()
Use this to trigger the initial page load. This will also get called any time a hashchange or popstate event is triggered.

## urlPath(url)
Routes are first compared against the hash path (a hash starting in `#/` or `#!/`) and fall back to the regular path if no hash path exists. This allows one set of routes to work with hashchange and HTML5 pushState. When a hashchange, popstate, or page load occures the router will find the first matching route and load that module. 

For example, these URLs all have this path `/example/path`.
- `http://domain.com/example/path?queryParam=true`
- `http://domain.com/#/example/path?queryParam=true`
- `http://domain.com/#!/example/path?queryParam=true`
- `http://domain.com/other/path?queryParam2=false#/example/path?queryParam=true`

The 4th URL example ignores the normal path and query parameters since it has a hash path.

## Configuration
There is only one instance of the router. Using RequireJS to load the router in multiple modules will always load the same router.

Here's an example of loading and configuring the router followed by triggering the initial page load. This effectively runs your app.
```js
require(['router'], function(router) {
  router.config({
    routes: {
      // root matches the exact route '/'
      root: {path: '/', module: 'home/homeView'},

      // customer matches a path like '/customer/123'
      customer: {path: '/customer/:id', module: 'customer/customerView'},

      // orders matches a path like '/orders/123'
      orders: {path: '/orders/*', module: 'orders/ordersView'},

      // dev matches '/dev' or '/development'
      dev: {matchesUrl: function matchesUrl() { return router.testRoute({path: '/dev'}) || router.testRoute({path: '/development'}); }, module: 'dev/devView'}},

      // notFound matches everything which is used to load a 404 page
      notFound: {path: '*', module: 'notFound/NotFoundView'}
    },

    // When a route loads, render the view and attach it to the document
    routeLoadedCallback: function routeLoadedCallback(module, routeArguments) {
      var body = document.querySelector('body');
      body.innerHTML = '';
      body.appendChild(new module(routeArguments).render().outerEl);
    }
  });

  // Trigger the initial page load
  router.loadCurrentRoute();
});
```

## How to use
Let's go over the case where your site has a consistent layout (header, footer, etc.) that you want rendered on every page. Let's call this the `layoutView`. When you click a tab in the header it routes to a different page. You need to re-render the `layoutView` to show which tab is now active. There are two main ways to do this. If you use views that support layout views similar to .NET master pages then the set up is simple since you can route directly to the child view. If you use a more classic style of views like Backbone.js then you need a hook to render the layout view before rendering the child view. Let's go over the easy case first.

### Views that support layout views
Example framework: [nex-js](http://erikringsmuth.github.io/nex-js/)

Here's an example ineraction with the example configuration from above:

1. The user clicks a link in the header `<li><a href="#/api">APIs</a></li>`
2. A hashchange event is triggered and is intercepted by the router which loads the `'api/apiView'` module
3. The router calls your `router.routeLoadedCallback(module, routeArguments)` with `ApiView` being passed in as the argument
4. Your `router.routeLoadedCallback(module, routeArguments)` callback renders the `ApiView` which also renders it's `layoutView` and attaches it to the document

You're done. The layoutView is re-rendered with the header links updated and the main-content section populated with a new `ApiView`.

### Views that do not support layout views
Example framework: [Backbone.js](http://backbonejs.org/)

Here's an example ineraction:

1. The user clicks a link in the header `<li><a href="#/api">APIs</a></li>`
2. A hashchange event is triggered and is intercepted by `router.urlChangeEventHandler()`
3. Override `router.urlChangeEventHandler()` to call `layoutView.render()` which draws your header, footer, and an empty main-content section. At this point the header has the "APIs" link marked as active `<li class="active"><a href="#/api">APIs</a></li>`.
4. `layoutView.render()` calls `router.loadCurrentRoute()`
5. `router.loadCurrentRoute()` uses RequireJS to load the `'api/apiView'` module
6. When the module finishes loading `router.routeLoadedCallback(module, routeArguments)` is called with `ApiView` being passed in as the argument
7. `router.routeLoadedCallback(module, routeArguments)` creates a new instance of `ApiView`, renders it and attaches it to the layoutView's main-content section

You're done. The layoutView is re-rendered with the header links updated and the main-content section populated with a new `ApiView`.

Here's an example router and view setup with the classic views.
```js
router.config({
  routes: {
    // root matches the exact route '/'
    root: {path: '/', module: 'home/homeView'},

    // customer matches a path like '/customer/123'
    customer: {path: '/customer/:id', module: 'customer/customerView'},

    // orders matches a path like '/orders/123'
    orders: {path: '/orders/*', module: 'orders/ordersView'},

    // dev matches '/dev' or '/development'
    dev: {matchesUrl: function matchesUrl() { return router.testRoute({path: '/dev'}) || router.testRoute({path: '/development'}); }, module: 'dev/devView'}},

    // notFound matches everything which is used to load a 404 page
    notFound: {path: '*', module: 'notFound/NotFoundView'}
  },

  // The hashchange event handler calls your layout view's render method
  urlChangeEventHandler: function urlChangeEventHandler() {
    layoutView.render.call(layoutView);
  },

  // This gets called when the RequireJS module finishes loading
  routeLoadedCallback: function routeLoadedCallback(module, routeArguments) {
    // Attach the child view to the layoutView's main-content section
    var mainContent = layoutView.el.querySelector('main#content');
    mainContent.innerHTML = '';
    mainContent.appendChild(new module(routeArguments).render().el);
  }
});

// Your view's `render()` method draws the header, footer, and an empty main-content section which the `router.routeLoadedCallback()` method populates
layoutView.render = function render() {
  this.el.innerHTML = this.template({model: this.model});

  // It tells the router to finish loading the current route after it's rendered the layout
  this.router.loadCurrentRoute();
  return this;
}
```

## Demo Site
The RequireJS Router was written alongside [nex-js](http://erikringsmuth.github.io/nex-js/). The site's source is available in the [gh-pages branch of nex-js](https://github.com/erikringsmuth/nex-js/tree/gh-pages). The router is configured in [/js/main.js](https://github.com/erikringsmuth/nex-js/blob/gh-pages/js/main.js) and [/js/routes.js](https://github.com/erikringsmuth/nex-js/blob/gh-pages/js/routes.js). Both nex-js and the RequireJS Router are licensed under MIT.

## Running Tests
Open `/tests/AmdSpecRunner.html` and make sure all tests pass. The tests are written using Jasmine.
