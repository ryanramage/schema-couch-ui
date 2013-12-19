define(['director', 'events', './qs'], function(director, events, querystring){

  var emitter = new events.EventEmitter();
  function Router() {
    this.routes = {};
  }

  Router.prototype.createTypeRoutes = function(types) {
    if (!types) return;

    var self = this;

    types.forEach(function(type){
      self.routes['/' + type + '/list']   = function()   {
        emitter.emit(type + '.list')
      };
      self.routes['/' + type + '/view/*'] = function(id) {
        emitter.emit(type + '.view', id)
      };
      self.routes['/' + type + '/edit/*'] = function(id) {
        emitter.emit(type + '.edit', id)
      };
      self.routes['/' + type + '/create'] = function() {
        emitter.emit(type + '.create')
      };
      self.routes['/' + type + '/create/*'] = function(params) {
        var p = querystring.parse(decodeURIComponent(params));
        emitter.emit(type + '.create', p);
      };
    });
  };

  Router.prototype.on = emitter.on.bind(emitter);

  Router.prototype.autobind = function(api, $elem) {
    var self = this,
        types = api.types();

    self.createTypeRoutes(types);

    types.forEach(function(type){
       self.on(type + '.view',    api.view.bind    (api, $elem) );
       self.on(type + '.edit',    api.edit.bind    (api, $elem) );
       self.on(type + '.list',    api.list.bind    (api, $elem, type) );
       self.on(type + '.create',  api.create.bind  (api, $elem, type) );
    });
  };


  Router.prototype.init = function(initial_route) {
    this.router = director.Router(this.routes);
    this.router.init('/');
  };

  Router.prototype.setRoute = function(route) {
    this.router.setRoute(route);
  };

  return Router;

})