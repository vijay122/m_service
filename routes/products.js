var mongoose = require('mongoose');
var AutoComplete = require('mongoose-in-memory-autocomplete').AutoComplete;

//import * from "mongoose-in-memory-autocomplete";
//var Place = require("../models/product");
var crypto = require('crypto');
var Async = require('async');

function randomValueHex (len) {
	return crypto.randomBytes(Math.ceil(len/2))
		.toString('hex') // convert to hexadecimal format
		.slice(0,len);   // return required number of characters
}

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ProductSchema = new Schema({
	name: String,
	title:String,
	_id:String,
	type:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	city :String,
	state:String,
	pincode:String,
	country:String,
	displaypicture:String,
	description:String,
	whattoeat:String,
	whattodo:String,
	howtoreach:String,
	landmark: String,
	image: [],
	created_date: { type: Date, default: Date.now },
	created_by:String,
	season: String,
});

var EventSchema = new Schema({
	name: String,
	title:String,
	_id:String,
	type:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	city :String,
	state:String,
	pincode:String,
	country:String,
	displaypicture:String,
	description:String,
	whattoeat:String,
	whattodo:String,
	howtoreach:String,
	landmark: String,
	image: [],
	created_date: { type: Date, default: Date.now },
	start_date: { type: Date, default: Date.now },
	end_date: { type: Date, default: Date.now },
	created_by:String,
	season: String,
});

var PackageSchema = new Schema({
	name: String,
	duration:String,
	title:String,
	_id:String,
	classification:String,
	type:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	city :String,
	district:String,
	state:String,
	pincode:String,
	country:String,
	assets:
	{
		display:String,
		image:[]
	},
	description:String,
	landmark: String,
	price: Number,
	sale: [{
		salePrice: Number,
		saleEndDate: { type: Date, default: Date.now },
	}],
	last_updated_date: { type: Date, default: Date.now },
	start_date: { type: Date, default: Date.now },
	end_date: { type: Date, default: Date.now },
	created_by:String,
	category:[String],
	season: String,
});


ProductSchema.index({ loc : '2dsphere' });

var Event = mongoose.model('Event', EventSchema);

var Place = mongoose.model('Place', ProductSchema);

var Hotel = mongoose.model('Hotel', ProductSchema);

var Package = mongoose.model('Package', PackageSchema);


var ShoppingCartSchema = new Schema({}, { strict: false });
var ShoppingCart = mongoose.model('ShoppingCart', ShoppingCartSchema);

var connectionString = 'mongodb://root:Vjy4livelytrips@192.169.149.245:27017/placesDB?authSource=admin';

mongoose.createConnection(connectionString);

exports.updateUser = function (req, res) {
	try
	{
		if(req.body.payload.phone_number !="")
		{
			User.findOneAndUpdate({ phone_number: req.phone_number }, {  }, function(err, user) {
				if (err) throw err;
				console.log(user);
			});
		}
	}
	catch (e)
	{
		console.log(' user details fetch error: ');
		console.log(e);
	}
}

function generate_id(req) {
	var str = req.body.payload.name+"_"+req.body.payload.city+"_"+req.body.payload.state+"_"+ randomValueHex(4);
	var lower = str.toLowerCase();
	var upper = str.toUpperCase();

	var res = "";
	for(var i=0; i<lower.length; ++i) {
		if(lower[i] != upper[i] || lower[i].trim() === '')
			res += str[i];
	}
	res = res.replace(/\s+/g, '');
	return res;
}

function getHotels(productlist)
{
var	hotels=[];
	for(var i=0; i<productlist.length;i++)
	{
		if(productlist[i].type=="hotel")
		{
			hotels.push(productlist[i]);
		}
	}
}

function getStates(productlist)
{
	var states=[];
	for(var i=0; i<productlist.length;i++)
	{
		if(states.hasOwnProperty())
		if(productlist[i].state=="hotel")
		{
			hotels.push(productlist[i]);
		}
	}
}

Array.prototype.getState = function(product)
{
	if( product.hasOwnProperty(state))
	{
		return product.get(state);
	}
}


