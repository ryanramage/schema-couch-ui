define(['url'], function(url){

  function Endpoint(couch_url) {
    this.base_url = couch_url;
    this.couch_url = couch_url + '/_design/schema/_rewrite/';
  }

  Endpoint.prototype.schemas = function() {
    return url.resolve(this.couch_url, './schemas')
  };

  Endpoint.prototype.list = function(type) {
    return url.resolve(this.couch_url, './' + type + '/list')
  };

  Endpoint.prototype.create = function(type) {
    return this.base_url;
  };

  Endpoint.prototype.view = function(id) {
    return this.base_url + '/' + id;
  };

  Endpoint.prototype.edit = function(id) {
    return this.base_url + '/' + id;
  }

  Endpoint.prototype.many = function(type, id, many) {
    return url.resolve(this.couch_url, "./" + type + "/id/" + id + "/has_many/" + many);
  };


  return Endpoint;

})