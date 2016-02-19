
var mongoose  = require("mongoose");
var model     = require('../models/Kebab').places;
var Kebab     = mongoose.model('places', model);
var keys      = require('./config.js');

module.exports = 
{
    modelForEngine : function( engine, data ) 
    {
        var kebabInfo = new Kebab();

        kebabInfo.name = data.name;

        if ( engine == "fq" ) 
        {
            kebabInfo.geo.address = data.location.address;
            kebabInfo.geo.city    = data.location.city;
            kebabInfo.geo.state   = data.location.state;
            kebabInfo.geo.country = data.location.country;
            kebabInfo.geo.zip     = data.location.postalCode;
            kebabInfo.location    = [ 
                data.location.lat, 
                data.location.lng
            ];
        }
        else if ( engine == "pg" ) 
        {
            kebabInfo.geo.address = data.address;
            kebabInfo.geo.city    = data.city;
            kebabInfo.geo.country = data.country;
            kebabInfo.geo.zip     = data.zip;
            kebabInfo.location    = [ 
                data.latitude, 
                data.longitude
            ];
        }

        return kebabInfo;
    }
    
};