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
    session = require('express-session'),
    // Redis session store
    RedisStore = require('connect-redis')(session),
    // Redis client
    redis = require('redis'),
    // Passport - used for user authentication.
    passport = require('passport'),
    // Passport local is a passport plugin that allows us to set a local strategy for user auth(as opposed to say oauth).
    LocalStrategy = require('passport-local').Strategy,
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
    // Connect-Flash allows us to use session stores to pass messages between pages.
    flash = require('connect-flash'),
    // Add mongoose for MongoDB support
    mongoose = require('mongoose'),
    // Encryption mechanism for our passwords
    bcrypt = require('bcrypt'),
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
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}));

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

// Create a redis client to be used with the session store
const redisClient = redis.createClient();

// Setup the session middleware
app.use(session({
    // We're using Redis to store our sessions, a cookie will still be used to identify the Redis key.
    store: new RedisStore({
        url: 'localhost',
        port: 6379,
        client: redisClient
    }),
    // Pretty arbitrary, used for encryption and such
    secret: 'supercalifragilisticexpialidocious',
    // Resave will force a session write, even if the session wasn't modified by a request, we don't want this.
    resave: false,
    // saveUnitialized causes a new session to be saved even if it hasn't been modified yet. This can cause quite a few
    // issues, so we disallow it.
    saveUninitialized: false
}));

app.use(flash());

// Set our default template engine to be handlebars.
app.set('view engine', 'hbs');

/** Set up passport -- move this into an auth section in later versions **/
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    courseApi.findUser(username, done);
});

passport.use('login', new LocalStrategy(
    {
        passReqToCallback: true
    },
    (req, username, password, done) => {
        courseApi.findUser(username, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                console.log('User not found.');
                return done(null, false, req.flash('message', 'User not found.'));
            }

            bcrypt.compare(
                password,
                user.password,
                (err, isMatch) => {
                    if (!isMatch) {
                        return done(null, false, req.flash('message', 'Invalid password.'));
                    }
                    else {
                        return done(null, user);
                    }
                }
            );
        });
    }
));

// Middleware used to guard a route.
let isAuthenticated = () => {
    return (req, res, next) => {
        if(req.isAuthenticated()) {
            return next();
        }
        else {
            res.redirect('/');
        }
    };
};

// Connect to Mongo.
let
    options = {
        user: process.env.COGEN_USER,
        pass: process.env.COGEN_PW
    }
;
let mongoDB = 'mongodb://127.0.0.1/cogen';
mongoose.connect(mongoDB, options);

// Use the global Promise library for Mongoose.
mongoose.Promise = global.Promise;

let Course = require('./models/course_model');

