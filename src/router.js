

export default class Router {
  constructor(routes) {
    this._routes = routes;
    window.addEventListener('popstate', this.handleRouteChange.bind(this));
  }

  handleRouteChange() {
    let path = window.location.pathname;
    if (path === '/') {
      path = '/login';
    }
    if (this._routes[path]) {
      this._routes[path](); 
    } 
    else {
      this._routes['/error']();
    }
  }
}