function isCrossState(productlist)
{
	return false;
}

function validateLocations(productlist)
{
	for(var i=0;i<productlist.length; i++)
	{

	}
	return true;
}
exports.profilePackage = function(req,res)
{
	validateLocations();
}
exports.validatePackage = function(req,res)
{
		var package ={};
		var event={};
		var hotel={};

		var cartItems = req.body.payload.products;
	var totaldistances;
	var totalstates;
	var totalnumberofnights;
	var totalstays;
	validateLocations();
}
exports.placeOrder = function (req, res) {
	var package ={};
	var event={};
	var hotel={};

	var cartItems = req.body.payload.products;
	var cart = new ShoppingCart(cartItems);
	cart.save() // cartItems is now saved to the db!!
}

exports.addProduct = function (req, res) {
	var package ={};
	var event={};
	var hotel={};
	var product = Place({
		_id: req.body.payload._id?req.body.payload._id:generate_id(req),
		name: req.body.payload.name,
		title:req.body.payload.title,
		type:req.body.payload.type,
		loc: {
			type: "Point",
			coordinates: [req.body.payload.latitude, req.body.payload.longitude]
		},
		description:req.body.payload.description,
		whattoeat:req.body.payload.whattoeat,
		whattodo:req.body.payload.whattodo,
		howtoreach:req.body.payload.howtoreach,
		city :req.body.payload.city,
		state:req.body.payload.state,
		country:req.body.payload.country,
		pincode:req.body.payload.pincode,
		landmark: req.body.payload.landmark,
		displaypicture:req.body.payload.displaypicture,
		image: req.body.payload.image,
		created_date: Date.now(),
		season: "summer",
	});

	if(req.body.payload.type=="hotel")
	{
		hotel = Hotel({
			_id: req.body.payload._id?req.body.payload._id:generate_id(req),
			name: req.body.payload.name,
			title:req.body.payload.title,
			type:req.body.payload.type,
			loc: {
				type: "Point",
				coordinates: [req.body.payload.latitude, req.body.payload.longitude]
			},
			city :req.body.payload.city,
			state:req.body.payload.state,
			country:req.body.payload.country,
			pincode:req.body.payload.pincode,
			description:req.body.payload.description,
			whattoeat:req.body.payload.whattoeat,
			whattodo:req.body.payload.whattodo,
			howtoreach:req.body.payload.howtoreach,
			landmark: req.body.payload.landmark,
			displaypicture:req.body.payload.displaypicture,
			image: req.body.payload.image,
			created_date: Date.now(),
			season: "summer",
		});
	}
	if(req.body.payload.type=="event")
	{
		event = Event({
			_id: req.body.payload._id?req.body.payload._id:generate_id(req),
			name: req.body.payload.name,
			title:req.body.payload.title,
			type:req.body.payload.type,
			loc: {
				type: "Point",
				coordinates: [req.body.payload.latitude, req.body.payload.longitude]
			},
			city :req.body.payload.city,
			state:req.body.payload.state,
			pincode:req.body.payload.pincode,
			description:req.body.payload.description,
			whattoeat:req.body.payload.whattoeat,
			whattodo:req.body.payload.whattodo,
			howtoreach:req.body.payload.howtoreach,
			landmark: req.body.payload.landmark,
			displaypicture:req.body.payload.displaypicture,
			image: req.body.payload.image,
			created_date: Date.now(),
			season: "summer",
		});
	}
	if(req.body.payload.type=="package")
	{
		package = Package({
			_id: req.body.payload._id?req.body.payload._id:generate_id(req),
			name: req.body.payload.name,
			title:req.body.payload.title,
			type:req.body.payload.type,
			loc: {
				type: "Point",
				coordinates: [req.body.payload.latitude, req.body.payload.longitude]
			},
			district:req.body.payload.district,
			city :req.body.payload.city,
			state:req.body.payload.state,
			pincode:req.body.payload.pincode,
			duration:req.body.payload.duration,
			description:req.body.payload.description,
			whattoeat:req.body.payload.whattoeat,
			whattodo:req.body.payload.whattodo,
			howtoreach:req.body.payload.howtoreach,
			landmark: req.body.payload.landmark,
			assets:req.body.payload.assets,
			price: req.body.payload.price,
			sale: [{
				salePrice: 0,
				saleEndDate: Date.now(),
			}],
			created_by:req.body.payload.operator,
			category:[String],
			season: String,
		});
	}


	if(req.body.payload.type=="standalone")
	{
		console.log('Adding Place: ' + JSON.stringify(product));
		var upsertData = product.toObject();
		//Place.findOne({"loc.coordinates":upsertData.loc.coordinates}, upsertData, {upsert: false}, function(err, result){

		//	Place.findOneAndUpdate({"loc":upsertData.loc}, upsertData, {upsert: false}, function(err, result){

		//	Place.findOneAndUpdate({$and:[{"_id":{$ne:upsertData._id}},{"loc":upsertData.loc}]}, upsertData, {upsert: false}, function(err, result){
			Place.findOneAndUpdate({"_id": upsertData._id}, upsertData, {upsert: true}, function(err, result){
			if (err) throw err;
			if(result)
			{

			}

			console.log('Place created!');
		});
		/*
		Place.findOneAndUpdate({$or:[{"_id":upsertData._id},{$and:[{"_id":{$ne:upsertData._id}},{"loc":upsertData.loc,"state":upsertData.state,"city":upsertData.city}]}]}, upsertData, {upsert: true}, function(err, result){
			//Place.findOneAndUpdate({"_id": upsertData._id}, upsertData, {upsert: true}, function(err, result){
			if (err) throw err;

			console.log('Place created!');
		});
		*/
	}
	if(req.body.payload.type=="event")
	{
		console.log('Adding Place: ' + JSON.stringify(event));
		var upsertData = event.toObject();
		Event.findOneAndUpdate({"_id": upsertData._id}, upsertData, {upsert: true}, function(err, result){
			if (err) throw err;

			console.log('Place created!');
		});
	}
	if(req.body.payload.type=="hotel")
	{
		console.log('Adding Place: ' + JSON.stringify(hotel));
		var upsertData = hotel.toObject();
		Hotel.findOneAndUpdate({"_id": upsertData._id}, upsertData, {upsert: true}, function(err, result){
			if (err) throw err;
			console.log('Place created!');
		});
	}
	if(req.body.payload.type=="package")
	{
		console.log('Adding Place: ' + JSON.stringify(package));
		var upsertData = package.toObject();
		Package.findOneAndUpdate({"_id": upsertData._id}, upsertData, {upsert: true}, function(err, result){
			if (err) throw err;

			console.log('Place created!');
		});
	}
}
exports.GetHomePageItems = function (req, res) {
	try
	{
		Async.parallel([
			function(callback) {
			Place.find({}, function(err, data) {
				if (err) throw err;
				var datas = data.map(function (record) {
					return record.toObject();
				});
				datas.findTable =req.findTable;
				data.count = mongoose.models[req.findTable].count();
				callback(null, datas);

			});
		},
			function(callback) {
			Hotel.find({}, function(err, data) {
				if (err) throw err;
				var datas = data.map(function (record) {
					return record.toObject();
				});
				callback(null, datas);

			});
		},
				function(callback) {
					Event.find({}, function(err, data) {
						if (err) throw err;
						var datas = data.map(function (record) {
							return record.toObject();
						});
						callback(null, datas);

					});
				},
			function(callback) {
			Package.find({}, function(err, data) {
				if (err) throw err;
				var datas = data.map(function (record) {
					return record.toObject();
				});
				callback(null, datas);

			});
		}],
			function(err, results) {
				if (err) {
					console.log(err);
					return res.send(400);
				}

				if (results == null || results[0] == null) {
					return res.send(400);
				}
				var response = {};
				for(var i=0; i< results.length ; i++)
				{
					if(results[i].findTable =="Place")
					{
						response.places =results[i]||[];
						response.places.count = results[i].count;
					}
					if(results[i].findTable =="Package")
					{
						response.packages =results[i]||[];
						response.packages.count = results[i].count;
					}
					if(results[i].findTable =="Hotel")
					{
						response.hotels =results[i]||[];
						response.hotels.count = results[i].count;
					}
					if(results[i].findTable =="Event")
					{
						response.events =results[i]||[];
						response.events.count = results[i].count;
					}
					if(results[i].findTable =="User")
					{
						response.users =results[i]||[];
						response.users.count = results[i].count;
					}
				}
			//	response.places = results[0] || [];
			//	response.hotels = results[1] || [];
			//	response.packages = results[2] || [];
			//	response.seo = results[2]||[];
				return res.send(200, response);
			});



	}
	catch (e)
	{
		console.log(' home page items fetch failed: ');
		console.log(e);
	}
}
exports.GetProducts = function (req, res) {
	try
	{

		var noOfRecords=0;
		if(req.body.payload.noOfRecords!= undefined)
		{
			noOfRecords = req.body.payload.noOfRecords;
		}
		else
		{
			noOfRecords = 4;
		}
		var callbackFunctions = [];
		var datatable=[];
		if(req.body.payload.sectionName=="refresh")
		{
			var table =req.body.payload.findtable;
			datatable.push(table);
		}
		if(req.body.payload.sectionName=="search")
		{
			var table =req.body.payload.findtable;
			datatable.push(table);
		}
		if(req.body.payload.sectionName=="promotion")
		{
			datatable.push('Package');
			datatable.push('Place');
		}
		if(req.body.payload.sectionName=="home")
		{
			datatable.push('Hotel');
			datatable.push('Place');
			datatable.push('Package');
			datatable.push('Event');
		}
		if(req.body.payload.sectionName=="detail")
		{
			datatable.push('Hotel');
			datatable.push('Place');
			datatable.push('Package');
			datatable.push('Event');
		}
		if(req.body.payload.sectionName=="admin")
		{
			datatable.push('Hotel');
			datatable.push('Place');
			datatable.push('Package');
			datatable.push('Event');
			datatable.push('User');
		}
		var filterrequest ={};// DesitionEngine(req);
		for (var  i = 0; i < datatable.length; i++ ) {


			var request ={};
			request.findTable = datatable[i];
			request.lat =req.body.payload.lat;
			request.lon= req.body.payload.lon;
			request.max = req.body.payload.max;
			if(req.body.payload.searchby =="_id")
			{
				request._id =req.body.payload.searchvalue;
			}
			if(req.body.payload.lat==undefined && req.body.payload.sectionName!= undefined)
			{
				if(req.body.payload.sectionName!="refresh")
				{
					callbackFunctions.push(FindFunction(request));
				}
				if(req.body.payload.sectionName=="refresh")
				{
					callbackFunctions.push(FindByIDAndThenNearby(request));
				}
			}
			else
			{
				callbackFunctions.push(geoFindFunction(request));
			}
		}
		Async.parallel(
			callbackFunctions,
			function(err,results) {
				// exports.comments(req, res); //render a view
				try {

					var response = {};
					for(var i=0; i< results.length ; i++)
					{
						if(results[i].findTable =="Place")
						{
							response.places =results[i]||[];
							response.placesCount = results[i].sizes;
							response.searchOn = "places";
						}
						if(results[i].findTable =="Package")
						{
							response.packages =results[i]||[];
							response.packagesCount = results[i].sizes;
							response.searchOn = "packages";
						}
						if(results[i].findTable =="Hotel")
						{
							response.hotels =results[i]||[];
							response.hotelsCount = results[i].sizes;
							response.searchOn = "hotels";
						}
						if(results[i].findTable =="Event")
						{
							response.events =results[i]||[];
							response.eventsCount = results[i].sizes;
							response.searchOn = "events";
						}
						if(results[i].findTable =="User")
						{
							response.users =results[i]||[];
							response.usersCount = results[i].sizes;
							response.searchOn = "users";
						}

					}
					//response.places =results[2]||[];
					//response.packages = results[2] || [];
					//response.hotels = results[0] || [];
					//response.events = results[1] || [];
					if (response != "Not Found" && typeof response == "object")
						res.send(200, JSON.stringify(response));
				}
				catch(e)
				{
					console.log("Exception in callback "+e);
				}
			});
	}
	catch (e)
	{
console.log("exception in get products:"+ e);
	}
}