// let numTest = new Course({
//     "courseTitle": "Num Test",
//     "courseSlug": "Test all the things!",
//     "courseName": "LTRDCN-3088",
//     "splashTitle": "Welcome to LTRDCN-3077 <br> Deploying a Cisco Data Center",
//     "splashInstructions": "Select a Student from the dropdown above to continue",
//     "userNomenclature": "Student",
//     "pages": [
//         {
//             "name": "APPENDIX",
//             "path": "appendix",
//             "data": "<h2><span style=\"color:#005073;\"><span style=\"background-color:#dfdfdf;\">These</span></span> <span style=\"color:#049fd9;\">are</span> the <span style=\"color:#e74c3c;\"><span style=\"background-color:#95a5a6;\">Appendix attachments for LTRDCT-3077 </span></span><span style=\"font-family:Comic Sans MS,cursive;\"><span style=\"color:#14a792;\">a</span><span style=\"font-size:28px;\"><span style=\"color:#14a792;\">nd</span> </span></span><span style=\"color:#cf2030;\"><span style=\"font-family:Georgia,serif;\"><span style=\"font-size:28px;\">such</span></span></span><span style=\"font-family:Comic Sans MS,cursive;\">.</span></h2><p><span style=\"color:#27ae60;\">{{Client-Name}}</span></p><div class=\"important-note\">Important Text</div><div><div><div class=\"important-note\">Important</div></div></div><div><div class=\"warning-note\">Warning</div></div><div><div class=\"note\">Note</div><p><a class=\"fancy-image\" href=\"http://localhost:8040/uploads/63c88d8b-b20b-7961-af23-b39b5615ca64.jpg\"><img src=\"http://localhost:8040/uploads/63c88d8b-b20b-7961-af23-b39b5615ca64.jpg\" /></a></p></div><div class=\"warning-note\">testing</div><p class=\"output-label\">Label for thing below:</p><pre><code class=\"language-vim\">$ ls -lash</code></pre><p><br />&nbsp;</p><div class=\"warning-note\">Make sure notices are still working.</div><p>&nbsp;</p>"
//         },
//         {
//             "name": "This is just a test",
//             "data": "<p>testing this out</p><p>&nbsp;</p><p>testing</p><p>&nbsp;</p><p>The current date and time is: <em>Tue Nov 21 2017 15:35:32 GMT-0500 (EST)</em></p>",
//             "path": "this-is-just-a-test"
//         },
//         {
//             "name": "Test this out",
//             "data": "<p>This is a test.</p><p>&nbsp;</p><pre><code class=\"language-vim\">$ ls -lash\n\n&lt;html&gt;\n  &lt;head&gt;\n&lt;title&gt;LTRCLD2121 - Virtualize, Orchestrate and Automate Your DMZ Extranet, Internet, and Public Cloud Connections with Secure Agile Exchange!&lt;/title&gt;\n&lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Congratulations! This message indicates your service chain was successfully deployed and configured.&lt;/h1&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre><p>&nbsp;</p>",
//             "path": "test-this-out"
//         },
//         {
//             "name": "Another!",
//             "data": "<div><div class=\"note\">Note and stuff</div><div class=\"important-note\">Important note</div></div><div class=\"warning-note\">​​​​​​​Warning Note!</div><p>&nbsp;</p>",
//             "path": "another"
//         },
//         {
//             "name": "Play with stuff",
//             "data": "<pre><code class=\"language-markup\">&lt;html&gt;\n  &lt;head&gt;\n&lt;title&gt;LTRCLD2121 - Virtualize, Orchestrate and Automate Your DMZ Extranet, Internet, and Public Cloud Connections with Secure Agile Exchange!&lt;/title&gt;\n&lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Congratulations! This message indicates your service chain was successfully deployed and configured.&lt;/h1&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre><p>&nbsp;</p>",
//             "path": "play-with-stuff"
//         }
//     ],
//     "buttons": [
//         {
//             "name": "Information",
//             "selector": "information",
//             "description": "Information",
//             "icon": "info",
//             "data": "<h1>Course Info&nbsp;{{Client-TemplateName}}</h1><p>&nbsp;</p><p><img src=\"/uploads/5bee857a-db4e-9720-53ff-50661ce2fbca.png\" /></p>"
//         },
//         {
//             "name": "Contacts",
//             "data": "<ol><li>Cory Withers</li><li>Bob Gunderson</li><li>Isabel Whalen</li></ol><p>&nbsp;</p><p><img src=\"/uploads/c266c9ee-a224-2277-9796-c81677c8cf67.jpg\" /></p>",
//             "description": "Contact Information",
//             "selector": "contacts",
//             "icon": "layers"
//         }
//     ]
// });
//
// numTest.save((err, course) => {
//     console.log(course);
//
//     // Course.findOne({_id: course._id})
//     //     .exec((err, courseObject) => {
//     //         console.log(courseObject)
//     //     })
//     // ;
// });

// Course.findOne({_id: '5adf3cc5197eed6d653589a4'})
//     .exec((err, courseObject) => {
//         console.log(courseObject.buttons);
//
//         courseObject.buttons[0].name = "Information";
//
//         courseObject.save((err, course) => {
//
//             Course.findOne({_id: course._id})
//                 .exec((err, courseObject) => {
//                     console.log(courseObject)
//                 })
//             ;
//         });
//     })
// ;

