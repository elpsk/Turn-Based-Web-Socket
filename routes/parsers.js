var express   = require('express');
var router    = express.Router();
var http      = require('http');
var path      = require('path');
var events    = require('events');
var net       = require('net');
var mongoose  = require("mongoose");

var model     = require('../models/Kebab').places;
var Kebab     = mongoose.model('places', model);


router.get('/', function(req, res, next) {
    res.redirect('../');
});

router.get('/merge', function(req, res, next) {

    mongoose.connect('mongodb://10.0.33.34/kebab');

    var core            = require('../core/engine.js');
    var modeler         = require('../core/modeler.js');
    var optimizedData   = [];
    var done            = 0;
    var coords          = req.query.coords;
    var city            = req.query.city;

    core.foursquareData(req.kw, coords, function(data) {
        for ( var i = 0; i < data.length; i++ ) {
            var kebabInfo = modeler.modelForEngine( "fq", data[i] );
            kebabInfo.save();
            optimizedData.push(kebabInfo);
        }

        getOut ( ++done, optimizedData, res );
    });


    core.yellowPagesData(req.kw, city, function(data) {
        for ( var i = 0; i < data.length; i++ ) {
            var kebabInfo = modeler.modelForEngine( "pg", data[i] );
            kebabInfo.save();
            optimizedData.push(kebabInfo);
        }

        getOut ( ++done, optimizedData, res );
    });

});

function getOut ( counter, data, res ) {
    if ( counter == 2 ) {
        res.send( data );
        mongoose.disconnect();
    }
}

router.get('/search', function(req, res, next) {

    var core = require('../core/engine.js');

    if ( req.query.engine == "fq" ) {
        core.foursquareData(req.kw, req.query.coords, function(data) {
            res.send( data );
        });
    }
    else if ( req.query.engine == "fb" ) {
        core.facebookData(req.kw, req.query.coords, req, res, function(data) {
            res.send( data );
        });
    }
    else if ( req.query.engine == "g" )
    {
        core.googleData(req.kw, req.query.coords, function(data) {
            res.send( data );
        });
    }
    else if ( req.query.engine == "pg" )
    { 
        core.yellowPagesData(req.kw, req.query.coords, function(data) {
            res.send( data );
        });
    }

    res.send( {"status":"ko", "key" : req.kw} );
});

module.exports = router;
