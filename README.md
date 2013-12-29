## RequireJS Router
A scalable, lazy loading, AMD router.

A normal Javascript router has dependencies on every file it can route to. This makes it load all of your Javascript up front. The RequireJS Router scales since the user only loads the Javascript for the pages they're navigating to.

## Routes
The router uses `window.location.href` to determine the current route. You configure routes by specifying path and query parameters and the modules they map to. The first matching route is selected as the current route. Hash paths and query parameters will also match. If a hash path exists (a hash starting in #/ or #!/) it will ignore the regular path and query parameters and match against the hash path and query parameters instead.

Example `window.location.href`'s that will all match against the same path and query parameters.
- http://domain.com/example/path?queryParam1=true&queryParam2=example%20string
- http://domain.com/#/example/path?queryParam1=true&queryParam2=example%20string
- http://domain.com/#!/example/path?queryParam1=true&queryParam2=example%20string
- http://domain.com/other/path?queryParam3=false#/example/path?queryParam1=true&queryParam2=example%20string
- http://domain.com/other/path?queryParam3=false#!/example/path?queryParam1=true&queryParam2=example%20string

In all of these cases
- `path` = '/example/path'
- `queryParameters` = ['queryParam1=true', 'queryParam2=example%20string']

The 4th and 5th examples will ignore the normal path and query parameters since a hash path exists.

To match on the path you can either specify the exact string or include wildcards \* to match sections of the path. You can also specify a special '\*' path that will match everything. Typically this would be used to load a 404 page.

To match against the query you specify an array of query parameters. When you specify multiple options like a path and query parameters it matches against ALL of the options you specify.

You can also specify a custom `matchesUrl()` function to do more complicated URL matching logic.

These are some examples.

```js
routes: {
  route1: {path: '/example/path', module: 'info/infoView'}, // matches
  route2: {path: '/example/*', module: 'info/infoView'}, // matches
  route3: {path: '/example/path', queryParameters: ['queryParam2=example%20string'], module: 'info/infoView'}, // matches
  route4: {queryParameters: ['queryParam1=true', 'queryParam2=example%20string'], module: 'info/infoView'}, // matches
  route5: {path: '*', module: 'notFound/notFoundView'}, // matches everything - this route would typically be used to load a 404 page
  route6: {path: '/example/*' queryParameters: ['queryParam3=false'], module: 'info/infoView'}, // doesn't match - the query parameter fails the match
  route7: {matchesUrl: function matchesUrl() { return true; }, module: 'info/infoView'}, // matches - the `matchesUrl()` method will always return true in this case
}
```

## API
There is only one instance of the router. Using RequireJS to load the router in multiple modules will always load the same router.

Here's an example of loading and configuring the router followed by triggering the initial page load. This effectively runs your app.
```js
require(['router'], function(router) {
  router.config({
    routes: {
      // root matches path = '/' or '/view-js'
      root: {matchesUrl: function matchesUrl() { return (router.testRoute(window.location.href, {path: '/'}) || router.testRoute(window.location.href, {path: '/view-js'})) ? true : false; }, module: 'info/infoView'},
      api: {path: '/api', module: 'api/apiView'},
      example: {path: '/example', module: 'example/exampleView'},
      dev: {path: '/dev', module: 'dev/child/childView'},
      notFound: {path: '*', module: 'notFound/NotFoundView'},

      // You can't use these directly to load a route. They're used by sub-views for their `.matchesUrl()` method.
      todoAll: {queryParameters: ['todoFilter=all']},
      todoActive: {queryParameters: ['todoFilter=active']},
      todoCompleted: {queryParameters: ['todoFilter=completed']}
    },

    routeLoadedCallback: function routeLoadedCallback(View) {
      var body = document.querySelector('body');
      body.innerHTML = null;
      body.appendChild(new View().render().outerEl);
    }
  }).loadCurrentRoute();
});
```

Router properties:
- `router.config()` - configure the router
- `router.routes` - all defined routes
- `router.routeLoadedCallback(Module)` - called when RequireJS finishes loading a module for a route
- `router.loadCurrentRoute()` - triggers RequireJS to load the module for the current route
- `router.currentRoute()` - the current route (ex: `{path: '/', module: 'info/infoView', matchesUrl: function() { /** Returns true or false */ }}`)
- `router.urlChangeEventHandler()` - called when a hashchange or popstate event is triggered and calls router.loadCurrentRoute()
- `router.testRoute(url, route)` - determines if the route matches the URL
- `router.parseUrl(url)` - parses the url to get the path and search
- `router.routes.*.matchesUrl()` - each route has this method to determine if the route matches the URL

## How to use
Let's go over the case where your site has a consistent layout (header, footer, etc.) that you want rendered on every page. Let's call this the `indexView`. When you click a tab in the header it routes to a different page. You need to re-render the `indexView` to show which tab is now active. There are two main ways to do this. If you use views that support parent views similar to .NET master pages then the set up is simple since you can route directly to the child view. If you use a more classic style of views like Backbone.js then you need a hook to render the parent view before rendering the child view. Let's go over the easy case first.

### Views that support parent views
Example framework: [view.js](http://erikringsmuth.github.io/view-js/)

Here's an example ineraction with the example configuration from above:

1. The user clicks a link in the header `<li><a href="#/api">APIs</a></li>`
2. A hashchange event is triggered and is intercepted by the router which loads the `'api/apiView'` module
3. The router calls your `router.routeLoadedCallback(Module)` with `ApiView` being passed in as the argument
4. Your `router.routeLoadedCallback(Module)` callback renders the view which also renders it's parent view `indexView` and attaches it to the document

You're done. The indexView is re-rendered with the header links updated and the main-content section populated with a new `ApiView`.

### Views that do not support parent views
Example framework: [Backbone.js](http://backbonejs.org/)

Here's an example ineraction:

1. The user clicks a link in the header `<li><a href="#/api">APIs</a></li>`
2. A hashchange event is triggered and is intercepted by `router.urlChangeEventHandler()`
3. `router.urlChangeEventHandler()` calls `indexView.render()` which draws the header, footer, and an empty main-content section. At this point the header has the "APIs" link marked as active `<li class="active"><a href="#/api">APIs</a></li>`.
4. `indexView.render()` calls `router.loadCurrentRoute()`
5. `router.loadCurrentRoute()` uses RequireJS to load the `'api/apiView'` module
6. When the module finishes loading `router.routeLoadedCallback(Module)` is called with `ApiView` being passed in as the argument
7. `router.routeLoadedCallback(Module)` creates a new instance of `ApiView`, renders it and attaches it to the indexView's main-content section

You're done. The indexView is re-rendered with the header links updated and the main-content section populated with a new `ApiView`.

Here's an example router and view setup with the classic views.
```js
router.config({
  // Routes define the URI hash -> RequireJS module
  routes: {
    // root matches path = '/' or '/view-js'
    root: {matchesUrl: function matchesUrl() { return (router.testRoute(window.location.href, {path: '/'}) || router.testRoute(window.location.href, {path: '/view-js'})) ? true : false; }, module: 'info/infoView'},
    api: {path: '/api', module: 'api/apiView'},
    example: {path: '/example', module: 'example/exampleView'},
    dev: {path: '/dev', module: 'dev/child/childView'},
    notFound: {path: '*', module: 'notFound/NotFoundView'},

    // You can't use these directly to load a route. They're used by sub-views for their `.matchesUrl()` method.
    todoAll: {queryParameters: ['todoFilter=all']},
    todoActive: {queryParameters: ['todoFilter=active']},
    todoCompleted: {queryParameters: ['todoFilter=completed']}
  },

  // The hashchange event handler calls your main view's render method
  urlChangeEventHandler: function urlChangeEventHandler() {
    indexView.render.call(indexView);
  },

  // This gets called when a RequireJS module finishes loading
  routeLoadedCallback: function routeLoadedCallback(Module) {
    // Attach the child view to the indexView's main-content section
    var mainContent = indexView.el.querySelector('main#content');
    mainContent.innerHTML = null;
    mainContent.appendChild(new Module().render().el);
  }
});

// Your view's `render()` method draws the header, footer, and an empty main-content section which the `router.routeLoadedCallback()` method populates
indexView.render = function render() {
  this.el.innerHTML = this.template({model: this.model});
  this.router.loadCurrentRoute();
  return this;
}
```
