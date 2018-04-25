let
    mongoose = require('mongoose'),
    Schema = mongoose.Schema
;

let pageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: false,
        default: ''
    }
});

let buttonSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    selector: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: false,
        default: ''
    }
});

// Mongoose schema for User objects.
let courseSchema = new Schema({
    courseTitle: {
        type: String,
        required: true,
        unique: true
    },
    courseSlug: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    splashTitle: {
        type: String,
        required: true
    },
    splashInstructions: {
        type: String,
        required: true
    },
    userNomenclature: {
        type: String,
        required: true
    },
    pages: [pageSchema],
    buttons: [buttonSchema]
});


module.exports = mongoose.model('Course', courseSchema);