let
    mongoose = require('mongoose'),
    Schema = mongoose.Schema
;

// Mongoose schema for User objects.
let courseSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('Course', courseSchema);