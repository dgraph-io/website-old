'use strict';

// I am Darth Graph! join the dark side of the source.
angular.module('darthGraph', ['ui.ace', 'ui.bootstrap']).
    controller('GraphMagic', function($scope, $http) {
        var make_ace = function(element_id) {
            var editor = ace.edit(element_id);
            editor.setTheme("ace/theme/tomorrow_night_eighties");
            editor.getSession().setMode("ace/mode/javascript");
            editor.renderer.setShowGutter(false);
            editor.$blockScrolling = Infinity;
            return editor;
        };

        $scope.examples = [
            {
                title: 'Steven Spielberg',
                sample_code: "" +
									"{\n" +
									"  me(_xid_: m.06pj8) {\n" +
									"    type.object.name.en\n" +
									"    film.director.film {\n" +
									"      type.object.name.en\n" +
									"      film.film.initial_release_date\n" +
									"      film.film.country\n" +
									"      film.film.starring {\n" +
									"        film.performance.actor {\n" +
									"          film.director.film {\n" +
									"            type.object.name.en\n" +
									"          }\n" +
									"          type.object.name.en\n" +
									"        }\n" +
									"        film.performance.character {\n" +
									"          type.object.name.en\n" +
									"        }\n" +
									"      }\n" +
									"      film.film.genre {\n" +
									"        type.object.name.en\n" +
									"      }\n" +
									"    }\n" +
									"  }\n" +
									"}\n"
            },
            {
                title: 'Kevin Bacon',
                sample_code: "" +
									"{\n" + 
									"  me(_xid_: m.04954) {\n" + 
									"    type.object.name.en\n" +
									"    film.actor.film {\n" + 
									"      film.performance.film {\n" +
									"        type.object.name.en\n" +
									"        film.film.starring {\n" +
									"          film.performance.actor {\n" +
									"            type.object.name.en\n" +
									"          }\n" +
									"        }\n" +
									"      }\n" +
									"    }\n" +
									"  }\n" +
									"}\n"
            },
            {
                title: 'Tom Hanks',
								sample_code: "" +
									"{\n" +
									"  me(_xid_: m.0bxtg) {\n" + 
									"    type.object.name.en\n" +
									"    film.actor.film {\n" +
									"      film.performance.film {\n" +
									"        type.object.name.en\n" +
									"        type.object.name.ru\n" +
									"      }\n" +
									"    }\n" +
									"  }\n" +
									"}\n"
            },
        ];

        $scope.active_tab = null;

        $scope.activate = function(index) {
            if ($scope.active_tab) {
                $scope.active_tab.active = false;
            }
            $scope.active_tab = $scope.examples[index];
            $scope.active_tab.code = $scope.active_tab.code || $scope.active_tab.sample_code;
            $scope.active_tab.active = true;
        };

        $scope.activate(0);

        $scope.reset_example_code = function() {
            $scope.active_tab.code = $scope.active_tab.sample_code;
        };

        $scope.$watch('active_tab.code', function(newCode) {
            $scope.runQuery(newCode);
        });

        $scope.isNetPending = function() {
            return $scope.lastSentVersion != $scope.lastReceivedVersion;
        };

        $scope.queryEditorLoaded = function(editor) {
            var dgraphCompleter = {
                getCompletions: function(editor, session, pos, prefix, callback) {
                    console.log('get completions ', arguments);

                    var ret = [];
                    for (var i = 0; i < window.DGraph_All_Predicates.length; i++) {
                        var p = window.DGraph_All_Predicates[i];
                        ret.push({
                            name: '',
                            value: p,
                            score: 0,
                            meta: 'dgraph movies',
                        });
                    }

                    callback(null, ret);
                }
            };
            editor.completers = [dgraphCompleter];
            editor.session.setOptions({
                mode: "ace/mode/javascript",
                tabSize: 2,
                useSoftTabs: true
            });

            window.setTimeout(function() {
                //editor.session.bgTokenizer.stop();
            }, 1999);

            window.setTimeout(function() {

                function filter_all(pat) {
                    var ret = "";
                    for (var i = 0; i < window.DGraph_All_Predicates.length; i++) {
                        var p = window.DGraph_All_Predicates[i];
                        if (!p.startsWith(pat)) {
                            continue;
                        }
                        if (ret.length) {
                            ret += "|";
                        }
                        ret += p.replace(/\./g, '\\\.');
                    }
                    return ret;
                }

                // keyword - purple, object and meta
                // string - green, film
                // support.function - blue, director
                // constant.language - orange, actor
                // variable.language - red
                var newRules = {
                    start:[
                        {
                            token: "keyword",
                            regex: filter_all("type.")
                        },
                        {
                            token: "string",
                            regex: filter_all("film.film.")
                        },
                        {
                            token: "support.function",
                            regex: filter_all("film.director.")
                        },
                        {
                            token: "constant.language",
                            regex: filter_all("film.")
                        },
                    ]
                };
                editor.session.$mode.$highlightRules.addRules(newRules, "");
                delete editor.session.$mode.$tokenizer;
                editor.session.bgTokenizer.stop();
                editor.session.bgTokenizer.setTokenizer(editor.session.$mode.getTokenizer());
            }, 2000);
        };

        // TODO: time to break this file into multiple independent components.
        $scope.typeahead_cache = [];
        $scope.typeahead_cache_indices = {};

        $scope.found_entity = function(data) {
            var index = $scope.typeahead_cache_indices[data.name];
            if (index == undefined) {
                $scope.typeahead_cache_indices[data.name] = $scope.typeahead_cache.length;
                $scope.typeahead_cache.push(data);
            } else {
                var cached = $scope.typeahead_cache[index];
                cached.xid = cached.xid || data.xid;
                cached.uid = cached.uid || data.uid;
            }
        };
        $scope.$watch("typeahead_root_id", function(newVal) {
            if (!newVal) {
                return;
            }
            var cached = $scope.typeahead_cache[ $scope.typeahead_cache_indices[newVal] ];
            var newExpr = cached.xid ? "_xid_: " + cached.xid : "_uid_: " + cached.uid;
            console.log(newExpr);
            var newCode = $scope.active_tab.code.replace(/me\s*\([^()]+\)/, "me(" + newExpr + ")");
            if (newCode == $scope.active_tab.code && newCode.indexOf(newExpr) < 0) {
                alert('Your query must contain string "me(_xid_: <some id>) for autocomplete to work"');
            }
            $scope.active_tab.code = newCode;
        });

        $scope.cache_entities = function(obj) {

            if (obj.hasOwnProperty("type.object.name.en") && obj.hasOwnProperty("_xid_")) {
                $scope.found_entity({
                    name: obj["type.object.name.en"],
                    xid: obj["_xid_"]
                });
            }

            if (obj.hasOwnProperty("type.object.name.en") && obj.hasOwnProperty("_uid_")) {
                $scope.found_entity({
                    name: obj["type.object.name.en"],
                    uid: obj["_uid_"]
                });
            }

            for (var k in obj) {
                if (!obj.hasOwnProperty(k)) {
                    continue;
                }
                if (obj[k] instanceof Array) {
                    for (var i = 0; i < obj[k].length; i++) {
                        $scope.cache_entities(obj[k][i]);
                    }
                } else if (obj[k] instanceof Object) {
                    $scope.cache_entities(obj[k]);
                }
            }
        };

        $scope.runQuery = function(query) {
            var startTime = Date.now();
            $scope.lastSentVersion = $scope.lastSentVersion || 0;
            var currentCodeVersion = ++$scope.lastSentVersion;
            $http({
                url: 'http://dgraph.xyz/query',
                method: 'POST',
                data: query
            }).then(function(response) {
                if (currentCodeVersion != $scope.lastSentVersion) {
                    // Ignore anything but the latest request.
                    return;
                }
                $scope.had_network_error = false;
                $scope.lastReceivedVersion = currentCodeVersion;

                $scope.query_result = response.data._root_&& response.data._root_[0];
                $scope.json_result = JSON.stringify($scope.query_result, null, 2);

                $scope.cache_entities($scope.query_result);

                $scope.latency_data = response.data.server_latency || {};
                $scope.latency_data.client_total_latency = Date.now() - startTime;
                if ($scope.json_result) {
                    $scope.latency_data.entity_count = $scope.json_result.replace(/"_uid_": /g, '"_uid_": 1').length - $scope.json_result.length;
                } else {
                    $scope.latency_data.entity_count = 0;
                }
            }, function(error) {
                console.log(error);
                $scope.had_network_error = true;
            });
        };
    });

