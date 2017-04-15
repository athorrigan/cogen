'use strict';

const
    express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    fs = require('fs'),
    path = require('path'),
    guid = require('guid'),
    hbs = require('express-handlebars'),
    courseApi = require('./api/course_service.js')
;

let app = express();

let upload = multer({ dest: 'public/uploads/' });

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

app.post('/update_course', (req, res) => {
    let writeStatus = courseApi.saveCourse(req.body);
    res.send('Success');
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

app.get('/courses/:id', (req, res) => {
    let course = courseApi.getCourse(req.params.id);

    res.render('courses', {
        courseData: course.courseData[0],
        coursePage: true
    });
});

app.use(express.static('public'));

let server = app.listen(8082, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('App listening on http://%s:%s', host, port);
});
