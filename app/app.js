'use strict';

// I am Darth Graph! join the dark side of the source.
angular.module('darthGraph', ['ui.ace', 'ui.bootstrap']).
    controller('GraphMagic', function($scope, $http) {

        $scope.examples = [
            {
                title: 'Film Director',
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
                title: 'Actor',
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
            {
                title: 'Movie',
                sample_code: "" +
                    "{\n" +
                    "  me(_xid_: m.07bwr) {\n" +
                    "    type.object.name.en\n" +
                    "    film.film.initial_release_date\n" +
                    "    film.film.country\n" +
                    "    film.film.starring {\n" +
                    "      film.performance.actor {\n" +
                    "        type.object.name.en\n" +
                    "      }\n" +
                    "      film.performance.character {\n" +
                    "        type.object.name.en\n" +
                    "      }\n" +
                    "    }\n" +
                    "    film.film.genre {\n" +
                    "      type.object.name.en\n" +
                    "    }\n" +
                    "  }\n" +
                    "}\n",
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
            editor.$blockScrolling = Infinity;
            editor.session.setOptions({
                mode: "ace/mode/graphql",
                tabSize: 2,
                useSoftTabs: true
            });

            editor.setOptions({
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            });
        };

        $scope.responseEditorLoaded = function(editor) {
            editor.$blockScrolling = Infinity;
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

        $scope.flush_typeahead_cache = function() {
            $scope.typeahead_cache = [];
            $scope.typeahead_cache_indices = {};
            $scope.found_entity({
                name: "Steven Spielberg",
                xid: "m.06pj8",
                uid: "0x3b0de646eaf32b75",
            });
            $scope.found_entity({
                name: "Tom Hanks",
                xid: "m.0bxtg",
                uid: "0xcbcefccffb9eb400",
            });
            $scope.found_entity({
                name: "The Big Lebowski",
                xid: "m.07bwr",
                uid: "0xff4c6752867d137d",
            });
        };
        $scope.flush_typeahead_cache();

        $scope.$watch("typeahead_root_id", function(newVal) {
            if (!newVal) {
                return;
            }
            var cached = $scope.typeahead_cache[ $scope.typeahead_cache_indices[newVal] ];
            if (!cached) {
                return;
            }
            var newExpr = cached.xid ? "_xid_: " + cached.xid : "_uid_: " + cached.uid;
            var newCode = $scope.active_tab.code.replace(/me\s*\([^()]+\)/, "me(" + newExpr + ")");
            if (newCode == $scope.active_tab.code && newCode.indexOf(newExpr) < 0) {
                alert('Your query must contain string "me(_xid_: <some id>) for autocomplete to work"');
            }
            $scope.active_tab.code = newCode;

            if ($scope.typeahead_cache.length > 1e5) {
                // Cache is flushed after user has selected something in the typeahead.
                $scope.flush_typeahead_cache();
                $scope.found_entity(cached);
            }
        });

        var translate_kg_id = function(kgid) {
            return kgid.substr("kg:/".length).replace('/', '.');
        };

        $scope.fetch_kg = function(query) {
            return $http.get("https://kgsearch.googleapis.com/v1/entities:search", {
                params: {
                    key: "AIzaSyAiTPA51qB8hwBsbIt99Lwka0zo3z_0vQk",
                    limit: 200,
                    types: ["Person", "Movie"],
                    query: query
                }
            }).then(function(response) {
                if (!response.data || !response.data.itemListElement) {
                    return [];
                }
                var res = [];
                response.data.itemListElement.forEach(function(item) {
                    var e = {
                        name: item.result.name,
                        xid: translate_kg_id(item.result['@id'])
                    };
                    $scope.found_entity(e);
                    res.push(e);
                });
                return res;
            });
        };

        $scope.$watch("active_tab.code", function(newCode) {
            if (!newCode) {
                return;
            }
            var newXID = newCode.match(/me\s*\(\s*_xid_\s*:\s*([^\s]*)\s*\)/);
            if (newXID && newXID[1]) {
                $scope.entity_selected("xid", newXID[1]);
                return;
            }

            var newUID = newCode.match(/me\s*\(\s*_uid_\s*:\s*([^\s]*)\s*\)/);
            if (newUID && newUID[1]) {
                $scope.entity_selected("uid", newUID[1]);
                return;
            }
        });

        $scope.entity_selected = function(field, value) {
            for (var i = 0; i < $scope.typeahead_cache.length; i++) {
                if ($scope.typeahead_cache[i][field] == value) {
                    $scope.typeahead_root_id = $scope.typeahead_cache[i].name;
                    return;
                }
            }
            $scope.typeahead_root_id = undefined;
        };

        $scope.cache_entities = function(obj) {
            if (!obj) {
                return;
            }
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
                url: '/query',
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

angular.module('darthGraph').directive('selectOnClick', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}]);
