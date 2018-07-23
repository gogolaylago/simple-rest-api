'use strict';

var express = require('express');
var Question = require('./models/models').Question;
var router = express.Router();

// /qid handler: whenever the /qid param is present, trigger the callback
// by doing this, you don't have to handle the /qid route in any sub-routes
router.param('qid', function(req, res, next, id) {
    Question.findById(id, function(err, doc) {
        if (err) return next(err);
        if (!doc) {
            err = new Error('Not Found!');
            err.status = 404;
            next(err);
        }
        req.question = doc;
        next();
    });
})

// /aid handler
router.param('aid', function(req, res, next, id){
	req.answer = req.question.answers.id(id);
	if(!req.answer) {
		err = new Error("Not Found");
		err.status = 404;
		return next(err);
	}
	next();
});

//'/' is actually a sub-route of /question
router.get('/', function(req, res, next) {
    Question.find({})
        .sort({createdAt: -1})
            .exec(function(err, questions) {
                if (err) return next(err);
                res.json(questions)
            })
})

router.post('/', function(req, res, next) {
    var question = new Question(req.body);
    question.save(function(err, question) {
        if (err) return next(err);
        res.status = 201;
        res.json(question);
    })
})

// use the /qid handler
router.get('/:qid', function(req, res, next) {
    res.json(req.question);
})

router.post('/:qid/answers', function(req, res, next) {
    req.question.answers.push(req.body);
    req.question.save(function(err, question) {
        if (err) return next(err);
        res.status(201); // successfully saved
        res.json(question);
    });
})

// use the /qid handler
router.get('/:qid/answers/:aid', function(req, res, next) {
    res.json(req.answer);
})

// use the /aid handler
// this is a PUT request so use the update instance method defined in models.js
router.put('/:qid/answers/:aid', function(req, res) {
    req.answer.update(req.body, function(err, updatedAnswer) {
        if (err) return next(err);
        res.json(updatedAnswer);
    })
})

router.delete('/:qid/answers/:aid', function(req, res) {
    req.answer.remove(function(err) {
        if (err) return next(err);
        req.question.save(function(err, updatedParentQuestion) {
            if (err) return next(err);
            res.json(updatedParentQuestion);
        })
    })
})

// you can pass any numbers of callback functions to express
router.post('/:qid/answers/:aid/vote-:dir', function(req, res, next) {
      if (req.params.dir.search(/^(up|down)$/) === -1) {
          var err = new Error('404 Not Found');
          err.status = 404;
          next(err);
      } else {
          req.vote = req.params.dir;
          next();
      }
    }, function(req, res, next) {
        req.answer.vote(req.vote, function(err, question) {
            if (err) return next(err);
            res.json(question);
        })
})

module.exports = router;
















