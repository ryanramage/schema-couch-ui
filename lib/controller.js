define([
  'couchr',
  'events',
  './qs',
  'json.edit',
  'ractive',
  './endpoint',
  './templates'
], function(couchr, events, querystring, JsonEdit, Ractive, Endpoint, loader){

  var defaultCreateHTML = '<form on-submit="submit" onsubmit="return false;"><div id="!!!-edit"></div><button>save</button></form>';

  function Controller(couch_url, template_dir){
    var self = this;

    self.endpoint = new Endpoint(couch_url);
    self.emitter = new events.EventEmitter();
    self.on = self.emitter.on.bind(self.emitter);

    _init(self.endpoint, function(err, schemas){
      if(err) return self.emitter.emit('init.error', err);
      self.schemas = schemas;

      if (!template_dir) return self.emitter.emit('init');

      loader( template_dir, self.types(), function(err, templates) {
        if(err) return self.emitter.emit('init.error', err);
        self.templates = templates;
        return self.emitter.emit('init');
      })
    })

  }

  function _init(endpoint, cb) {
    couchr.get(endpoint.schemas(), cb);
  }

  Controller.prototype.setTemplates = function(templates) {
    this.templates = templates;
  };

  Controller.prototype.types = function() {
    var types = [];
    for (var type in this.schemas) {
      types.push(type);
    }
    return types;
  };


  Controller.prototype.list = function($elem, type) {
    var self = this,
        schema = self.schemas[type],
        ractive,
        template;


    couchr.get(this.endpoint.list(type), function(err, resp){
      if (err) return alert(err);
      if (self.templates[type] && self.templates[type].list) {
        template = self.templates[type].list;

        ractive = new Ractive({
            el: $elem,
            template: template,
            data: resp
        });
      }
    })
  };

  Controller.prototype.create = function($elem, type, data) {
    var self = this,
        schema = self.schemas[type],
        ractive,
        editor,
        template;

    if(!data) data = {};

    if (self.templates[type] && self.templates[type].create) {
      template = self.templates[type].create
    } else {
      template = new String(defaultCreateHTML).toString();
      template.replace('!!!', type);
      console.log(template, 'd');
    }

    ractive = new Ractive({
        el: $elem,
        template: template,
        data: data
    }),
    schema.default = data;
    editor =  JsonEdit(type + '-edit', schema);

    setTimeout(function(){
      // uber lame... need to look at json.edit if it has a rendered event we can listen
      self.emitter.emit(type + '.create.render');
    }, 1);


    ractive.on('submit', function(){
      var form = editor.collect();
      if (!form.result.ok) {
         return console.error('failed validation', form.result);
      }
      // wrap up and save
      var obj = {
        type: type,
        data: form.data
      }
      couchr.post(self.endpoint.create(type), obj, function(err, resp){
        self.emitter.emit(type + '.create.complete', err, resp, form.data);
      })
    });

  };

  Controller.prototype.edit = function($elem, id) {
    var self = this,
        schema,
        ractive,
        editor,
        template;

    couchr.get(self.endpoint.view(id), function(err, doc){
      if(err) return alert(err);

      schema = self.schemas[doc.type]

      if (self.templates[doc.type] && self.templates[doc.type].create) {
        template = self.templates[doc.type].edit
      } else {
        template = new String(defaultCreateHTML).toString();
        template.replace('!!!', doc.type);
        console.log(template, 'd');
      }

      ractive = new Ractive({
          el: $elem,
          template: template,
          data: doc.data
      }),
      schema.default = doc.data;
      editor =  JsonEdit(doc.type + '-edit', schema);

      setTimeout(function(){
        // uber lame... need to look at json.edit if it has a rendered event we can listen
        self.emitter.emit(doc.type + '.edit.render');
      }, 1);


      ractive.on('submit', function(){
        var form = editor.collect();
        if (!form.result.ok) {
           return console.error('failed validation', form.result);
        }
        // wrap up and save
        var obj = {
          _id: doc._id,
          _rev: doc._rev,
          type: doc.type,
          data: form.data
        }
        couchr.put(self.endpoint.edit(doc._id), obj, function(err, resp){
          self.emitter.emit(doc.type + '.edit.complete', err, resp, form.data);
        })
      });

    });
  };


  Controller.prototype.view = function($elem, id) {
    var self = this;
    couchr.get(self.endpoint.view(id), function(err, doc){

        var type = doc.type,
            schema = self.schemas[type],
            template = self.templates[type].view,
            data = {
              doc: doc,
              qs: function(data){
                return encodeURIComponent(querystring.stringify(data))
              }
            },
            ractive;


        ractive = new Ractive({
          el: $elem,
          template: template,
          data: data
        });

        if (schema.has_many) {
          schema.has_many.forEach(function(many){
            couchr.get( self.endpoint.many(type, id, many.name), function(err, resp){
              ractive.set(many.name, resp.rows);
            });
          })
        }


    })
  };


  return Controller;
})