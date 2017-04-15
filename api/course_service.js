'use strict';

const
    fs = require('fs')
;

module.exports = {
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
    }
};