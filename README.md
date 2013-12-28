## RequireJS Router
The RequireJS Router lazy loads modules based on the URI route. Lazy loading prevents the browser from loading all of your site's Javascript at once. A normal router has dependencies on every file it can route to. With the RequireJS Router your site will perform the same as it scales since the user only loads the Javascript for the pages they're navigating to.

You initialize the RequireJS Router with a map of URI routes to RequireJS modules. The modules are loaded as the user navigates to those routes.

## API
There is only one instance of the router. Using RequireJS to load the router in multiple modules will always load the same router.

Here's an example of loading and configuring the router followed by triggering the initial page load. This effectively runs your app.
```js
require(['router'], function(router) {
  router.config({
    routes: {
      '': {module: 'info/infoView'},
      '#/': {module: 'info/infoView'},
      '#/api': {module: 'api/apiView'},
      '#/example': {module: 'example/exampleView'},
      '#/dev': {module: 'dev/child/childView'},
      'not-found': {module: 'notFound/NotFoundView'}
    },

    routeLoadedCallback: function routeLoadedCallback(View) {
      var body = document.querySelector('body');
      body.innerHTML = null;
      body.appendChild(new View().render().outerEl);
    }
  }).loadActiveRoute();
});
```

Properties:
- router.config() - use to configure the router
- router.routeLoadedCallback(Module) - called when RequireJS finishes loading a module for a route
- router.loadActiveRoute() - triggers RequireJS to load the module for the current route
- router.activeRoute() - the current route (ex: '#/api')
- router.uriFragmentPath() - example URI 'http://host/#/fragmentpath?fragmentSearchParam1=true' will return '#/fragmentpath'
- router.uriFragmentSearchParameters() - example URI 'http://host/#/fragmentpath?fragmentSearchParam1=true' will return '?fragmentSearchParam1=true'
- router.hashChangeEventHandler() - listens for hashchange events and calls `router.loadActiveRoute()`
- router.notFoundCallback() - called when there is no matching route or RequireJS fails to load the module. This looks for the 'not-found' route and loads that module. (example 'not-found' route: `'not-found': {module: 'notFound/NotFoundView'}`)

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
2. A hashchange event is triggered and is intercepted by `router.hachChangeEventHandler()`
3. `router.hachChangeEventHandler()` calls `indexView.render()` which draws the header, footer, and an empty main-content section. At this point the header has the "APIs" link marked as active `<li class="active"><a href="#/api">APIs</a></li>`.
4. `indexView.render()` calls `router.loadActiveRoute()`
5. `router.loadActiveRoute()` uses RequireJS to load the `'api/apiView'` module
6. When the module finishes loading `router.routeLoadedCallback(Module)` is called with `ApiView` being passed in as the argument
7. `router.routeLoadedCallback(Module)` creates a new instance of `ApiView`, renders it and attaches it to the indexView's main-content section

You're done. The indexView is re-rendered with the header links updated and the main-content section populated with a new `ApiView`.

Here's an example router and view setup with the classic views.
```js
router.config({
  // Routes define the URI hash -> RequireJS module
  routes: {
    '': {module: 'info/infoView'},
    '#/': {module: 'info/infoView'},
    '#/api': {module: 'api/apiView'},
    '#/example': {module: 'example/exampleView'},
    'not-found': {module: 'notFound/notFoundView'}
  },

  // The hashchange event handler calls your main view's render method
  hashChangeEventHandler: function hashChangeEventHandler() {
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
  this.router.loadActiveRoute();
  return this;
}
```
