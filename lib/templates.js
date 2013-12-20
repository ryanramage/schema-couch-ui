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
            var called = printed = false;
            try {

                // add a settimeout to see if we failed
                setTimeout(function(){
                    if (!called && !printed && window.location.protocol == 'file:'){
                        console.log('ERROR: Hey, it looks like you are using "file:" protocol and in dev mode.');
                        console.log('Try "schema-couch dev" or "schema-couch dist"');
                        printed = true;
                    }
                }, 2000);


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