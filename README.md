## RequireJS Router
A scalable, lazy loading, AMD router.

A normal router has dependencies on every file it can route to and loads all of your files up front. The RequireJS Router scales since the user only loads the Javascript for the pages they're navigating to.

## Routes
A route has 4 properties
- `path` (string) - the URL path
- `searchParameters` (string array) - the URL search parameters
- `matchesUrl()` function - tests the route to see if it matches the current URL
- `module` (string) - the RequireJS module to load when the user navigates to this route

A simple route object would looke like this `{path: '/example/path', module: 'info/infoView'}`. When you navigate to that path it will load that module.

The routes are first compared against the hash path (a hash starting in `#/` or `#!/`) and fall back to the regular path if no hash path exists. This allows one set of routes to work with hashchange and HTML5 pushState. When a hashchange, popstate, or page load occures the router will find the first matching route and load that module. 

## Pattern Matching
These URLs will all resolve to this path and set of query parameters.
- `path = '/example/path'`
- `queryParameters = ['queryParam1=true', 'queryParam2=example%20string']`

URLs
- `http://domain.com/example/path?queryParam1=true&queryParam2=example%20string`
- `http://domain.com/#/example/path?queryParam1=true&queryParam2=example%20string`
- `http://domain.com/#!/example/path?queryParam1=true&queryParam2=example%20string`
- `http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string`

The 4th example ignores the normal path and query parameters since it has a hash path.

### path
When you're setting up your routes you can specify an exact string to match or you can use wildcards `*` to match a segment of the path. For example `/customer/*/name` will match `/customer/123/name`. There is also a catch-all path `'*'` that will match any path.

### queryParameters
You can match against query parameters by specifying an array of query parameters. Ex: `queryParameters: ['queryParam1=true', 'queryParam2']`. This will check for an exact match on `queryParam1` and check for the existence of `queryParam2`.

You can combine a path with queryParameters in your route. When you do this the route will only match if ALL options specified match.

### matchesUrl()
If you need more control over your route you can override the `route.matchesUrl()` function and specify your own logic. This is useful if you need to check for an either or case.

### Example routes
```js
routes: {
  // matches the exact path
  route1: {path: '/example/path', module: 'info/infoView'},
  
  // matches using a wildcard
  route2: {path: '/example/*', module: 'info/infoView'},
  
  // matches the exact path and one query parameter
  route3: {path: '/example/path', queryParameters: ['queryParam2=example%20string'], module: 'info/infoView'},
  
  // matches both query parameters
  route4: {queryParameters: ['queryParam1=true', 'queryParam2=example%20string'], module: 'info/infoView'},
  
  // doesn't match - the query parameter fails the match
  route5: {path: '/example/*' queryParameters: ['queryParam3=false'], module: 'info/infoView'},
  
  // doesn't match - but would match a path of either '/some/route' or '/other/route'
  route6: {matchesUrl: function matchesUrl() { return router.testRoute({path: '/some/route'}) || router.testRoute({path: '/other/route'}); }, module: 'info/infoView'},
  
  // matches everything - this route would typically be used to load a 404 page
  route7: {path: '*', module: 'notFound/notFoundView'}
}
```

## Configuration
There is only one instance of the router. Using RequireJS to load the router in multiple modules will always load the same router.

Here's an example of loading and configuring the router followed by triggering the initial page load. This effectively runs your app.
```js
require(['router'], function(router) {
  router.config({
    routes: {
      // root matches the exact route '/'
      root: {path: '/', module: 'info/infoView'},
      // customer matches a path like '/customer/123'
      customer: {path: '/customer/*', module: 'customer/customerView'},
      // orders matches a path of '/orders' that also has a query parameter 'orderStatus=completed'
      orders: {path: '/orders', queryParameters: ['orderStatus=completed'], module: 'orders/ordersView'},
      // dev matches '/dev' or '/development'
      dev: {matchesUrl: function matchesUrl() { return router.testRoute({path: '/dev'}) || router.testRoute({path: '/development'}); }, module: 'dev/devView'}},
      // notFound matches everything which is used to load a 404 page
      notFound: {path: '*', module: 'notFound/NotFoundView'}
    },

    routeLoadedCallback: function routeLoadedCallback(View) {
      var body = document.querySelector('body');
      body.innerHTML = '';
      body.appendChild(new View().render().outerEl);
    }
  });
  
  router.loadCurrentRoute();
});
```

