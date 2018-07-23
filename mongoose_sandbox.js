'use strict';

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sandbox');
var db = mongoose.connection;

// listen for any errors
db.on('error', (err) => {
    console.error('connection error:', err);
});

// 'once' differs from 'on' in that it releases db from listening at all times
db.once('open', () => {
    console.log('MongoDB connection successful');

    // make a schema by constructing a new mongoose.Schema
    var AnimalSchema = new mongoose.Schema({
        type:  {type: String, default: 'goldfish'}, 
        size:  String,
        color: {type: String, default: 'golden'},
        mass:  {type: Number, default: 0.007},
        name:  {type: String, default: 'Angela'}
    })

    // implement a pre-hook middleware on AnimalSchema right before saving
    // don't use arrow function for the 'next' param. Why though...? : Answer:
    // Do not declare statics using ES6 arrow functions (=>). Arrow functions explicitly prevent 
    // binding 'this', so it will not work because of the value of 'this'.
    AnimalSchema.pre('save', function(next) {
        if (this.mass >= 100) {
            this.size = 'big';
        } else if (this.mass >= 5 && this.mass < 100) {
            this.size = 'medium';
        } else {
            this.size = 'small';
        }
        next();
    })

    // static method: create custom functions that can be called on your model directly
    AnimalSchema.statics.findSize = function(size, callback) {
        // this = Animal object
        return this.find({size: size}, callback);
    }

    // instance methods exist on all documents
    AnimalSchema.methods.findSameColor = function(callback) {
        // perform the function on the Animal object, which is your document
        return this.model('Animal').find({color: this.color}, callback)
    }

    // use AnimalSchema to create a mongoose object called a 'Animal',
    // which will create and save document objects.
    // 'Animal' will map to a collection in the db named 'animals' whenever
    // a document is saved. Notice that we didn't defined 'animals' anywhere
    var Animal = mongoose.model('Animal', AnimalSchema);

    // the elephant document is created in memory of the app
    // but mongoose won't have it until you save it
    var elephant = new Animal({
        type: 'elephant',
        color: 'gray',
        mass: 6000,
        name: 'Lawrence'
    })
    
    // create a default animal, goldfish
    var animal = new Animal({});

    var whale = new Animal({
        type: 'whale',
        mass: 190500,
        name: 'Fig'
    })

    var animalData = [
        {
            type: 'mouse',
            color: 'gray',
            mass: 0.035,
            name: 'Marvin'
        },
        {
            type: 'nutria',
            color: 'brown',
            mass: 6.35,
            name: 'Gretchen'
        },
        {
            type: 'wolf',
            color: 'gray',
            mass: 45,
            name: 'Iris'
        },
        whale,
        elephant,
        animal
    ]

    // remove all documents
    Animal.remove({}, (err) => {
        if (err) console.error(err);
        Animal.create(animalData, (err) => {
            if (err) console.error(err);
            Animal.findOne({type: 'elephant'}, (err, elephant) => {
                elephant.findSameColor(function(err, animals) {
                    animals.forEach((animal) => {
                        console.log(animal.name + ' the ' + animal.color + ' ' + animal.type + ' is of size ' + animal.size);
                    })
                    db.close(() => {
                        console.log('MongoDB connection closed');
                    })
                })
            })
        })
    })
})
