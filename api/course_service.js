'use strict';

const
    fs = require('fs'),
    Baby = require('babyparse'),
    _ = require('underscore')
;

let course_service = {
    getCourse: (courseId) => {
        return JSON.parse(fs.readFileSync('data/course_data.json', 'utf8'));
    },
    saveCourse: (courseData) => {
        fs.writeFile('data/course_data.json', JSON.stringify(courseData), function(err) {
            if (err) {
                return 'Failed to write file.';
            }
            else {
                return 'File saved.'
            }
        });
    },
    getUserVars: (studentId) => {
        let csvData = fs.readFileSync('data/studentvars.csv').toString();
        let jsonData = Baby.parse(csvData, {header: true}).data;

        return _.findWhere(jsonData, { Number: studentId});
    },
    getUsers: () => {
        let csvData = fs.readFileSync('data/studentvars.csv').toString();
        let jsonData = Baby.parse(csvData, {header: true}).data;

        return _.pluck(jsonData, 'Number');
    },
    fetchData: (id, dataObjects) => {
        let fetchedNode = _.findWhere(dataObjects, {
            id: id.toString()
        });

        let fetchedData;

        if (fetchedNode) {
            fetchedData = fetchedNode.data;
            return fetchedData;
        }

        dataObjects.forEach(function(obj) {
            if (obj.children) {
                fetchedData = course_service.fetchData(id, obj.children);
            }
        });

        return fetchedData;
    },
    accumMenu: (jsonFragment, courseId) => {
        let currentString = '';

        if (jsonFragment.children) {
            currentString +=
                '<li class="sidebar-drawer" data-id="' + jsonFragment.id + '" >' +
                    '<a href="/courses/" class="sidebar-toggle">' +
                        jsonFragment.name +
                    '</a>'
            ;

            let substring = '<ul>';

            jsonFragment.children.forEach((object) => {
                substring += accumMenu(object);
            });

            substring += '</ul>';
            currentString += substring;

            currentString += '</li>';
        }
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
    generateMenuString: (menuObjects, courseId) => {
        let menuString = '';

        menuObjects.forEach((object) => {
            menuString += course_service.accumMenu(object, courseId)
        });

        return menuString;
    }
};

module.exports = course_service;