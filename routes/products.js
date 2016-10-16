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
	inputType:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	city :String,
	state:String,
	pincode:String,
	displaypicture:String,
	description:String,
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
	inputType:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	city :String,
	state:String,
	pincode:String,
	displaypicture:String,
	description:String,
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
	title:String,
	_id:String,
	inputType:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	city :String,
	state:String,
	pincode:String,
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

exports.addProduct = function (req, res) {
	var product = Place({
		_id: req.body.payload.name+"_"+req.body.payload.city+"_"+req.body.payload.state+"_"+ randomValueHex(4),
		name: req.body.payload.name,
		title:req.body.payload.title,
		inputType:req.body.payload.type,
		loc: {
			type: "Point",
			coordinates: [req.body.payload.latitude, req.body.payload.longitude]
		},
		city :req.body.payload.city,
		state:req.body.payload.state,
		pincode:req.body.payload.pincode,
		description:req.body.payload.description,
		landmark: req.body.payload.landmark,
		displaypicture:req.body.payload.displaypicture,
		image: req.body.payload.image,
		created_date: Date.now(),
		season: "summer",
	});

	if(req.body.payload.type=="hotel")
	{
		product = Hotel({
			_id: req.body.payload.name+"_"+req.body.payload.city+"_"+req.body.payload.state+"_"+ randomValueHex(4),
			name: req.body.payload.name,
			title:req.body.payload.title,
			inputType:req.body.payload.type,
			loc: {
				type: "Point",
				coordinates: [req.body.payload.latitude, req.body.payload.longitude]
			},
			city :req.body.payload.city,
			state:req.body.payload.state,
			pincode:req.body.payload.pincode,
			description:req.body.payload.description,
			landmark: req.body.payload.landmark,
			displaypicture:req.body.payload.displaypicture,
			image: req.body.payload.image,
			created_date: Date.now(),
			season: "summer",
		});
	}
	if(req.body.payload.type=="event")
	{
		product = Event({
			_id: req.body.payload.name+"_"+req.body.payload.city+"_"+req.body.payload.state+"_"+ randomValueHex(4),
			name: req.body.payload.name,
			title:req.body.payload.title,
			inputType:req.body.payload.type,
			loc: {
				type: "Point",
				coordinates: [req.body.payload.latitude, req.body.payload.longitude]
			},
			city :req.body.payload.city,
			state:req.body.payload.state,
			pincode:req.body.payload.pincode,
			description:req.body.payload.description,
			landmark: req.body.payload.landmark,
			created_date: Date.now(),
			season: "summer",
		});
	}
	if(req.body.payload.type=="package")
	{
		product = Package({
			_id: req.body.payload.name+"_"+req.body.payload.city+"_"+req.body.payload.state+"_"+ randomValueHex(4),
			name: req.body.payload.name,
			title:req.body.payload.title,
			inputType:req.body.payload.type,
			loc: {
				type: "Point",
				coordinates: [req.body.payload.latitude, req.body.payload.longitude]
			},
			city :req.body.payload.city,
			state:req.body.payload.state,
			pincode:req.body.payload.pincode,
			description:req.body.payload.description,
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

	console.log('Adding Place: ' + JSON.stringify(product));
	product.save(function(err) {
		if (err) throw err;

		console.log('Place created!');
	});
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
				response.places = results[0] || [];
				response.hotels = results[1] || [];
				response.packages = results[2] || [];
				response.seo = results[2]||[];
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
		if(req.body.payload.sectionName=="home")
		{
			datatable.push('Hotel');
			datatable.push('Place');
			datatable.push('Package');
		}
		if(req.body.payload.sectionName=="detail")
		{
			datatable.push('Hotel');
			datatable.push('Place');
		//	datatable.push('Package');
		//	datatable.push('Event');
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
			if(req.body.payload.lat==undefined)
			{
				callbackFunctions.push(FindFunction(request));
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
					response.places =results[2]||[];
					response.packages = results[0] || [];
					response.hotels = results[1] || [];
					response.events = results[2] || [];
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

var FindFunction =function (req, callback) {
	return  function(callback) {
		try {


		mongoose.models[req.findTable].find({}, function(err, data) {
			if (err) throw err;
			var datas = data.map(function (record) {
				return record.toObject();
			});
			callback(null, datas);

		});
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
			mongoose.models[req.findTable].find(query,function(err,results)
			{
				if(err)
				{
					console.log("Error:"+err);
				}
				else
				{
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
	autoCompleteFields : [ "name"],
	//Returned data with autocompleted results
	dataFields: ["_id","image","loc"],
	//Maximum number of results to return with an autocomplete request
	maximumResults: 10,
	//MongoDB model (defined earlier) that will be used for autoCompleteFields and dataFields
	model: Place
}

//initialization of AutoComplete Module
var myPlacesAutoComplete =new AutoComplete(configuration, function(){
	//any calls required after the initialization
	console.log("Loaded " + myPlacesAutoComplete.getCacheSize() + " words in auto complete");
});

exports.getTypeAheadPlaceNames = function (req, res) {
	myPlacesAutoComplete.getResults(req.params.search, function (err, words) {
		if (err)
			res.json(err);
		else
			res.json(words);
	});
}
