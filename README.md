## RequireJS Router
The RequireJS Router lazy loads modules based on the URI route. Lazy loading prevents the browser from loading all of your site's Javascript at once. A normal router has dependencies on every file it can route to. Your site will perform the same as it scales when using the RequireJS router since the user only loads the Javascript for the pages they're navigating to.

The RequireJS Router works by initializing it with a map of routes and the RequireJS modules they map to. The modules are loaded as the user navigates to those routes.

## How to use
The main use case is where you have a main view that has your header, footer, and a main-content section. Let's call this view the indexView. The indexView will always be rendered no matter what route your're going to but it may have a different list item set as active which you'll want re-rendered every time you route to a new page.

Here's an example ineraction:

1. A route is defined as `'#/api': {module: 'api/apiView'}` in the router
2. The user clicks a link in the header `<li><a href="#/api">APIs</a></li>`
3. A hashchange event is triggered and is intercepted by `router.hachChangeEventHandler()`
4. `router.hachChangeEventHandler()` calls `indexView.render()` which draws the header, footer, and an empty main-content section. At this point the header has the "APIs" link marked as active `<li class="active"><a href="#/api">APIs</a></li>`.
5. `indexView.render()` calls `router.loadActiveRoute()`
6. `router.loadActiveRoute()` uses RequireJS to load the `'api/apiView'` module
7. When the module finishes loading `router.routeLoadedCallback(Module)` is called with `ApiView` being passed in as the argument
8. `router.routeLoadedCallback(Module)` creates a new instance of `ApiView`, renders it and attaches it to the indexView's main-content section
9. You're done. The indexView is re-rendered with the header links updated and the main-content section populated with a new `ApiView`.

Here's an example router and view setup.
```js
var router = new Router({
  // Routes define the URI hash -> RequireJS module
  routes: {
    '': {module: 'info/infoView'},
    '#/': {module: 'info/infoView'},
    '#/api': {module: 'api/apiView'},
    '#/example': {module: 'example/exampleView'}
  },

  // The hashchange event handler calls your main view's render method
  hashChangeEventHandler: function hashChangeEventHandler() {
    indexView.render.call(indexView);
  },

  // This gets called when a RequireJS module finishes loading
  routeLoadedCallback: function routeLoadedCallback(Module) {
    var mainContent = indexView.el.querySelector('main#content');
    mainContent.innerHTML = null;
    mainContent.appendChild(new Module().render().el);
  },

  // This gets called if a RequireJS module fails to load or the path is invalid
  notFoundCallback: function notFoundCallback() {
    var mainContent = indexView.el.querySelector('main#content');
    mainContent.innerHTML = null;
    mainContent.appendChild(new NotFoundView().render().el);
  }
});

// Your view's `render()` method draws the header, footer, and an empty main-content section which the `router.routeLoadedCallback()` method populates
indexView.render = function render() {
  this.el.innerHTML = this.template({model: this.model});
  this.router.loadActiveRoute();
  return this;
}
```

The outer-most view is the only one that needs a `hashChangeEventHandler()`. If sub-view's are triggering hashchange events they will trigger the outer-most `hashChangeEventHandler()` which will re-render the entire page. The sub-view should use the hash and search (query) parameters to populate it's state.
