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
    // Library to facilitate image uploads
    multer = require('multer'),
    // Also need file system library for image uploads
    fs = require('fs'),
    // Random id for image names
    guid = require('guid'),
    // Finally need the path library for uploads
    path = require('path'),
    // CSV parsing library
    Baby = require('babyparse'),
    // Functional programming library
    _ = require('underscore'),
    // Our API for handling course data.
    courseApi = require('./api/course_service.js')
;

let port = 8040;

if (process.env.NODE_ENV === 'production') {
    port = 80;
}

let app = express();

let upload = multer({ dest: 'public/uploads/' });

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

// Course specific splash pages
app.get('/courses/:title', (req, res, next) => {
    // Get course data
    let course = courseApi.getCourse(req.params.title);

    // Get a list of the users (array of strings).
    let users = courseApi.getUsers();

    // Render the splash page with the users populating a dropdown.
    return res.render('splash', {
        users: users,
        landingPage: true,
        title: course.splashTitle,
        instructions: course.splashInstructions,
        courseName: course.courseName,
        courseSlug: course.courseSlug,
        courseTitle: course.courseTitle.toLowerCase().replace(/\s+|_/g, '-'),
        // Raw version for the title
        rawCourseTitle: course.courseTitle
    });
});

// Individual course section pages.
app.get('/courses/:title/:section', (req, res, next) => {
    let course = courseApi.getCourse(req.params.title);
    let userData,contentString,courseTemplate;

    // If the session already has a user object, then we have signed
    // in and can get the user variables from the session...
    if (req.session.user) {
        // Pull the relevant data from the session.
        userData = req.session.user;

        // If the section parameter is included then we're on an individual
        // section page...
        if (req.params.section !== '__start') {
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
                return next();
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
        return res.render('courses', {
            // Passes an html string into the template that represents the sidebar menu
            sidebarData: courseApi.generateMenuString(course.courseData.children, req.params.title),

            // String representation of the content to be loaded for this section
            content: contentString,

            // Let's the front end know that we're on a course page.
            coursePage: true,

            // Passes in the userData to the template to fill in where relevant.
            userData: userData,

            // Determine whether we should show sidebar or not.
            sidebarShown: req.session.showSidebar,

            // Title to be shown in title bar
            courseSlug: course.courseSlug,

            // Name of the course
            courseName: course.courseName,

            // Used for a URL, so we modify it first.
            courseTitle: course.courseTitle.toLowerCase().replace(/\s+|_/g, '-'),

            // And the raw version for the title
            rawCourseTitle: course.courseTitle
        });
    }
    // ... If not, we redirect the user to the front page so they can
    // sign in.
    else {
        return next();
    }
});

// Load the editing page for the given course
app.get('/edit-course/:title', (req, res) => {
    // Get course data
    let course = courseApi.getCourse(req.params.title);

    // Need to get a list of injectable variables
    let courseVariables = courseApi.getVariableNames(req.params.title);

    // Render the splash page with the users populating a dropdown.
    return res.render('editCourse', {
        title: course.splashTitle,
        instructions: course.splashInstructions,
        courseName: course.courseName,
        courseSlug: course.courseSlug,
        courseTitle: course.courseTitle.toLowerCase().replace(/\s+|_/g, '-'),
        // And the raw version for the title
        rawCourseTitle: course.courseTitle,
        courseVars: courseVariables.sort(),
        editPage: true
    });
});

// Used for an Ajax response for the editor.
app.get('/get-course/:title', (req, res) => {
    res.json(courseApi.getCourse(req.params.title));
});

// Update a specific course
app.post('/update-course', (req, res) => {
    courseApi.saveCourse(req.body);
    res.json({
        success: true
    });
});

app.post('/upload_photo', upload.single('upload'), (req, res) => {
    let
        fileName = guid.create() + path.extname(req.file.originalname),
        target_path = 'public/uploads/' + fileName,
        tmp_path = req.file.path,
        src = fs.createReadStream(tmp_path),
        dest = fs.createWriteStream(target_path)
    ;

    src.pipe(dest);

    src.on('end', function() {
        let response = {
            uploaded: 1,
            fileName: fileName,
            url: '/uploads/' + fileName
        };

        res.json(response);
    });

    src.on('error', function(err) {
        let response = {
            uploaded: 0,
            error: {
                message: 'The file could not be saved'
            }
        };

        res.send(response);
    });

    fs.unlinkSync(tmp_path);

});

app.post('/upload-file/:title', upload.single('qqfile'), (req, res) => {
    let
        fileName = guid.create() + path.extname(req.file.originalname),
        targetPath = 'data/' + req.params.title.replace(/-/g, '_') + '_variables.csv',
        tmp_path = req.file.path,
        src = fs.createReadStream(tmp_path),
        dest = fs.createWriteStream(targetPath)
    ;

    src.pipe(dest);

    // Read in the CSV file.
    let csvData = fs.readFileSync(tmp_path).toString();
    // Transform the CSV data into JSON
    let jsonData = Baby.parse(csvData, {header: true}).data;
    // Get the variables from the headers.
    let jsonVars = _.keys(jsonData[0]);

    src.on('end', function() {
        let response = {
            uploaded: 1,
            fileName: fileName,
            url: '/uploads/' + fileName,
            vars: jsonVars,
            success: true
        };

        res.json(response);
    });

    src.on('error', function(err) {
        let response = {
            uploaded: 0,
            error: 'The file could not be saved'
        };

        res.send(response);
    });

    fs.unlinkSync(tmp_path);
});

// When the user selects a student to login as, they pop this endpoint
// which sets up the user session before letting the front page
// know that it's safe to redirect.
app.get('/training-login/:title/:id', (req, res) => {
    // Get the variables applicable to the selected student.
    let userData = courseApi.getUserVars(req.params.title, req.params.id);

    // Fix weird Student data issue.
    userData.Student = 'student' + userData.Number;

    // Set the session's user object to carry these variables.
    req.session.user = userData;

    // Default the user session to showing the menu bars
    req.session.showSidebar = true;

    // Let the calling code know that the session has been set up.
    return res.json({
        response: 'Success'
    });
});

// Ajax endpoint to turn the sidebar on and off for subsequent page loads.
app.get('/sidebar/:showSidebar', (req, res) => {
    req.session.showSidebar = (req.params.showSidebar === 'true');

    // Let the calling code know the sidebar status was recorded
    return res.json({
        response: 'Success'
    })
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
           base: 'http://localhost:8040/uploads'
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
        return next();
    }

    let htmlString = courseApi.generatePdfString(course.courseData.children, userData);

    // Store the output file in the uploads directory.
    htmlPdf.create(htmlString, pdfConfig).toFile('public/uploads/ltrcld-2121.pdf', function(err, handler) {
        if (err) {
            return console.log(err);
        }
        else {
            // Serve the generated file to the user.
            return res.download('public/uploads/ltrcld-2121.pdf');
        }
    });
});

// This is the landing/splash page.
app.get('/', (req, res) => {
    // Get a list of the users (array of strings).
    let users = courseApi.getUsers();

    // Render the splash page with the users populating a dropdown.
    return res.render('splash', {
        users: users,
        landingPage: true
    });
});

// Setup the static middleware to serve static content from the
// public directory.
app.use(express.static('public'));

// Set up an error handler to prevent server halts.
app.use((err, req, res, next) => {
    return res.status(500);
    if (res.headersSent) {
        return next(err);
    }
    return res.json(
        {
            error: err,
            status: 'Failure'
        }
    );
});

// Handle 404s.
app.use(function (req, res, next) {
    return res.status(404).send('Sorry cannot find that! <a href="/">Return to home</a>.');
});


// Initialize our server to listen on port 8040.
let server = app.listen(port, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('App listening on http://%s:%s', host, port);
});
