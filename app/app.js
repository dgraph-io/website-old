'use strict';

// I am Darth Graph! join the dark side of the source.
angular.module('darthGraph', ['ui.ace']).
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
                title: 'Entity Properties',
                sample_code: "" +
"{\n" +
"    me(_xid_: m.06pj8) {\n" +
"        type.object.name.en\n" +
"        film.director.film {\n" +
"            type.object.name.en\n" +
"            film.film.starring {\n" +
"                film.performance.actor {\n" +
"                    film.director.film {\n" +
"                        type.object.name.en\n" +
"                    }\n" +
"                    type.object.name.en\n" +
"                }\n" +
"            }\n" +
"            film.film.initial_release_date\n" +
"            film.film.country\n" +
"            film.film.genre {\n" +
"                type.object.name.en\n" +
"            }\n" +
"        }\n" +
"}\n"
            },
            {
                title: 'Nested List',
                sample_code: "me(_uid_: m.1234) {\n" +
                "    {\n" +
                "        foo\n" +
                "        bar\n" +
                "    }\n" +
                "}"
            },
            {
                title: 'Pure Awesomeness',
                sample_code: "me(_uid_: m.1234) {\n    foo\n    bar\n}",
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

        $scope.runQuery = function(query) {
            $http({
                url: 'http://dgraph.xyz:8080/query',
                method: 'POST',
                data: query
            }).then(function(response) {
                    $scope.query_result = response.data._root_&& response.data._root_[0];
                    $scope.json_result = JSON.stringify($scope.query_result, null, 2);
                }, function(error) {
                    console.log(error);
                    alert('error: ' + error);
                });
        };
    });
