'use strict';

const
    // Node's builtin filesystem interaction library.
    fs = require('fs'),
    // Need to use the process library to get environmental vars
    process = require('process'),
    // CSV parsing library
    Baby = require('babyparse'),
    // Library for globbing multiple files matching a pattern.
    glob = require('glob-fs'),
    // Functional programming library
    _ = require('underscore'),
    // Mongoose library for interactions with MongoDB
    mongoose = require('mongoose'),
    // Encryption library used to encrypt user passwords
    bcrypt = require('bcrypt'),
    // MongoDB user model.
    User = require('../models/user_model'),
    Course = require('../models/course_model')
;

if (typeof process.env.COGEN_PW === 'undefined' || typeof process.env.COGEN_USER === 'undefined') {
    console.log('Need to set up environmental variables for database credentials.');
    process.exit(1);
}

let
    options = {
        user: process.env.COGEN_USER,
        pass: process.env.COGEN_PW
    }
;

//--- Callbacks --- //
/**
 * This callback deals with Mongoose user objects.
 *
 * @callback userCallback
 * @param {Object} err An error object thrown in the calling function.
 * @param {User} user A mongoose representation of a User object.
 */

/**
 * This callback deals with Mongoose course objects.
 *
 * @callback userCallback
 * @param {Object} err An error object thrown in the calling function.
 * @param {Course} course A mongoose representation of a Course object.
 */

/**
 * This callback deals with Mongoose course objects in a plural context.
 *
 * @callback userCallback
 * @param {Object} err An error object thrown in the calling function.
 * @param {Course[]} courses A mongoose representation of an array of Course objects.
 */

/**
 * Utility service to handle the interface with our course data.
 *
 * @module course_service
 */
