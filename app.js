var express      = require('express');
var path         = require('path');
var bodyParser   = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views',  path.join(__dirname, 'views'));
app.set('view engine', 'jade');


var searchKeyword = "kebab";

app.use(function( req, res, next ) {
    req.kw = searchKeyword;
    next();
});

var routes  = require('./routes/routes');
var parsers = require('./routes/parsers');

app.use('/', routes);
app.use('/parsers', parsers);


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({ status : "ko", error : err.message });
});

module.exports = app;
