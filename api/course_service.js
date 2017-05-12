'use strict';

const
    // Node's builtin filesystem interaction library.
    fs = require('fs'),
    // CSV parsing library
    Baby = require('babyparse'),
    // Functional programming library
    _ = require('underscore')
;

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
     * @returns {Object} JS Object representing course data.
     */
    getCourse: (courseId) => {
        // Read a the file in from the hard drive for now, and then
        // parse the JSON into a native JS object.
        return JSON.parse(fs.readFileSync('data/course_data.json', 'utf8'));
    },
    /**
     * This fetches the individual variables linked to a specific user for
     * this lab.
     *
     * @param {string} studentId The user id that the variables are linked to.
     * @returns {Object} An object containing variables for this user.
     */
    getUserVars: (studentId) => {
        // Read in the CSV file
        let csvData = fs.readFileSync('data/studentvars.csv').toString();
        // Convert the CSV data into JSON
        let jsonData = Baby.parse(csvData, {header: true}).data;

        // Pull out and return a subset of the JSON that represents
        // variables linked to this user.
        return _.findWhere(jsonData, { Number: studentId});
    },
    /**
     * Get a list of users that we currently have data for
     *
     * @returns {string[]} A list of student numbers.
     */
    getUsers: () => {
        // Read in the CSV file.
        let csvData = fs.readFileSync('data/studentvars.csv').toString();
        // Transform the CSV data into JSON
        let jsonData = Baby.parse(csvData, {header: true}).data;

        // Underscore's pluck() method returns an array of all of the values
        // from each JSON node that represent a specific field. In this case
        // it pull the 'Number' field from each student in the data set.
        return _.pluck(jsonData, 'Number');
    },
    /**
     * Fetches data related to an individual course based on its ID.
     *
     * @param {string} id String representation of a course's ID.
     * @param {Object[]} dataObjects An array of JavaScript objects containing info for all courses.
     * @returns {Object} A subset of the passed in Object representing data for an individual course.
     */
    fetchData: (id, dataObjects) => {
        // Search the passed in course data for data specific to this course.
        let fetchedNode = _.findWhere(dataObjects, {
            id: id.toString()
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
        // find out data rather than carrying through the entire
        // loop.
        dataObjects.some(function(obj) {
            // If a child object has more children and we still
            // haven't found what we're looking for, we recursively
            // sift through them as well.
            if (obj.children) {
                fetchedData = course_service.fetchData(id, obj.children);
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
                    '<li class="sidebar-drawer" data-id="' + jsonFragment.id + '" >' +
                        '<a href="/courses/' + courseId + '/' + jsonFragment.id + '" class="sidebar-toggle">' +
                            jsonFragment.name +
                        '</a>'
                ;
            }
            // Otherwise we simply want it to operate as a drawer to show
            // the submenu items.
            else {
                currentString +=
                    '<li class="sidebar-drawer" data-id="' + jsonFragment.id + '" data-empty="true">' +
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
                '<li data-id="' + jsonFragment.id + '" >' +
                    '<a href="/courses/' + courseId + '/' + jsonFragment.id + '" class="sidebar-item">' +
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
    }
};

module.exports = course_service;