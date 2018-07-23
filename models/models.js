'use strict';

var mongoose = require('mongoose');

var AnswerSchema = new mongoose.Schema({
	text: String,
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now},
	votes: {type: Number, default:0}
});

// note that you can't define QuestionSchema before AnswerSchema or else
// you'll get 'Invalid value for schema Array path `answers`'
var QuestionSchema = new mongoose.Schema({
	text: String,
    createdAt: {type: Date, default: Date.now},
	answers: [AnswerSchema]
});

// create an instance method 'update' to be used on instances of the AnswerSchema
AnswerSchema.method("update", function(updates, callback) {
    // update the old answer 'this' with the new answer 'updates'
    Object.assign(this, updates, {updatedAt: new Date()});
    // this.parent = instance of the QuestionSchema
	this.parent().save(callback);
});

// create an instance method 'vote' to be used on instances of the AnswerSchema
AnswerSchema.method("vote", function(vote, callback) {
	if(vote === "up") {
		this.votes += 1;
	} else {
		this.votes -= 1;
	}
	this.parent().save(callback);
});

// defining a function for sorting algorithm
var sortAnswers = function(a, b) {
	//- negative a before b
	//0 no change
	//+ positive a after b
	if(a.votes === b.votes){
		return b.updatedAt - a.updatedAt;
	}
	return b.votes - a.votes;
}

QuestionSchema.pre("save", function(next){
	this.answers.sort(sortAnswers);
	next();
});

var Question = mongoose.model("Question", QuestionSchema);

module.exports.Question = Question;