var getCreateRequest= function(req)
{

	var reqFormat = {};
	if(req._id != undefined)
	reqFormat._id = req._id;
	return reqFormat;
}

var FindByIDAndThenNearby =function (req, callback) {
	return function (callback) {
		try {
			var findRequest = getCreateRequest(req);
			mongoose.models[req.findTable].find(findRequest, {}, {sort: {'created_date': -1}}, function (err, data) {
				if (err) throw err;
				var datas = data.map(function (record) {
					return record.toObject();
				});
				var location = datas[0].loc;
				var latitude = location.coordinates[0];
				var longitude = location.coordinates[1];

				var point = {
					type: "Point",
					coordinates: [latitude, longitude]
				};
				var geoOptions = {
					spherical: true,
					//maxDistance: meterConversion.kmToM(req.max),
					num: 10
				};
				mongoose.models[req.findTable].ensureIndexes({point: "2dsphere"});
				//document exists });
				if (mongoose.models[req.findTable] != undefined)
					var query = {};
				if (query != undefined) {
					query.loc = {
						$near: {
							$geometry: {
								type: "Point",
								coordinates: [latitude, longitude]
							},
							$minDistance: 0,
							$maxDistance: 5000
							//	$maxDistance : 1000
						}
					}
				}
				mongoose.models[req.findTable].find(query, function (err, data) {
					if (err) throw err;


					else {
						var datas = data.map(function (record) {
							return record.toObject();
						});
						datas.findTable = req.findTable;
						callback(null, datas);
					}
				});
			});

		}
		catch (e) {
			console.log("Exception in FindFunction:" + e);
		}

	}
}

