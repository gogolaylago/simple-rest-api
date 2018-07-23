'use strict'

var bodyParser = require('body-parser');
var logger = require('morgan');
var routes = require('./routes');
var express = require('express');
var mongoose = require('mongoose');
var app = express();

// log colorful status code using morgan logger
app.use(logger('dev'));

// must introduce the parser before handling any req.body
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/qa');
var db = mongoose.connection;
db.on('error', (err) => {
    console.error('connection error:', err);
});

// 'once' differs from 'on' in that it releases db from listening at all times
db.once('open', () => {
    console.log('MongoDB connection successful');
})

// the routes module can be connected as a middleware
// only handle routes that start with /questions
// which is concatenated with the rest of the routes in routes.js
app.use('/questions', routes);

//catch 404
app.use((req, res, next) => {
    var err = new Error('404 Not Found');
    err.status = 404;
    next(err);
})

// Error handlers have 4 params, unlike other middlewares
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    })
})

//
// listen on port 3000 unless in production
var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Express app is running on port ${port}`);
});