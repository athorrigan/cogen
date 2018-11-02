'use strict';

const
    // Node's builtin filesystem interaction library.
    fs = require('fs'),
    // Need to use the process library to get environmental vars
    process = require('process'),
    // Library for globbing multiple files matching a pattern.
    glob = require('glob-fs'),
    // Functional programming library
    _ = require('underscore'),
    // Mongoose library for interactions with MongoDB
    mongoose = require('mongoose'),
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
 * @callback courseCallback
 * @param {Object} err An error object thrown in the calling function.
 * @param {Course} course A mongoose representation of a Course object.
 */

/**
 * This callback deals with Mongoose course objects in a plural context.
 *
 * @callback coursesCallback
 * @param {Object} err An error object thrown in the calling function.
 * @param {Course[]} courses A mongoose representation of an array of Course objects.
 */

/**
 * This callback deals with authentication-gated paths
 *
 * @callback privacyCallback
 * @param {Object} err An error object thrown in the calling function.
 * @param {Course} course Limited subset of course that just contains privacy information.
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
     * @param {string} coursePath courseId Identification string for the course.
     * @param {courseCallback} cb A callback function that will operate on the course data.
     */
    getCourse: (coursePath, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        // Also need to make sure the CSVs are named accordingly since that's manual still.
        Course.findOne({
                coursePath: coursePath
            })
            .then((course) => {
                cb(null, course);
             })
            .catch((err) => {
                console.log("Couldn't find course.");
                cb(err, null);
            })
        ;
    },
    /**
     * Fetches relevant course data.
     *
     * @param {string} coursePath courseId Identification string for the course.
     * @param {courseCallback} cb A callback function that will operate on the course data.
     */
    getStudentVariables: (coursePath, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        Course.findOne(
            {
                coursePath: coursePath
            })
            .select({
                "studentData": 1
            })
            .then((courseData) => {
                cb(null, courseData.studentData);
            })
            .catch((err) => {
                console.log("Couldn't find variables.");
                cb(err, null);
            })
        ;
    },
    /**
     * Fetches basic course data for each course.
     *
     * @param {coursesCallback} cb A callback function that will operate on the courses data.
     */
    getCourses: (cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

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
            .then((courses) => {
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

                cb(null, courseList);
            })
            .catch((err) => {
                console.log('Error getting courses.');
                cb(err, null);
            })
        ;
    },
    /**
     * Determines whether the course can only be viewed by an authenticated user.
     *
     * @param {string} coursePath Path of the course used for identification.
     * @param {privacyCallback} cb A callback function that will handle authentication if it's necessary.
     */
    getCoursePrivacy: (coursePath, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        // Create a course path in schema instead. Use a save function to verify
        // that it's autofilled accordingly.
        // Also need to make sure the CSVs are named accordingly since that's manual still.
        Course.findOne({
                coursePath: coursePath
            })
            .select({
                "private": 1,
                "_id": 0
            })
            .then((course) => {
                cb(null, course);
            })
            .catch((err) => {
                console.log('Error getting course privacy.');
                cb(err, null);
            })
        ;
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

        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        User.findOne({username: username})
            .then((userObject) => {
                if (userObject) {
                    cb(null, userObject);
                }
                else {
                    cb(null, undefined);
                }
            })
            .catch((err) => {
                cb(err);
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
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        user.save((err, userObject) => {
            User.findOne({username: user.username})
                .then((userObject) => {
                    cb(null, userObject);
                })
                .catch((err) => {
                    cb(err, null);
                })
            ;
        });
    },
    /**
     * Creates a new user in the database.
     *
     * @param {Object} userData The JSON representation of a user.
     * @param {userCallback} cb A callback function to handle the creation of a user.
     */
    createUser: (userData, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        User.create(userData, (err, user) => {
            if (err) {
                cb(err, null);
            }
            else {
                User.findOne({username: user.username})
                    .then((user) => {
                        cb(null, user);
                    })
                    .catch((err) => {
                        cb(err, null);
                    })
                ;
            }
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
            if (obj.children.length > 0) {
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
        if (jsonFragment.children.length > 0) {
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

            if (section.children.length > 0) {
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
     * Saves course data to the appropriate document in MongoDB.
     *
     * @param {Object} courseData The entire contents of the course JSON.
     * @param {courseCallback} cb A callback function that will operate on the courses data.
     */
    saveCourse: (courseData, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        Course.update({courseTitle: courseData.courseTitle}, courseData)
            .then((requestStatus) => {
                cb(null, requestStatus);
            })
            .catch((err) => {
                cb(err, null);
            })
        ;
    },
    /**
     * Saves student data to the course data to appropriate MongoDB field.
     *
     * @param {string} coursePath The path of the course, used for lookup.
     * @param {Object} studentData The student data associated with the course.
     * @param {courseCallback} cb A callback function that will operate on the courses data.
     */
    saveStudentVars: (coursePath, studentData, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

        Course.update({coursePath: coursePath}, {studentData: studentData})
            .then((requestStatus) => {
                cb(null, requestStatus);
            })
            .catch((err) => {
                cb(err, null);
            })
        ;
    },
    /**
     * Creates a new course
     *
     * @param {Object} courseData A JSON representation of a course.
     * @param {courseCallback} cb A callback to handle validation of the course we just created.
     *
     */
    createCourse: (courseData, cb) => {
        let mongoDB = 'mongodb://127.0.0.1/cogen';
        mongoose.connect(mongoDB, options)
            .catch((err) => {
                cb(err, null);
            })
        ;

        // Use the global Promise library for Mongoose.
        mongoose.Promise = global.Promise;

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