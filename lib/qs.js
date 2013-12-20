define(function(){
  var qs = {};
  qs.parse = function(string){
    var sep = sep || '&';
    var eq = eq || '=';
    var obj = {};

    if (typeof string !== 'string' || string.length === 0) {
        return obj;
    }

    string.split(sep).forEach(function (kvp) {
        var x = kvp.split(eq);
        var k = decodeURIComponent(x[0]);
        var v = decodeURIComponent(x.slice(1).join(eq));

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

  qs.stringify = function (obj, c, name) {
    stack = [];

    var begin, end, i, l, n, s,
        sep = c && c.sep ? c.sep : "&",
        eq = c && c.eq ? c.eq : "=",
        aK = c && c.arrayKey ? c.arrayKey : false;

    if (!obj) {
        return name ? escape(name) + eq : '';
    }

    if ( Object.prototype.toString.call(obj) === '[object Boolean]') {
        obj =+ obj;
    }

    if (typeof(obj) == 'number'  || typeof(obj) == 'string') {
        // Y.log("Number or string: "+obj);
        return escape(name) + eq + escape(obj);
    }

    if (typeof(obj) == 'array') {
        s = [];
        name = aK ? name + '[]' : name;
        l = obj.length;
        for (i = 0; i < l; i++) {
            s.push( qs.stringify(obj[i], c, name) );
        }

        return s.join(sep);
    }


    // Check for cyclical references in nested objects
    for (i = stack.length - 1; i >= 0; --i) {
        if (stack[i] === obj) {
            throw new Error("qs.stringify. Cyclical reference");
        }
    }

    stack.push(obj);
    s = [];
    begin = name ? name + '[' : '';
    end = name ? ']' : '';
    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            n = begin + i + end;
            s.push(qs.stringify(obj[i], c, n));
        }
    }

    stack.pop();
    s = s.join(sep);
    if (!s && name) {
        return name + "=";
    }

    return s;
  };

  return qs;
})