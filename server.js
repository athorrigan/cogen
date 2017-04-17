'use strict';

const
    express = require('express'),
    bodyParser = require('body-parser'),
    guid = require('guid'),
    hbs = require('express-handlebars'),
    courseApi = require('./api/course_service.js')
;

let app = express();

app.use(bodyParser());

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/'
}));

app.set('view engine', 'hbs');

app.get('/get_course/:id', (req, res) => {
    res.json(courseApi.getCourse(req.params.id));
});

app.get('/get_user_vars/:id', (req, res) => {
    res.json(courseApi.getUserVars(req.params.id));
});

app.get('/get_users', (req, res) => {
    res.json(courseApi.getUsers());
});

app.get('/', (req, res) => {
    let course = courseApi.getCourse(req.params.id);

    res.render('courses', {
        courseData: course.courseData[0],
        coursePage: true
    });
});

app.use(express.static('public'));

let server = app.listen(8024, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('App listening on http://%s:%s', host, port);
});
