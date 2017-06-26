var express = require('express'),
    path = require('path'),
    http = require('http'),
    place = require('./routes/places'),
	user = require('./routes/users'),
	product = require('./routes/products'),
    Touringutility = require('./routes/utils');
var compression = require('compression')
var busboy = require('connect-busboy'); //middleware for form/file
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require('cloudinary');
var SocketIo = require('socket.io');

cloudinary.config({
  cloud_name: 'www-livelytrips-com',
  api_key: '921387229282434',
  api_secret: '9K-eZ8N57rw5sJ26_52XVg6_5zI'
});

//var babel = require('babel-register');
require('babel-core/register');

var fs = require('fs-extra'); //File System - for file manipulation
var session = require('express-session');
    // changes for upload
var app = express();
var named = '';


app.use(compression({filter: shouldCompress}))
app.use(busboy());
//app.use(express.static(path.join(__dirname, 'public')));


//Very important change for enabling cross domain origin ----------------Start
app.use(function(req, res, next) {
    var oneof = false;
    if(req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
      //  res.header('Access-Control-Allow-Origin', "http://api.wunderground.com");
        console.log("Origin:"+req.headers.origin);
        oneof = true;
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
//Very important change for enabling cross domain origin ----------------End
app.use(session({
	secret: 'test session',
	resave: false,
	saveUninitialized: true,
}));
app.route('/api/photo')
.post(function (req, res, next) {
    //Function to upload the file and save it to the folder
    var filename ='temp';
     console.log("in api image: " + filename);
    var fstream;
    var b = req.params.name;
    req.pipe(req.busboy);

    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
    //   fs.mkdirs(__dirname + '/images/' + fieldname + '/', function (err) {
            fs.mkdirs(__dirname+"\\images\\" + fieldname + '\\', function (err) {
            if (err) return console.error(err);

            fstream = fs.createWriteStream(__dirname +"\\images\\" + fieldname + '\\' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + filename);
               // res.redirect('back'); //where to go next
                console.log("success!")
            cloudinary.uploader.upload(__dirname+"\\images\\SelectedFile\\"+filename, function(result) {
                    console.log(result)
                    res.send(result);
                },
                { width: 938, height: 410, crop: 'limit'}
            );
            });
           
        });
        //Path where image will be uploaded

    });
});

//app.configure(function () {
    app.set('port', process.env.PORT || 8000);
   // app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
   // app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));

    // parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use(express.bodyParser({limit: '50mb'}));

// parse application/json


/*Define dependencies.*/


var done = false;

/*Handling routes.*/

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'images')));
app.post('/test',product.GetProducts);
app.get('/createAppScripts',product.FindCountFunction);
app.post('/Save', product.addProduct);
app.post('/getProducts', product.GetProducts);
app.post('/getCallBack', product.GetCallback);
app.post('/login', user.loadUserInfo);
app.post('/disableUser', user.disableUser);
app.post('/register', user.addUser);
app.post('/updateuser', user.updateUser);
app.post('/getRatingEntries', product.GetRatingEntries);
//app.post('/getTemperature/:location', place.getTemperature);
//app.post('/viewmore', place.getNearbyPlaces);
app.get('/autocomplete/:searchon/:search',product.autocomplete);
app.post('/complete',product.autocomplete);
//app.get('/isready',place.getstatus);
app.post('/prepareCart',product.validatePackage);
app.post('/submitOrder',product.placeOrder);
app.post('/getOrder',product.getOrders);

//app.post('/test',product.FetchUpdatedAppDataCountAndScripts);

app.post('/SendCallbackMessage/:tn', Touringutility.SendMessage);

app.get('/index', function (request, response) {
});
//app.put('/places/:id', place.updatePlace);
//app.delete('/places/:id', place.deletePlace);

var Server = http.createServer(app);

Server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

function shouldCompress (req, res) {
	if (req.headers['x-no-compression']) {
		// don't compress responses with this request header
		return false
	}

	// fallback to standard filter function
	return compression.filter(req, res)
}