angular.module('darthGraph')
    .directive("tree", function($compile) {
        return {
            restrict: "E",
            scope: {
                obj: '=',
                expanded:'='
            },
            templateUrl: 'tree_node.html',
            compile: function(tElement, tAttr) {
                var contents = tElement.contents().remove();
                var compiledContents;
                return function(scope, iElement, iAttr) {
                    if(!compiledContents) {
                        compiledContents = $compile(contents);
                    }
                    compiledContents(scope, function(clone, scope) {
                        iElement.append(clone);
                    });

                    scope.$watch('obj', function(newVal) {
                        scope.fields = scope.get_fields(newVal);
                        scope.summary = scope.get_summary(newVal, scope.fields);
                    });

                    scope.$on('force_expand', function() {
                        scope.expanded = true;
                        for (var i = 0; i < scope.fields.length; i++) {
                            scope.fields[i].expanded = true;
                        }
                    });

                    scope.expand_all = function() {
                        scope.expanded = true;
                        scope.$broadcast('force_expand');
                    };

                    scope.get_fields = function(obj) {
                        var fields = [];
                        for (var k in obj) {
                            if (fields.length > 100) {
                                break;
                            }
                            if (!obj.hasOwnProperty(k)) {
                                continue;
                            }
                            if (typeof obj[k] == "string" || typeof obj[k] == "number" || obj[k] === null || obj[k] === undefined) {
                                fields.push({
                                    key:k,
                                    value: obj[k]
                                });
                                continue;
                            }
                            if (obj[k] instanceof Array) {
                                fields.push({
                                    key: k,
                                    array: obj[k]
                                });
                            } else {
                                fields.push({
                                    key: k,
                                    subobj: obj[k]
                                });
                            }
                        }
                        return fields;
                    };

                    scope.get_summary = function(obj, fields) {
                        if (obj === null || obj === undefined) {
                            return {
                                title: "<n/a>",
                                fields: [],
                                children: 0
                            }
                        }
                        var children = 0;
                        var title = obj['_uid_'];
                        for (var i = 0; i < fields.length; i++) {
                            if (fields[i].subobj) {
                                children++;
                            } else if (fields[i].array) {
                                children += fields[i].array.length;
                            }
                            if (fields[i].key.indexOf('type.object.name.') == 0) {
                                title = fields[i].value;
                            }
                        }
                        return {
                            title: title,
                            fields: fields.length,
                            children: children
                        };
                    };
                };
            }
        };
    });
