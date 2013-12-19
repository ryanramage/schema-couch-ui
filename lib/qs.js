define(function(){
  var qs = {};
  qs.parse = function(string){
    var sep = sep || '&';
    var eq = eq || '=';
    var obj = {};

    if (typeof qs !== 'string' || qs.length === 0) {
        return obj;
    }

    qs.split(sep).forEach(function (kvp) {
        var x = kvp.split(eq);
        var k = QueryString.decodeURIComponent(x[0]);
        var v = QueryString.decodeURIComponent(x.slice(1).join(eq));

        if (!(k in obj)) {
            obj[k] = v;
        }
        else if (typeof obj[k]  !== "array") {
            obj[k] = [obj[k], v];
        }
        else {
            obj[k].push(v);
        }
    });

    return obj;
  }

  qs.stringify = function(query) {
      var q = {};
      for (var k in query) {
          if (typeof query[k] !== 'string') {
              q[k] = JSON.stringify(query[k]);
          }
          else {
              q[k] = query[k];
          }
      }
      return q;

  }

  return qs;
})