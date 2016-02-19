var express   = require('express');
var router    = express.Router();
var http      = require('http');
var path      = require('path');
var events    = require('events');
var net       = require('net');
var mongoose  = require("mongoose");

router.get('/', function(req, res) {
    res.send({
        "status" : "1",
        "servers" : [
            { 
                "g" : "google",
                "pg" : "yellow pages",
                "fq" : "foursquare",
                "fb" : "facebook"
            }
        ],
        "key" : req.kw
        });
});


router.get('/aroundme', function(req, res) {

    var lat = req.query.lat;
    var lon = req.query.lon;

    mongoose.connect('mongodb://10.0.33.34/kebab');

    var model = require('../models/Kebab').places;
    var Kebab = mongoose.model('places', model);

    var distance = 1000 / 6371;
    var query = Kebab.find(
        {
            'location': {
                $near: [
                    lat,
                    lon
                ],
                $maxDistance: distance
        }
    });
    query.exec(function (err, city) {
        if ( err ) {
            mongoose.disconnect();
            console.log(err);
            throw err;
        }

        if ( city ) {
            res.json(city);
        }
        
        mongoose.disconnect();
    });

});

module.exports = router;
