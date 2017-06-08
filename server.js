'use strict';

const
    // Express is our web framework (mostly handles routing)
    express = require('express'),
    // Required to properly utilize HTTP data.
    bodyParser = require('body-parser'),
    // This is the express handlebars integration module
    // and will be used for standard template serving
    hbs = require('express-handlebars'),
    // This is the standalone version of Handlebars which we use
    // to parse template strings and substitute student data.
    Handlebars = require('handlebars'),
    // This maintains sessions for users.
    session = require('client-sessions'),
    // Our API for handling course data.
    courseApi = require('./api/course_service.js')
;


let app = express();

// Pass the bodyParser middleware to our application. Idiomatic
// CommonJS middleware uses a pattern where a function that
// returns a function is called to initialize middleware.
app.use(bodyParser({limit: '100mb'}));

// Setup the handlebars middleware.
app.engine('hbs', hbs({
    // The filename extension used by the engine.
    extname: 'hbs',
    // This is the core layout (found in views/layouts/main.hbs)
    // Handlebars uses composition rather than hierarchies. So
    // this file will layout the other components to load at runtime.
    defaultLayout: 'main',
    // The location of the main file above.
    layoutsDir: __dirname + '/views/layouts/'
}));

// Setup the session middleware
app.use(session({
    cookieName: 'session',
    // Pretty arbitrary, used for encryption and such
    secret: 'supercalifragilisticexpialidocious',
    // Session will last for 2 hours by default
    duration: 1000 * 60 * 120,
    // Any time activity is detected, the duration will be extended by 2 hours.
    activeDuration: 1000 * 60 * 120
}));

// Set our default template engine to be handlebars.
app.set('view engine', 'hbs');


/** Routes **/

// Individual course section pages.
app.get('/courses/:id/:section?', (req, res) => {
    let course = courseApi.getCourse(req.params.id);
    let userData,contentString,courseTemplate;

    // If the session already has a user object, then we have signed
    // in and can get the user variables from the session...
    if (req.session.user) {
        // Pull the relevant data from the session.
        userData = req.session.user;

        // If the section parameter is included then we're on an individual
        // section page...
        if (req.params.section) {
            // Fetch the individual course section data (an HTML string).
            let courseData = courseApi.fetchData(req.params.section, course.courseData.children);

            // If the course was successfully found.
            if (courseData) {
                // Create a template function with Handlebars based on that data.
                courseTemplate = Handlebars.compile(courseData);

                // Compile the the course section html along with the userData variables.
                contentString = courseTemplate(userData);
            }
            // If the course module doesn't exist, we 404 it.
            else {
                res.status(404).send('Not found');
            }
        }
        // ... Otherwise we redirect to the head of the course.
        else {
            let firstSection = course.courseData.children[0];

            // If the first section is empty, then it's just a drawer,
            // and we need to load the first child instead.
            if (firstSection.data === '') {
                courseTemplate = Handlebars.compile(firstSection.children[0].data);
            }
            else {
                // Load in the template for the first section's data. Run it through
                // Handlebars to create a template function.
                courseTemplate = Handlebars.compile(firstSection.data);

            }
            // Pass in the user data and then set the content to the compiled
            // string generated by Handlebars.
            contentString = courseTemplate(userData);
        }

        // We load the views/courses.hbs template (which will inject itself into
        // {{{section}}} block of the views/index.hbs template, which will then
        // inject *itself* into the {{{body}}} section of views/layouts/main.hbs)
        res.render('courses', {
            // Passes an html string into the template that represents the sidebar menu
            // The course number parameter is static right now. Someday it might not be.
            sidebarData: courseApi.generateMenuString(course.courseData.children, '88343999'),

            // String representation of the content to be loaded for this section
            content: contentString,

            // Let's the front end know that we're on a course page.
            coursePage: true,

            // Passes in the userData to the template to fill in where relevant.
            userData: userData
        });
    }
    // ... If not, we redirect the user to the front page so they can
    // sign in.
    else {
        res.redirect('/');
    }
});

// When the user selects a student to login as, they pop this endpoint
// which sets up the user session before letting the front page
// know that it's safe to redirect.
app.get('/login/:id', (req, res) => {
    // Get the variables applicable to the selected student.
    let userData = courseApi.getUserVars(req.params.id);

    // Fix weird Student data issue.
    userData.Student = 'student' + userData.Number;

    // Set the session's user object to carry these variables.
    req.session.user = userData;

    // Let the calling code know that the session has been set up.
    res.json({
        response: 'Success'
    });
});

// Link to compile and serve the pdf of the course
app.get('/pdf', (req, res) => {
    const
       // External library for converting html to pdf
       htmlPdf = require('html-pdf'),
       // The configuration object for our pdf file. Right now
       // we're just setting the format.
       pdfConfig = {
           format: 'Letter',
           border: {
               top: '0.5in',
               right: '0.25in',
               left: '0.25in',
               bottom: '0.5in'
           },
           base: 'http://localhost:8024/uploads'
       }
    ;

    let
        course = courseApi.getCourse(req.params.id),
        userData
    ;

    // If the session already has a user object, then we have signed
    // in and can get the user variables from the session...
    if (req.session.user) {
        // Pull the relevant data from the session.
        userData = req.session.user;
    }
    // ... If not, we redirect the user to the front page so they can
    // sign in.
    else {
        res.redirect('/');
    }

    let htmlString = courseApi.generatePdfString(course.courseData.children, userData);

    // Store the output file in the uploads directory.
    htmlPdf.create(htmlString, pdfConfig).toFile('public/uploads/ltrcld-2121.pdf', function(err, handler) {
        if (err) {
            return console.log(err);
        }
        else {
            // Serve the generated file to the user.
            res.download('public/uploads/ltrcld-2121.pdf');
        }
    });
});

// This is the landing/splash page.
app.get('/', (req, res) => {
    // Get a list of the users (array of strings).
    let users = courseApi.getUsers();

    // Render the splash page with the users populating a dropdown.
    res.render('splash', {
        users: users,
        landingPage: true
    });
});

// Setup the static middleware to serve static content from the
// public directory.
app.use(express.static('public'));


// Initialize our server to listen on port 8024.
let server = app.listen(8024, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('App listening on http://%s:%s', host, port);
});