// let numTest = {
//     "courseTitle": "Num Test",
//     "courseSlug": "Test all the things!",
//     "courseName": "LTRDCN-3088",
//     "splashTitle": "Welcome to LTRDCN-3077 <br> Deploying a Cisco Data Center",
//     "splashInstructions": "Select a Student from the dropdown above to continue",
//     "userNomenclature": "Student",
//     "pages": [
//         {
//             "name": "APPENDIX",
//             "path": "appendix",
//             "data": "<h2><span style=\"color:#005073;\"><span style=\"background-color:#dfdfdf;\">These</span></span> <span style=\"color:#049fd9;\">are</span> the <span style=\"color:#e74c3c;\"><span style=\"background-color:#95a5a6;\">Appendix attachments for LTRDCT-3077 </span></span><span style=\"font-family:Comic Sans MS,cursive;\"><span style=\"color:#14a792;\">a</span><span style=\"font-size:28px;\"><span style=\"color:#14a792;\">nd</span> </span></span><span style=\"color:#cf2030;\"><span style=\"font-family:Georgia,serif;\"><span style=\"font-size:28px;\">such</span></span></span><span style=\"font-family:Comic Sans MS,cursive;\">.</span></h2><p><span style=\"color:#27ae60;\">{{Client-Name}}</span></p><div class=\"important-note\">Important Text</div><div><div><div class=\"important-note\">Important</div></div></div><div><div class=\"warning-note\">Warning</div></div><div><div class=\"note\">Note</div><p><a class=\"fancy-image\" href=\"http://localhost:8040/uploads/63c88d8b-b20b-7961-af23-b39b5615ca64.jpg\"><img src=\"http://localhost:8040/uploads/63c88d8b-b20b-7961-af23-b39b5615ca64.jpg\" /></a></p></div><div class=\"warning-note\">testing</div><p class=\"output-label\">Label for thing below:</p><pre><code class=\"language-vim\">$ ls -lash</code></pre><p><br />&nbsp;</p><div class=\"warning-note\">Make sure notices are still working.</div><p>&nbsp;</p>"
//         },
//         {
//             "name": "This is just a test",
//             "data": "<p>testing this out</p><p>&nbsp;</p><p>testing</p><p>&nbsp;</p><p>The current date and time is: <em>Tue Nov 21 2017 15:35:32 GMT-0500 (EST)</em></p>",
//             "path": "this-is-just-a-test"
//         },
//         {
//             "name": "Test this out",
//             "data": "<p>This is a test.</p><p>&nbsp;</p><pre><code class=\"language-vim\">$ ls -lash\n\n&lt;html&gt;\n  &lt;head&gt;\n&lt;title&gt;LTRCLD2121 - Virtualize, Orchestrate and Automate Your DMZ Extranet, Internet, and Public Cloud Connections with Secure Agile Exchange!&lt;/title&gt;\n&lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Congratulations! This message indicates your service chain was successfully deployed and configured.&lt;/h1&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre><p>&nbsp;</p>",
//             "path": "test-this-out"
//         },
//         {
//             "name": "Another!",
//             "data": "<div><div class=\"note\">Note and stuff</div><div class=\"important-note\">Important note</div></div><div class=\"warning-note\">​​​​​​​Warning Note!</div><p>&nbsp;</p>",
//             "path": "another"
//         },
//         {
//             "name": "Play with stuff",
//             "data": "<pre><code class=\"language-markup\">&lt;html&gt;\n  &lt;head&gt;\n&lt;title&gt;LTRCLD2121 - Virtualize, Orchestrate and Automate Your DMZ Extranet, Internet, and Public Cloud Connections with Secure Agile Exchange!&lt;/title&gt;\n&lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Congratulations! This message indicates your service chain was successfully deployed and configured.&lt;/h1&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre><p>&nbsp;</p>",
//             "path": "play-with-stuff"
//         }
//     ],
//     "buttons": [
//         {
//             "name": "Information",
//             "selector": "information",
//             "description": "Information",
//             "icon": "info",
//             "data": "<h1>Course Info&nbsp;{{Client-TemplateName}}</h1><p>&nbsp;</p><p><img src=\"/uploads/5bee857a-db4e-9720-53ff-50661ce2fbca.png\" /></p>"
//         },
//         {
//             "name": "Contacts",
//             "data": "<ol><li>Cory Withers</li><li>Bob Gunderson</li><li>Isabel Whalen</li></ol><p>&nbsp;</p><p><img src=\"/uploads/c266c9ee-a224-2277-9796-c81677c8cf67.jpg\" /></p>",
//             "description": "Contact Information",
//             "selector": "contacts",
//             "icon": "layers"
//         }
//     ]
// };
//
// courseApi.saveCourse(numTest, (err, status) => {
//     console.log(status);
// });

/** Routes **/

// Course specific splash pages
app.get('/courses/:title', (req, res, next) => {
    // Get course data
    let course = courseApi.getCourse(req.params.title);

    // Get a list of the users (array of strings).
    let users = courseApi.getStudents(req.params.title);

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
        rawCourseTitle: course.courseTitle,
        userNomenclature: course.userNomenclature
    });
});

// Individual course section pages.
app.get('/courses/:title/:section', (req, res, next) => {
    let course = courseApi.getCourse(req.params.title);
    let userData, contentString, courseTemplate, showSidebar, templatedButtons;

    // Assign defaults if the session student variables haven't been set prior to hitting this page.
    userData = Object.assign({}, courseApi.getStudentDefaults(req.params.title), req.session.studentVars);

    // Determine whether sidebar should be shown, defaults to true.
    if (typeof req.session.showSidebar === 'undefined') {
        showSidebar = true;
    }
    else {
        showSidebar = req.session.showSidebar;
    }

    templatedButtons = _.map(course.courseData.buttons, (button) => {
        let dataTemplate = Handlebars.compile(button.data);
        button.data = dataTemplate(userData);
        return button;
    });

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
        sidebarShown: showSidebar,

        // Title to be shown in title bar
        courseSlug: course.courseSlug,

        // Name of the course
        courseName: course.courseName,

        // Used for a URL, so we modify it first.
        courseTitle: course.courseTitle.toLowerCase().replace(/\s+|_/g, '-'),

        // And the raw version for the title
        rawCourseTitle: course.courseTitle,

        // The buttons and the modal dialog HTML that belongs to them
        buttons: templatedButtons
    });
});