## Router Properties
- `router.config()` - configure the router
- `router.routes` - all defined routes
- `router.routeLoadedCallback(module)` - called when RequireJS finishes loading a module for a route
- `router.loadCurrentRoute()` - triggers RequireJS to load the module for the current route
- `router.testRoute(route)` - test if the route path and query parameters match the current URL
- `router.urlChangeEventHandler()` - called when a hashchange or popstate event is triggered and calls `router.loadCurrentRoute()`
- `router.currentUrl()` - gets the current URL from the address bar. You can override this when unit testing.
- `router.currentRoute()` - the current route - ex: `{path: '/', queryParameters: [], module: 'info/infoView', matchesUrl: function() {...}}`

## How to use
Let's go over the case where your site has a consistent layout (header, footer, etc.) that you want rendered on every page. Let's call this the `indexView`. When you click a tab in the header it routes to a different page. You need to re-render the `indexView` to show which tab is now active. There are two main ways to do this. If you use views that support parent views similar to .NET master pages then the set up is simple since you can route directly to the child view. If you use a more classic style of views like Backbone.js then you need a hook to render the parent view before rendering the child view. Let's go over the easy case first.

### Views that support parent views
Example framework: [view.js](http://erikringsmuth.github.io/view-js/)

Here's an example ineraction with the example configuration from above:

1. The user clicks a link in the header `<li><a href="#/api">APIs</a></li>`
2. A hashchange event is triggered and is intercepted by the router which loads the `'api/apiView'` module
3. The router calls your `router.routeLoadedCallback(module)` with `ApiView` being passed in as the argument
4. Your `router.routeLoadedCallback(module)` callback renders the view which also renders it's parent view `indexView` and attaches it to the document

You're done. The indexView is re-rendered with the header links updated and the main-content section populated with a new `ApiView`.

### Views that do not support parent views
Example framework: [Backbone.js](http://backbonejs.org/)

Here's an example ineraction:

1. The user clicks a link in the header `<li><a href="#/api">APIs</a></li>`
2. A hashchange event is triggered and is intercepted by `router.urlChangeEventHandler()`
3. `router.urlChangeEventHandler()` calls `indexView.render()` which draws the header, footer, and an empty main-content section. At this point the header has the "APIs" link marked as active `<li class="active"><a href="#/api">APIs</a></li>`.
4. `indexView.render()` calls `router.loadCurrentRoute()`
5. `router.loadCurrentRoute()` uses RequireJS to load the `'api/apiView'` module
6. When the module finishes loading `router.routeLoadedCallback(module)` is called with `ApiView` being passed in as the argument
7. `router.routeLoadedCallback(module)` creates a new instance of `ApiView`, renders it and attaches it to the indexView's main-content section

You're done. The indexView is re-rendered with the header links updated and the main-content section populated with a new `ApiView`.

Here's an example router and view setup with the classic views.
```js
router.config({
  routes: {
    // root matches the exact route '/'
    root: {path: '/', module: 'info/infoView'},
    // customer matches a path like '/customer/123'
    customer: {path: '/customer/*', module: 'customer/customerView'},
    // orders matches a path of '/orders' that also has a query parameter 'orderStatus=completed'
    orders: {path: '/orders', queryParameters: ['orderStatus=completed'], module: 'orders/ordersView'},
    // dev matches '/dev' or '/development'
    dev: {matchesUrl: function matchesUrl() { return router.testRoute({path: '/dev'}) || router.testRoute({path: '/development'}); }, module: 'dev/devView'}},
    // notFound matches everything which is used to load a 404 page
    notFound: {path: '*', module: 'notFound/NotFoundView'}
  },

  // The hashchange event handler calls your main view's render method
  urlChangeEventHandler: function urlChangeEventHandler() {
    indexView.render.call(indexView);
  },

  // This gets called when a RequireJS module finishes loading
  routeLoadedCallback: function routeLoadedCallback(module) {
    // Attach the child view to the indexView's main-content section
    var mainContent = indexView.el.querySelector('main#content');
    mainContent.innerHTML = '';
    mainContent.appendChild(new module().render().el);
  }
});

// Your view's `render()` method draws the header, footer, and an empty main-content section which the `router.routeLoadedCallback()` method populates
indexView.render = function render() {
  this.el.innerHTML = this.template({model: this.model});
  this.router.loadCurrentRoute();
  return this;
}
```

## Demo Site
The RequireJS Router was written alongside [view.js](https://github.com/erikringsmuth/view-js). The site's source is available in the [gh-pages branch of view-js](https://github.com/erikringsmuth/view-js/tree/gh-pages). The router is configured in [/js/main.js](https://github.com/erikringsmuth/view-js/blob/gh-pages/js/main.js). Both view.js and the RequireJS Router are licensed under MIT.

## Running Tests
Open `/tests/SpecRunner.html` and make sure all tests pass. The tests are written using Jasmine.