var FindFunction =function (req, callback) {
	return  function(callback) {
		try {
var findRequest = getCreateRequest(req);

		mongoose.models[req.findTable].find(findRequest,{},{sort:{'created_date':-1}}, function(err, data) {
			if (err) throw err;
			var datas = data.map(function (record) {
				return record.toObject();
			});
			datas.findTable =req.findTable;
			mongoose.models[req.findTable].count({}, function(err, c) {
				datas.sizes = c;
				callback(null, datas);
			});
		}).limit(8);
		}
		catch (e)
		{
console.log("Exception in FindFunction:"+e);
		}
	};

}
var meterConversion = (function() {
	var mToKm = function(distance) {
		return parseFloat(distance / 1000);
	};
	var kmToM = function(distance) {
		return parseFloat(distance * 1000);
	};
	return {
		mToKm : mToKm,
		kmToM : kmToM
	};
});
var geoFindFunction =function (req, callback) {
	return  function(callback) {
		try {
 var latitude = parseFloat(req.lat);
 var longitude = parseFloat(req.lon);

			var point = {
				type: "Point",
				coordinates: [latitude,longitude]
			};
			var geoOptions = {
				spherical: true,
				//maxDistance: meterConversion.kmToM(req.max),
				num: 10
			};

			mongoose.models[req.findTable].count({}, function (err, count){

				if(count>0){
					mongoose.models[req.findTable].ensureIndexes({point:"2dsphere"});
					//document exists });
					if(mongoose.models[req.findTable]!= undefined)
						var query={};
					if(query!= undefined)
					{
						query.loc = {
							$near : {
								$geometry : {
									type : "Point",
									coordinates : [latitude, longitude]
								},
								//	$maxDistance : 1000
							}
						}
					};
					mongoose.models[req.findTable].find(query,function(err,data)
					{
						if (err) throw err;


						else
						{
							var datas = data.map(function (record) {
								return record.toObject();
							});
							datas.findTable =req.findTable;
							callback(null, datas);
						}
					});
				}
				else {
					var results=[];
					results.findTable =req.findTable;
					results.sizes = count;
					callback(null, results);
				}
			});

		}
		catch (x)
		{
			console.log("Exception in geoFind:"+x);
		}
	};
}

