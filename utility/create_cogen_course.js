const
    courseApi = require('../api/course_service'),
    process = require('process')
;

courseApi.createCourse(
    {
        "courseTitle": "CoGen Test Course",
        "courseSlug": "",
        "courseName": "LTRCLD-2019",
        "splashTitle": "Creating Courses with CoGen",
        "splashInstructions": "Please select a pod number from the dropdown above to continue",
        "userNomenclature": "pod",
        "coursePath": "cogen-test-course",
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