// Load the editing page for the given course
app.get('/edit-course/:title', isAuthenticated(), (req, res) => {
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
        userNomenclature: course.userNomenclature,
        courseVars: courseVariables.sort(),
        editPage: true
    });
});

// Used for an Ajax response for the editor.
app.get('/get-course/:title', (req, res) => {
    res.json(courseApi.getCourse(req.params.title));
});

// Update a specific course
app.post('/update-course', isAuthenticated(), (req, res) => {
    courseApi.saveCourse(req.body, (err, status) => {
        if (err) {
            res.json({
               success: false,
               message: err
            });
        }
        else {
            res.json({
                success: true
            })
        }
    });
});

app.post('/upload_photo', [isAuthenticated(), upload.single('upload')], (req, res) => {
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

app.post('/upload-file/:title', [isAuthenticated(), upload.single('qqfile')], (req, res) => {
    let
        fileName = guid.create() + path.extname(req.file.originalname),
        targetPath = 'data/courses/' + req.params.title.replace(/-/g, '_') + '_variables.csv',
        tmp_path = req.file.path,
        src = fs.createReadStream(tmp_path),
        dest = fs.createWriteStream(targetPath)
    ;

    src.pipe(dest);

    // Read in the CSV file.
    let csvData = fs.readFileSync(tmp_path).toString();

    let prepend;

    csvData = csvData.split(/[\r\n]+/);

    // Fix for bizarre first property/column issue.
    for (let i = 0; i < csvData.length; i++) {
        if (i === 0) {
            prepend = "null,";
        }
        else {
            prepend = "0,";
        }

        csvData[i] = prepend + csvData[i];
        csvData[i] = csvData[i].replace(/\s/g, '');
    }

    csvData = csvData.join('\n');

    // Transform the CSV data into JSON
    let jsonData = Baby.parse(csvData, {header: true}).data;

    // Update our current student variables if they're set.
    if (req.session.studentVars) {
        req.session.studentVars = _.findWhere(jsonData, { number: req.session.studentVars.number});
    }

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

        fs.writeFile(targetPath, csvData, () => {
            res.json(response);
        });
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

    // Set the session's user object to carry these variables.
    req.session.studentVars = userData;

    // Default the user session to showing the menu bars
    req.session.showSidebar = true;

    // Let the calling code know that the session has been set up.
    return res.json({
        response: 'Success'
    });
});

// Endpoint for logins utilizing the passport system.
app.post('/login', passport.authenticate('login', {
    successRedirect: '/profile/admin',
    failureRedirect: '/',
    failureFlash: true
}));

// Log user out
app.get('/signout', (req, res) => {
    // Logout of passport
    req.logout();
    // Remove our session.
    redisClient.del('sess:' + req.session.id);
    res.redirect('/');
});

// Clear session here
app.get('/end-session', (req, res) => {
    redisClient.del('sess:' + req.session.id);
    res.redirect('/');
});

// User home page. Will eventually list courses the user can edit.
app.get('/profile/:user', isAuthenticated(), (req, res) => {
    let courses = courseApi.getCourses();

    res.render('profile', {
        courses: courses
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
app.get('/pdf/:title', (req, res) => {
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
            base: 'http://localhost:' + server.address().port + '/uploads',
            timeout: 120000
        },
        title = req.params.title
    ;

    let
        course = courseApi.getCourse(title),
        userData
    ;


    // Assign defaults if the session student variables haven't been set prior to hitting this page.
    userData = Object.assign({}, courseApi.getStudentDefaults(title), req.session.studentVars);

    let htmlString = courseApi.generatePdfString(course.courseData.children, userData);

    // Store the output file in the uploads directory.
    htmlPdf.create(htmlString, pdfConfig).toFile('public/uploads/' + title + '.pdf', function(err, handler) {
        if (err) {
            return console.log(err);
        }
        else {
            // Serve the generated file to the user.
            return res.download('public/uploads/' + title + '.pdf');
        }
    });
});

// This is the landing/splash page.
app.get('/', (req, res) => {
    // Renders home page for SVS site.
    return res.render('home', {
        authenticated: req.isAuthenticated(),
        message: req.flash('message')
    });
});

// Setup the static middleware to serve static content from the
// public directory.
app.use(express.static('public'));

// Set up an error handler to prevent server halts.
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    return res.status(500).send('<strong>Something went wrong.</strong>');
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