function DesitionEngine(req)
{
	var string={};//JSON.stringify({});
	var table = req.body.table== null?'ALL':req.body.table;
	var latitude= req.body.latitude;
	var longitude = req.body.longitude;
	var searchtype = req.body.searchtype;
	var searchvalue = req.body.searchvalue;
	var numberofrecords = req.body.noofrequests== null?10:req.body.noofrequests;
	var filterparameters =[];
	if(searchtype!= undefined)
	{
		var st = {};
		st[searchtype] = req.body.searchvalue;
		//filterparameters.push(st);
		string = st;//JSON.stringify(st);

	}
	return string;
}


// Autocomplete configuration
var configuration = {
	//Fields being autocompleted, they will be concatenated
	autoCompleteFields : ["name","city"],
	//Returned data with autocompleted results
	dataFields: ["_id","name","loc"],
	//Maximum number of results to return with an autocomplete request
	maximumResults: 10,
	//MongoDB model (defined earlier) that will be used for autoCompleteFields and dataFields
	model: Place
}
var packageconfiguration = {
	//Fields being autocompleted, they will be concatenated
	autoCompleteFields : [ "name","title"],
	//Returned data with autocompleted results
	dataFields: ["_id","name","loc"],
	//Maximum number of results to return with an autocomplete request
	maximumResults: 10,
	//MongoDB model (defined earlier) that will be used for autoCompleteFields and dataFields
	model: Package
}
var hotelconfiguration = {
	//Fields being autocompleted, they will be concatenated
	autoCompleteFields : [ "name","title"],
	//Returned data with autocompleted results
	dataFields: ["_id","name","loc"],
	//Maximum number of results to return with an autocomplete request
	maximumResults: 10,
	//MongoDB model (defined earlier) that will be used for autoCompleteFields and dataFields
	model: Hotel
}

