var mongoose = require("mongoose");

module.exports = 
{
    places: mongoose.Schema(
    {
        name:  {
            type : String,
            required : true,
            unique: true
        },
        location: {
            type: [Number],
            index: '2d',
            required : true,
            unique: true
        },
        geo: {
            address : String,
            city    : String,
            state   : String,
            country : String,
            zip     : String
        }
    })
};