let course_service = {
    /**
     * Fetches relevant course data.
     *
     * @param {string} courseId Identification string for the course.
     * @param {courseCallback} A callback function that will operate on the course data.
     */
    getCourse: (coursePath, cb) => {
        console.log(coursePath);

        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options);

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        // Create a course path in schema instead. Use a save function to verify
        // that it's autofilled accordingly.
        // Also need to make sure the CSVs are named accordingly since that's manual still.
        Course.findOne({
                coursePath: coursePath
            })
            .exec((err, course) => {
                console.log(course);

                cb(err, course);
            })
        ;
    },
    /**
     * Fetches basic course data for each course.
     *
     * @param {coursesCallback} A callback function that will operate on the courses data.
     */
    getCourses: (cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options);

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        Course.find({}).select({
                "courseTitle": 1,
                "courseName": 1,
                "courseBrief": 1,
                "courseSlug": 1,
                "splashTitle": 1,
                "_id": 0
            })
            .exec((err, courses) => {
                let courseList = [];

                courses.forEach((tempCourse) => {
                    var course = {};

                    course.courseTitle = tempCourse.courseTitle;
                    course.courseName = tempCourse.courseName;
                    course.courseBrief = tempCourse.courseBrief;
                    course.courseSlug = tempCourse.courseSlug;
                    course.splashTitle = tempCourse.splashTitle;
                    course.courseLink = '/edit-course/' + tempCourse.courseTitle.toLowerCase().replace(/\s+/g,'-');
                    courseList.push(course);
                });

                cb(err, courseList);
            })
        ;
    },
    /**
     * This fetches the individual variables linked to a specific user for
     * this lab.
     *
     * @param {string} courseTitle The title of the course linked to the data.
     * @param {string} studentId The user id that the variables are linked to.
     * @returns {Object} An object containing variables for this user.
     */
    getUserVars: (courseTitle, studentId) => {
        // Read in the CSV file
        let csvData = fs.readFileSync('data/courses/' + courseTitle.replace(/-/g,'_') + '_variables.csv').toString();
        // Convert the CSV data into JSON
        let jsonData = Baby.parse(csvData, {header: true}).data;

        // Pull out and return a subset of the JSON that represents
        // variables linked to this user.
        return _.findWhere(jsonData, { number: studentId});
    },
    /**
     * This sets default student variable values for a template when no session has been started.
     *
     * @param {string} courseTitle The title of the course linked to the data.
     * @returns {Object} An object containing default vars for students for this course.
     */
    getStudentDefaults: (courseTitle) => {
        // Read in the CSV file
        let csvData = fs.readFileSync('data/courses/' + courseTitle.replace(/-/g,'_') + '_variables.csv').toString();

        // Convert the CSV data into JSON
        let jsonData = Baby.parse(csvData, {header: true}).data;

        let modifiedData = _.mapObject(jsonData[0], (val, key) => {
            return '{{' + key + '}}';
        });

        return modifiedData;
    },
    /**
     *
     * @param {string} courseTitle The title of the course linked to the data.
     * @returns {string[]} A list of variable names.
     */
    getVariableNames: (courseTitle) => {
        // Read in the CSV file
        let csvData = fs.readFileSync('data/courses/' + courseTitle.replace(/-/g,'_') + '_variables.csv').toString();

        // Transform the CSV data into JSON
        let jsonData = Baby.parse(csvData, {header: true}).data;

        // Use lodash to return just the keys of the first object.
        return _.keys(jsonData[0]);
    },
    /**
     * Get a list of users that we currently have data for
     *
     * @returns {string[]} A list of student numbers.
     */
    getStudents: (courseTitle) => {
        // Read in the CSV file.
        let csvData = fs.readFileSync('data/courses/' + courseTitle.replace(/-/g,'_') + '_variables.csv').toString();

        // Transform the CSV data into JSON
        let jsonData = Baby.parse(csvData, {header: true}).data;

        // Underscore's pluck() method returns an array of all of the values
        // from each JSON node that represent a specific field. In this case
        // it pull the 'number' field from each student in the data set.
        return _.pluck(jsonData, 'number');
    },
    /**
     * Acquires a user object from the database.
     *
     * @param {string} username The username of the user.
     * @param {Function} cb A callback function to call after completion.
     * @returns {userCallback} The callback function is invoked which should also return
     *  a callback invocation using the "done" callback.
     */
    findUser: (username, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';

        mongoose.connect(mongoDB, options);

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        User.findOne({username: username})
            .exec((err, userObject) => {
                if (userObject) {
                    cb(err, userObject);
                }
                else {
                    cb(err);
                }
            })
        ;
    },
    /**
     * Saves a user to the database.
     *
     * @param {User} user A Mongoose modeled User object.
     * @param {userCallback} cb A callback function to call after completion.
     */
    saveUser: (user, cb) => {
        // Connect to Mongo.
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options);

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        user.save((err, userObject) => {
            User.findOne({username: user.username})
                .exec((err, userObject) => {
                    cb(err, userObject);
                })
            ;
        });
    },
    /**
     * Fetches data related to an individual course based on its ID.
     *
     * @param {string} path String representation of a course's path.
     * @param {Object[]} dataObjects An array of JavaScript objects containing info for all courses.
     * @returns {Object} A subset of the passed in Object representing data for an individual course.
     */
    fetchData: (path, dataObjects) => {
        // Search the passed in course data for data specific to this course.
        let fetchedNode = _.findWhere(dataObjects, {
            path: path
        });

        let fetchedData;

        // Check if the past search found any relevant data.
        // If so, return it.
        if (fetchedNode) {
            fetchedData = fetchedNode.data;
            return fetchedData;
        }

        // If the past search didn't find the relevant data, we
        // then search each child element for the course data.
        // We use some because we want to short circuit once we
        // find our data rather than carrying through the entire
        // loop.
        dataObjects.some(function(obj) {
            // If a child object has more children and we still
            // haven't found what we're looking for, we recursively
            // sift through them as well.
            if (obj.children) {
                fetchedData = course_service.fetchData(path, obj.children);
                if (fetchedData) {
                    // Array.some() short circuits when an iteration returns true.
                    return true;
                }
            }
        });

        return fetchedData;
    },
    /**
     * Creates a chunk of a menu string based on the
     * JavaScript object fragment passed in.
     *
     * @param {Object} jsonFragment A JavaScript object containing partial course data.
     * @param {string} courseId The ID of the individual course we're viewing.
     * @returns {string} An HTML string (<list>) representing a chunk of the menu.
     */
    accumMenu: (jsonFragment, courseId) => {
        let currentString = '';

        // If the fragment has children, we dig into those first...
        if (jsonFragment.children) {
            // If there are children, then this menu item will be a drawer
            // That will display the sub elements beneath when it is selected.

            // If the top level page has data, we need to link it to the relevant
            // course page
            if (jsonFragment.data !== '') {
                currentString +=
                    '<li class="sidebar-drawer" data-id="' + jsonFragment.path + '" >' +
                        '<a href="/courses/' + courseId + '/' + jsonFragment.path + '" class="sidebar-toggle">' +
                            jsonFragment.name +
                        '</a>'
                ;
            }
            // Otherwise we simply want it to operate as a drawer to show
            // the submenu items.
            else {
                currentString +=
                    '<li class="sidebar-drawer" data-id="' + jsonFragment.path + '" data-empty="true">' +
                        '<a href="#" class="sidebar-toggle">' +
                            jsonFragment.name +
                        '</a>'
                ;
            }


            // This is following the Atlantic UI convention, which follows up the initial
            // link with an unordered list representing the child elements revealed
            // when the drawer drops down.
            let substring = '<ul>';

            // Loop through all of the children of this fragment and pass them
            // recursively to this function
            jsonFragment.children.forEach((object) => {
                substring += course_service.accumMenu(object, courseId);
            });

            substring += '</ul>';

            // After we're done creating our unordered list, we
            // append it to our return string.
            currentString += substring;

            // Seal up our list.
            currentString += '</li>';
        }
        // ... otherwise we just output a link for the individual element.
        else {
            currentString +=
                '<li data-id="' + jsonFragment.path + '" >' +
                    '<a href="/courses/' + courseId + '/' + jsonFragment.path + '" class="sidebar-item">' +
                        jsonFragment.name +
                    '</a>' +
                '</li>'
            ;
        }

        return currentString;

    },
    /**
     * Initiates the creation and handback of the course menu string.
     *
     * @param {Object[]} menuObjects Array of course modules to generate a menu from.
     * @param {string} courseId String representation of the course ID in question.
     * @returns {string} A string representing the HTML code for the menu.
     */
    generateMenuString: (menuObjects, courseId) => {
        let menuString = '';

        // For each menu item, we pass it to accumMenu and then concatenate the results.
        menuObjects.forEach((object) => {
            menuString += course_service.accumMenu(object, courseId)
        });

        return menuString;
    },
    /**
     * Generates an HTML string that will be converted into a PDF.
     *
     * @param {Object[]} sections An array of course sections.
     * @param {Object} userData variables for an individual user.
     * @returns {string} A string representing the HTML for the course.
     */
    generatePdfString: (sections, userData) => {
        const
            Handlebars = require('handlebars')
        ;

        let courseTemplate;

        // Create the core HTML structure. Note that we use __dirname to get
        // an absolute path to our CSS file for inclusion. I think there are
        // size limits to the CSS file as well, since originally I tried
        // to include bootstrap as well as our local code and that choked.
        let htmlString = `
           <html>
           <head>
           <title>LTRCLD-2121: Automate Your Hybrid Cloud Network</title>
           <link rel="stylesheet" href="file://${__dirname}/../public/css/pdfcss.css">
           </head>
           <body>
        `;

        // Iterate through the course data
        sections.forEach(function(section) {
            // Add a section tag to delimit sections
            htmlString += '<section>';

            // For each section, add the title
            htmlString += '<h1>' + section.name + '</h1><br>';
            
            // Then the course data.
            if (section.data !== '') {
                // Create a Handlebars template from this section's HTML.
                courseTemplate = Handlebars.compile(section.data);

                // Append the compiled HTML string.
                htmlString += courseTemplate(userData);
            }

            if (section.children) {
                htmlString += course_service.generatePdfString(section.children, userData);
            }

            // Close each section
            htmlString += '</section>';
        });

        // Close the HTML body for the entire course.
        htmlString += `
            </body>
            </html>
        `;

        return htmlString;
    },
    /**
     * Saves course data to the appropriate file.
     *
     * @param {Object} courseData The entire contents of the course JSON.
     * @returns {string} The status of the file save operation.
     */
    saveCourse: (courseData, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options);

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        Course.update({courseTitle: courseData.courseTitle}, courseData)
            .exec((err, requestStatus) => {
                cb(err, requestStatus);
            })
        ;
    },
    /**
     * Creates a new course
     *
     * @param {Object} courseData A JSON representation of a course.
     * @param {cb} courseCallback A callback to handle validation of the course we just created.
     *
     */
    createCourse: (courseData, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options);

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        console.log(courseData.courseTitle);

        Course.create(courseData, (err, course) => {
            if (err) {
                cb(err, null);
            }
            else {
                Course.find({courseTitle: course.courseTitle}, (err, courseObject) => {
                    cb(err, courseObject);
                });
            }
        });
    }
};

module.exports = course_service;