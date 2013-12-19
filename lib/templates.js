define(['text', 'async', 'require'], function(text, async, require){

    function loader(root, types, done) {
        if(!types) return cb();

        var templates = {};
        var fullPaths = [];
        for (var i = 0; i < types.length; i++) {
            templates[ types[i] ] = {};
            var typeRoot = root + types[i];
            fullPaths.push({path: typeRoot + '/create.html', type: types[i], t: "create" });
            fullPaths.push({path: typeRoot + '/edit.html'  , type: types[i], t: "edit" });
            fullPaths.push({path: typeRoot + '/list.html'  , type: types[i], t: "list" });
            fullPaths.push({path: typeRoot + '/view.html'  , type: types[i], t: "view" });
        }

        async.each(fullPaths, function(details, cb){
            var called = false;
            try {
                require(['text!' + details.path], function(html){
                    templates[details.type][details.t] = html
                    called = true;
                    cb();
                }, function(err){
                    console.log('failed load ', details.path);
                    if (!called) cb();
                })
            }catch(e){
                console.log('build error');
            }
        }, function(err){
            done(err, templates);
        });
    }
    return loader;

});