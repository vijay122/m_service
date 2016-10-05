var mongo = require('mongodb');
var util = require('util');
var fs = require('fs');
var http = require('http');
var Forecast = require('forecast');
var Async = require('async');
var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;
var server = new Server('192.169.147.51', 27017, {auto_reconnect: true});
var geolib  = require('geolib');
var mongojs = require('mongojs');
//var db;
//var mongoconnection = "mongodb://user:password@ds019916.mlab.com:19916/heroku_wls18qcv";

//var server = new Server(mongoconnection,{auto_reconnect:true});
var GoogleMapsAPI = require('googlemaps');
var forecast = new Forecast({
	service: 'forecast.io',
	key: 'b97b1db6e3db369450d45bbb45648646',
	units: 'celcius', // Only the first letter is parsed
	cache: true,      // Cache API requests?
	ttl: {
		minutes: 27,
		seconds: 45
	}
});

var connectionString = 'mongodb://root:Vjy4livelytrips@192.169.149.245:27017/placesDB?authSource=admin';

//var connectionString = 'mongodb://localhost:27017/placesDB';
var db = mongojs(connectionString);


var MongoClient = require('mongodb').MongoClient
	, assert = require('assert');

// Connection URL

// Use connect method to connect to the Server
MongoClient.connect(connectionString, function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	//db.close();
});

exports.loadUserInfo = function (req, res) {
	var user = req.body.name;
	var firsttimekey = "";//rand.generate(7);
	user.passwd = firsttimekey;
	//console.log('Adding place: ' + JSON.stringify(user));

	//var userdetails =db.getUser(name);
	//console.log(userdetails);
	/*
	 db.collection('users', function (err, collection) {
	 collection.insert(user, {safe: true}, function (err, result) {
	 if (err)
	 {
	 res.send({'error': 'An error has occurred'});
	 } else
	 {

	 Sms.SendMessage(firsttimekey);
	 console.log('Success: ' + JSON.stringify(result[0]));

	 }
	 });
	 });
	 */
}