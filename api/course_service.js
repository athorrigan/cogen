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
        console.log(id);
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
    }
};

module.exports = course_service;