var eventconfiguration = {
	//Fields being autocompleted, they will be concatenated
	autoCompleteFields : [ "name"],
	//Returned data with autocompleted results
	dataFields: ["_id","name","loc"],
	//Maximum number of results to return with an autocomplete request
	maximumResults: 10,
	//MongoDB model (defined earlier) that will be used for autoCompleteFields and dataFields
	model: Event
}
exports.autocomplete = function (req,res) {
	if(req.body.payload.searchon!= undefined)
	{

var regex1 = new RegExp(req.body.payload.search, 'i');
var searchby =		req.body.payload.searchby;

var st = req.body.payload.searchby;
var key=req.body.payload.resultKey;
		var regex = new RegExp(req.body.payload.search, "i")
			,   query = {};
		query[searchby] = regex;
		var fields ={};
		fields[req.body.payload.searchby] = 1;
		//fields["loc"] = 1;
		fields[key]=1;

		mongoose.models[req.body.payload.searchon].find(query,fields, function(err, products) {
			if (err) {
				res.json(err);
			}
			var datas = products.map(function (record) {
				var obj = record.toObject();
				return obj;
			});
			res.send(200, JSON.stringify(datas));
		});

//var query1 = mongoose.models[req.body.payload.searchon].find({searchby: /Th/i}).limit(6);
	//		if (err) throw err;
// Execute query in a callback and return users list
		/*
query.exec(function(err, users) {
	if (!err) {
		// Method to construct the json result set
		var result = buildResultSet(users);
		res.send(result, {
			'Content-Type': 'application/json'
		}, 200);
	} else {
		res.send(JSON.stringify(err), {
			'Content-Type': 'application/json'
		}, 404);
	}
});
*/
	}
}

buildResultSet = function(docs) {
	var result = [];
	for(var object in docs){
		result.push(docs[object]);
	}
	return result;
}

