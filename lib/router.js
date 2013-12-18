define(['director', 'events', 'URIjs'], function(director, events, URI){

  var emitter = new events.EventEmitter();
  function Router(api) {
    var self = this;
    self.routes = {};
    self.api = api;

    var types = api.types();
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
        var p = URI.parseQuery(decodeURIComponent(params));
        emitter.emit(type + '.create', p);
      };
    });

  }

  Router.prototype.on = emitter.on.bind(emitter);

  Router.prototype.autobind = function($elem) {
    var self = this,
        types = self.api.types();

    types.forEach(function(type){
       self.on(type + '.view',    self.api.view.bind    (self.api, $elem) );
       self.on(type + '.edit',    self.api.edit.bind    (self.api, $elem) );
       self.on(type + '.list',    self.api.list.bind    (self.api, $elem, type) );
       self.on(type + '.create',  self.api.create.bind  (self.api, $elem, type) );
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