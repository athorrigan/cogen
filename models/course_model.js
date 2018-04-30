let
    mongoose = require('mongoose'),
    Schema = mongoose.Schema
;

// Represents a page within a course.
let pageSchema = new Schema({
    // The title of an individual page.
    name: {
        type: String,
        required: true
    },
    // The path fragment in the URL that will represent this page.
    path: {
        type: String,
        required: true
    },
    // An ID apart from the Mongo implementation. This ID is used for identifying data
    // fragments within jqTree.
    id: {
        type: String,
        required: true
    },
    // The actual content of the page.
    data: {
        type: String,
        required: false,
        default: ''
    }
});

// Because of the nature of JS, we can't recursively add this schema because it has
// no reference internally. So we add the recursive schema after the initial declaration.
pageSchema.add({
    pages: {
        type: [pageSchema],
        required: false
    }
});

// Represents the buttons at the top of the course.
let buttonSchema = new Schema({
    // The title given to the button.
    name: {
        type: String,
        required: true
    },
    // The base for all css-selectors to be used for this button.
    selector: {
        type: String,
        required: false
    },
    // A description of what this button represents.
    description: {
        type: String,
        required: true
    },
    // The icon that we're using to represent the button.
    icon: {
        type: String,
        required: true
    },
    // Again this is not a DB ID, it's solely for the purpose of interacting with jqTree.
    id: {
        type: String,
        required: true
    },
    // The content of the modal attached to the button.
    data: {
        type: String,
        required: false,
        default: ''
    }
});

// Mongoose schema for User objects.
let courseSchema = new Schema({
    // This must be unique as it represents the course within the system in terms
    // of URLs as well.
    courseTitle: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // A path where the course can be found.
    coursePath: {
        type: String,
        required: false,
        unique: true,
        index: true
    },
    // A brief summary of the course.
    courseSlug: {
        type: String,
        required: true
    },
    // A fancy name usually concocted from a bunch of Ciscoesque acronyms (IE: LTRDCN-3077)
    courseName: {
        type: String,
        required: true
    },
    // A greeting to appear on the splash page for the course.
    splashTitle: {
        type: String,
        required: true
    },
    // Instructions for how the student should proceed once they land on the splash page.
    splashInstructions: {
        type: String,
        required: true
    },
    // What we call an individual student. Sometimes it's "student", sometimes it's pod. It's arbitrary.
    // Since this is being dumped directly on the front-end, "Student" may be favorable
    // to "student", depending on your needs.
    userNomenclature: {
        type: String,
        required: true
    },
    // The array of pages that are related to this course.
    pages: [pageSchema],
    // The array of buttons that are related to this course.
    buttons: [buttonSchema]
});

// We need to ensure that path is filled properly
courseSchema.pre('save', function(next) {
    let course = this;

    if (!course.coursePath) {
        course.coursePath = course.courseTitle.toLowerCase().replace(/\s+/g,'-');
    }

    next();
});

module.exports = mongoose.model('Course', courseSchema);