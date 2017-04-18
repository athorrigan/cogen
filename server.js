'use strict';

const
    express = require('express'),
    bodyParser = require('body-parser'),
    guid = require('guid'),
    hbs = require('express-handlebars'),
    Handlebars = require('handlebars'),
    session = require('client-sessions'),
    courseApi = require('./api/course_service.js')
;

let app = express();

app.use(bodyParser());

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/'
}));

app.use(session({
    cookieName: 'session',
    secret: 'supercalifragilisticexpialidocious',
    duration: 1000 * 60 * 60,
    activeDuration: 1000 * 60 * 30
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

app.get('/courses/:id/:section?', (req, res) => {
    let course = courseApi.getCourse(req.params.id);
    let userData,contentString,courseTemplate;

    if (req.session.user) {
        userData = req.session.user;
    }
    else {
        res.redirect('/');
    }
    
    if (req.params.section) {
        let courseData = courseApi.fetchData(req.params.section, course.courseData.children);
        courseTemplate = Handlebars.compile(courseData);
        contentString = courseTemplate(req.session.user);
    }
    else {
        courseTemplate = Handlebars.compile(course.courseData.children[0].data);
        contentString = courseTemplate(req.session.user);
    }

    res.render('courses', {
        sidebarData: courseApi.generateMenuString(course.courseData.children, '88343999'),
        content: contentString,
        coursePage: true
    });
});

app.get('/login/:id', (req, res) => {
    req.session.user = courseApi.getUserVars(req.params.id);

    res.json({
        response: 'Success'
    });
});

app.get('/', (req, res) => {
    let users = courseApi.getUsers();
    res.render('splash', {
        users: users
    });
});

app.use(express.static('public'));

let server = app.listen(8024, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('App listening on http://%s:%s', host, port);
});
