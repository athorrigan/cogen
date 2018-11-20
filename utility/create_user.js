const
    courseApi = require('../api/course_service'),
    process = require('process')
;

courseApi.createUser(
    {
        username: 'Admin',
        password: 'C1sc0#123'
    },
    (err, user) => {
        if(err) {
            console.log(err);
        }
        else {
            console.log('User ' + user.username + ' created.');
        }

        process.exit(0);
    }
);