const
    courseApi = require('../api/course_service'),
    process = require('process')
;

courseApi.createUser(
    {
        username: 'cogen_user',
        password: 'welcome2COGEN'
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
