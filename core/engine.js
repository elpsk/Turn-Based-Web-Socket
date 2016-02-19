
var keys = require('./config.js');

module.exports = 
{
    foursquareData : function(query, coordinate, callback) 
    {
        var foursquare = (require('foursquarevenues'))(
            keys.kFoursquareKey(), 
            keys.kFoursquareSecret()
        );

        var params = {
            "ll"    : coordinate,
            "query" : query,
            "limit" : 10000
        };

        foursquare.getVenues(params, function(error, venues) {
            if ( !error ) {
                return callback( venues.response.venues );
            }
            return callback(null);
        });
    },

    facebookData : function(query, coordinate, req, res, callback) 
    {
        //
        // https://developers.facebook.com/tools/explorer/145634995501895/?method=GET&path=%7Bplace-id%7D&version=v2.5
        //

        var graph = require('fbgraph');

        var conf = {
            client_id:      '496774040507677', 
            client_secret:  'e20008e726b8d257dc11b21f61ce5541', 
            redirect_uri:   'http://localhost:3028/parsers/search?engine=fb&src=fb'
        };

        var authUrl = graph.getOauthUrl({
            "client_id":     conf.client_id, 
            "redirect_uri":  conf.redirect_uri
        });

        if ( req.query.code ) 
        {
            graph.authorize({
                "client_id":      conf.client_id, 
                "redirect_uri":   conf.redirect_uri, 
                "client_secret":  conf.client_secret, 
                "code":           req.query.code
            }, 
            function (err, facebookRes) 
            {
                var request = require("request");
                var url = keys.kFacebookBaseUrl() + 
                            "type=place&q=" + 
                            query +
                            "&center=" +
                            coordinate + 
                            "&distance=5000&access_token=" + 
                            facebookRes.access_token + 
                            "&limit=2&offset=0" + 
                            "&__after_id=" +
                            keys.kFacebookAfterID();

                request(url, function(error, response, body) 
                {
                    return callback( JSON.parse(body) );
                });        
            });
        }
        else
        {
            res.redirect( authUrl );
        }
    },

    googleData : function(query, coordinate, callback) 
    {
        var retVal = {"status" : 5, "message" : "not yet implemented"};
        return callback( retVal );
    },
    
    yellowPagesData : function(query, coordinate, callback) 
    {
        var request = require("request");
        var url = keys.kYellowPagesBaseUrl() + 
                    "client=android&version=1.0&sortby=distance&device=Samsung&what=" + 
                    query +
                    "&where=" + 
                    coordinate + 
                    "&pagesize=10000&page=0&output=json";
        
        request(url, function(error, response, body) 
        {
            var retVal = JSON.parse(body);
            return callback( retVal.results );
        });        
    }

};

