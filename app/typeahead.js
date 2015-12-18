/**
 * Created by paul on 2/12/15.
 */

define('ace/mode/graphql', [], function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var Tokenizer = require("ace/tokenizer").Tokenizer;
    var GraphqlHighlightRules = require("ace/mode/graphql_highlight_rules").GraphqlHighlightRules;

    var Mode = function() {
        this.HighlightRules = GraphqlHighlightRules;

    };
    oop.inherits(Mode, TextMode);

    exports.Mode = Mode;
});

define('ace/mode/graphql_highlight_rules', [], function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var GraphqlHighlightRules = function() {

        var filter_all = function(pat) {
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
        };

        var keywordMapper = this.createKeywordMapper({
            "variable.language": "film[^\s]*",
            "keyword":
                "me|_xid_|_uid_",
            "constant.language":
                "type[^\s]*"
        }, "text", true);

        // keyword - purple, object and meta
        // string - green, film
        // support.function - blue, director
        // constant.language - orange, actor
        // variable.language - red
        this.$rules = {
            start:[
                {
                    token: "keyword",
                    regex: filter_all("type.")
                },
                {
                    token: "keyword",
                    regex: "_[xu]id_|me"
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

        this.normalizeRules();
    };

    oop.inherits(GraphqlHighlightRules, TextHighlightRules);

    exports.GraphqlHighlightRules = GraphqlHighlightRules;
});


var langTools = ace.require("ace/ext/language_tools");


var dgraphCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
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
langTools.addCompleter(dgraphCompleter);


window.DGraph_All_Predicates = [
    "film.actor.dubbing_performances",
    "film.actor.film",
    "film.cinematographer.film",
    "film.content_rating.country",
    "film.content_rating.film",
    "film.content_rating.film_rating_system",
    "film.content_rating.minimum_accompanied_age",
    "film.content_rating.minimum_unaccompanied_age",
    "film.content_rating_system.film_ratings",
    "film.content_rating_system.jurisdiction",
    "film.director.film",
    "film.editor.film",
    "film.film.apple_movietrailer_id",
    "film.film_art_director.films_art_directed",
    "film.film_casting_director.films_casting_directed",
    "film.film_character.portrayed_in_films",
    "film.film_character.portrayed_in_films_dubbed",
    "film.film.cinematography",
    "film.film_collection.films_in_collection",
    "film.film_company.films",
    "film.film_company_role_or_service.companies_performing_this_role_or_service",
    "film.film.costume_design_by",
    "film.film_costumer_designer.costume_design_for_film",
    "film.film.country",
    "film.film_crew_gig.crewmember",
    "film.film_crew_gig.film",
    "film.film_crew_gig.film_crew_role",
    "film.film_crewmember.films_crewed",
    "film.film_cut.film",
    "film.film_cut.film_release_region",
    "film.film_cut.note",
    "film.film_cut.runtime",
    "film.film_cut.type_of_film_cut",
    "film.film.directed_by",
    "film.film_distribution_medium.films_distributed_in_this_medium",
    "film.film_distributor.films_distributed",
    "film.film.distributors",
    "film.film.dubbing_performances",
    "film.film.edited_by",
    "film.film.estimated_budget",
    "film.film.executive_produced_by",
    "film.film.fandango_id",
    "film.film.featured_film_locations",
    "film.film.featured_song",
    "film.film_featured_song.featured_in_film",
    "film.film_featured_song.performed_by",
    "film.film_festival.date_founded",
    "film.film_festival_event.festival",
    "film.film_festival_event.films",
    "film.film_festival.focus",
    "film.film_festival_focus.festivals_with_this_focus",
    "film.film_festival.individual_festivals",
    "film.film_festival.location",
    "film.film_festival_sponsor.festivals_sponsored",
    "film.film_festival.sponsoring_organization",
    "film.film.film_art_direction_by",
    "film.film.film_casting_director",
    "film.film.film_collections",
    "film.film.film_festivals",
    "film.film.film_format",
    "film.film.filming",
    "film.film.film_production_design_by",
    "film.film.film_series",
    "film.film.film_set_decoration_by",
    "film.film_format.film_format",
    "film.film.genre",
    "film.film_genre.films_in_this_genre",
    "film.film.gross_revenue",
    "film.film.initial_release_date",
    "film.film_job.films_with_this_crew_job",
    "film.film.language",
    "film.film_location.featured_in_films",
    "film.film.locations",
    "film.film.metacritic_id",
    "film.film.music",
    "film.film.netflix_id",
    "film.film.nytimes_id",
    "film.film.other_crew",
    "film.film.other_film_companies",
    "film.film.personal_appearances",
    "film.film.post_production",
    "film.film.pre_production",
    "film.film.prequel",
    "film.film.primary_language",
    "film.film.produced_by",
    "film.film.production_companies",
    "film.film_production_designer.films_production_designed",
    "film.film.rating",
    "film.film_regional_release_date.film_release_region",
    "film.film_regional_release_date.release_date",
    "film.film.release_date_s",
    "film.film.rottentomatoes_id",
    "film.film.runtime",
    "film.film.sequel",
    "film.film_series.films_in_series",
    "film.film_set_designer.film_sets_designed",
    "film.film_song.films",
    "film.film_song_performer.film_songs",
    "film.film.songs",
    "film.film.soundtrack",
    "film.film.starring",
    "film.film.story_by",
    "film.film_story_contributor.film_story_credits",
    "film.film_subject.films",
    "film.film.subjects",
    "film.film.tagline",
    "film.film.traileraddict_id",
    "film.film.trailers",
    "film.film.written_by",
    "film.music_contributor.film",
    "film.performance.actor",
    "film.performance.character",
    "film.performance.character_note",
    "film.performance.film",
    "film.performance.special_performance_type",
    "film.personal_film_appearance.film",
    "film.personal_film_appearance.person",
    "film.personal_film_appearance_type.film_appearances",
    "film.personal_film_appearance.type_of_appearance",
    "film.person_or_entity_appearing_in_film.films",
    "film.producer.film",
    "film.producer.films_executive_produced",
    "film.production_company.films",
    "film.special_film_performance_type.film_performance_type",
    "film.writer.film",
    "topic_server.schemastaging_corresponding_entities_type",
    "topic_server.webref_cluster_members_type",
    "type.object.type",
    "type.object.name.en",
    "type.property.expected_type",
    "type.property.reverse_property",
    "type.property.schema",
];
