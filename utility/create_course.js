const
    courseApi = require('../api/course_service'),
    process = require('process')
;

courseApi.createCourse(
    {
        "courseTitle": "ILT CLEUR19 extras",
        "courseSlug": "",
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
                "data": "Welcome!",
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
        "studentData": {
            "test": "success"
        }
    },
    (err, course) => {
        if (err) {
            console.log(err);
        }
        console.log(course);

        process.exit(0);
    }
);