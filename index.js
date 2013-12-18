define([
  './lib/controller', './lib/endpoint', './lib/router', './lib/templates'
], function(controller, endpoint, router, templates){
  return {
    controller: controller,
    endpoint: endpoint,
    router: router,
    templates: templates
  }
})