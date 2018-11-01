const
    Baby = require('babyparse'),
    fs = require('fs'),
    courseApi = require('../api/course_service'),
    process = require('process')
;

courseApi.createCourse(
    {
        "courseTitle": "ILT CLEUR19 extras",
        "courseSlug": "Fill me in.",
        "courseName": "LTRCLD-2121",
        "splashTitle": "Virtualize, Orchestrate and Automate Your DMZ Extranet, Internet, and Public Cloud Connections with Secure Agile Exchange!",
        "splashInstructions": "Select a student ID from the dropdown above to continue",
        "userNomenclature": "Student",
        "coursePath": "ilt-cleur19-extras",
        "children": [
            {
                "name": "Welcome",
                "path": "welcome",
                "id": "552441622311",
                "data": "",
                "is_open": "false",
                "children": []
            }
        ],
        "buttons": [
            {
                "name": "Session Information",
                "id": "632680007670",
                "data": "",
                "description": "Session Information",
                "selector": "session-information",
                "icon": "info"
            }
        ],
        "studentData": (() => {
            // Read in the CSV file.
            let csvData = fs.readFileSync('../data/courses/' + "sae-lab".replace(/-/g,'_') + '_variables.csv').toString();

            // Transform the CSV data into JSON
            return Baby.parse(csvData, {header: true}).data;
        })()
    },
    (err, course) => {
        if (err) {
            console.log(err);
        }

        console.log(course);

        process.exit(0);
    }
);
