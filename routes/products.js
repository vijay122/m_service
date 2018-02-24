var mongoose = require('mongoose');
var AutoComplete = require('mongoose-in-memory-autocomplete').AutoComplete;
var crypto = require('crypto');
var Async = require('async');
var generateID = require("unique-id-generator");
function randomValueHex (len) {
	return crypto.randomBytes(Math.ceil(len/2))
		.toString('hex') // convert to hexadecimal format
		.slice(0,len);   // return required number of characters
}
var Order = require('../models/order');
var Place = require('../models/place');
var Hotel = require('../models/hotel');
var Event = require('../models/event');
var Package = require('../models/package');
var Message = require('../models/message');
var AppScripts = require('../models/appscripts');
var ShoppingCart = require('../models/shoppingcart');
var ProductSchema = require('../schema/mongoose.schema');
var Caravan = require('../models/caravan');
var MotorCycle = require('../models/motorcycle');
var Taxi = require('../models/taxi');
var Addon = require('../models/addon');




var dist = require('./digikstra');

var distance = require('google-distance');
distance.apiKey = 'AIzaSyAVebFb0CRGtfPyIz0VPv9nul-vxRMYt5U';

var googleMapsClient = require('@google/maps').createClient({
	key: 'AIzaSyAVebFb0CRGtfPyIz0VPv9nul-vxRMYt5U'
});


//db.packages.aggregate( [ { $unwind: "$category" },  { $sortByCount: "$category" } ] )
ProductSchema.index({ 'loc' : '2dsphere' });
//Place.ensureIndex({'loc':'2dsphere'});



//geocode({'placeId': place.place_id}, function(results, status) {


googleMapsClient.geocode({
	address: '1600 Amphitheatre Parkway, Mountain View, CA'
}, function(err, response) {
	if (!err) {
		console.log(response.json.results);
	}
});



function * plotMarkers(markers) {
	var nodes=[];
	for (var i = 0; i < markers.length; i++) {
		if (markers[i].loc != undefined) {
			var myLatLng = {lat: markers[i].loc.coordinates[0], lng: markers[i].loc.coordinates[1]};
			nodes.push(myLatLng);
		}
	}
	return nodes;
}


function getDurations (placearray,res) {
	//var service = new google.maps.DistanceMatrixService();
	var nodes=[];
	for (var i = 0; i < placearray.length; i++) {
		if (placearray[i].loc != undefined) {
			var locationid =placearray[i].loc.coordinates[0]+","+placearray[i].loc.coordinates[1];
			var myLatLng = {lat: placearray[i].loc.coordinates[0], lng: placearray[i].loc.coordinates[1]};
			nodes.push(locationid);
		}
	}

	distance.get(
		{
			origins: nodes,
			destinations: nodes
		},
		function(err, data) {
			if (err) return console.log(err);
			console.log(data);
			var $adj_matrix = [];
			var itr=0;
			/* Reset the matrix to all '0's */
			for(var i =0;i<nodes.length; i++){
				$adj_matrix[i] = [];
				for(var j =0;j<nodes.length; j++)
				{
					//$adj_matrix[i][j] = [];
					$adj_matrix[i][j]=data[itr].distanceValue;
					itr++;
				}
			}
			var shortestPathInfo = dist.shortestPath($adj_matrix, 5, 1);

// Get the shortest path from vertex 1 to vertex 6.
			var path1to6 = dist.constructPath(shortestPathInfo, 4);
		});
	//return nodes;
	//var nodes = yield plotMarkers(placearray);
}
//var connectionString = 'mongodb://root:Vjy4livelytrips@127.0.0.1:27017/groundsDB?authSource=admin';
var connectionString = 'mongodb://root:Vjy4livelytrips@139.59.85.107:27017/groundsDB?authSource=admin';
process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose default connection disconnected through app termination');
		process.exit(0);
	});
});
mongoose.connections.length = 0;
mongoose.disconnect().then(function (x) {
	console.log("connection closed");
	mongoose.createConnection(connectionString);
});


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

	var res = str;

	/*
	fix to allow the _ key in the id
	for(var i=0; i<lower.length; ++i) {
		if(lower[i] != upper[i] || lower[i].trim() === '')
			res += str[i];
	}
	*/
	//res = res.replace(/\s+/g, '');
   res = str.replace(/\s/g,'');
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

function getMON()
{
	var id = generateID({prefix:"ORD-"});
	return id;
}
function mapProductsToPackages(productlist)
{
  return productlist;
}
function mapUserInfo()
{
	var usr={};
	usr.name="testuser1";
    //get it from access token
	return usr;
}
function mapCustomerInfo()
{
	var customer={};
	customer.name="customer1";
	return customer;
}

function mapPaymentStatus()
{
	var payment={};
	payment.paymenttype="card";
	return payment;
}
function mapDuedateInfo()
{

}
var createOrder=function(cartItems,res)
{
	var order = Order({
		mon: getMON(),
		userInfo: mapUserInfo(),
		customerInfo: mapCustomerInfo(),
		paymentInfo: mapPaymentStatus(),
		productsInfo: mapProductsToPackages(cartItems),
		duedateInfo: mapDuedateInfo(),
		created_date: {type: Date, default: Date.now}
	});
	 var ord = order.toObject();
	res.status(200).send(ord);
}

exports.validatePackage = function(req,res)
{
	var package ={};
	var event={};
	var hotel={};
    var tripInfo = req.body.payload.tripInfo;
	var products = req.body.payload.products;
	var userInfo = req.body.payload.userInfo;
	var totaldistances;
	var totalstates;
	var totalcountries;
	var totalnumberofnights;
	var totalstays;
	var totalpackages;
	var productlists ;

	totalstates = products.getTripStates();
	totalcountries = products.getTripCountries();
	totalstays = products.getStays();
	totalpackages = products.getPackages();
	var start = tripInfo.fromdate;
	var end = tripInfo.todate;
	//res.send();]

	var orderReviewResponse={};
	var orderSummaryResponse={};
	var orderBillingAddressResponse={};
	var orderTravelDetailsResponse={};
	var orderPaymentInfoResponse={};
	var orderInfo={};
	if(totalpackages.length>0)
	{
		productlists = totalpackages[0].products;
	}
	else
	{
		productlists = products;
	}
	orderReviewResponse =FormatOrderReviewResponse(totalcountries,totalstates,totaldistances,totalnumberofnights);
	orderBillingAddressResponse =FormatOrderBillingAddressResponse(userInfo);
	orderTravelDetailsResponse = FormatTravelDetailsResponse(userInfo);
	orderPaymentInfoResponse = FormatPaymentInfoResponse(userInfo);
	//var gen = getDurations(productlists);
	// getDurations(productlists,res);
	//gen.next();
	// createOrder(productlists,res);
	//validateLocations(cartItems);
	var responseObj ={};
	responseObj.orderReviewResponse = orderReviewResponse;
	responseObj.orderBillingAddressResponse = orderBillingAddressResponse;
	responseObj.orderTravelDetailsResponse = orderTravelDetailsResponse;
	responseObj.orderPaymentInfoResponse = orderPaymentInfoResponse;
	res.send(responseObj);
}

function  FormatTravelDetailsResponse(tripInfo) {
	var response=[];
	if(tripInfo!= undefined)
	{

	}
	return response;
}

function  FormatOrderBillingAddressResponse(tripInfo) {
	var response=[];
	if(tripInfo!= undefined)
	{

	}
	return response;
}

function  FormatPaymentInfoResponse(tripInfo) {
	var response=[];
	if(tripInfo!= undefined)
	{

	}
	return response;
}

function  FormatOrderReviewResponse(totalcountries,totalstates,totaldistances,totalnumberofnights) {
	var response=[];
	if(totalcountries.length>1)
	{
		response.push("Travelling more than one country is not supported right now")
	}
	if(totalstates.length>1)
	{
		response.push("Travelling more than one state is not supported right now")
	}
	return response;
}

function markCalender(instance,item,calender) {

	var calender = getGoogleCalender(); //get calender instance and mark items
	var conflicts =[];
	if(freeSlot)
	{
		calender.date["dateslot"]["timeslot"] = instance;
	}
	else
	{
		conflicts.push(instance);
	}
	return calender;
}

function createCalender(calenderItems)
{
	var calender = GetCalenderDates();
	for(var i=0; i<calenderItems.length;i++)
	{
		markCalender(instance, item,calender);
	}
}
exports.placeOrder = function (req, res) {
	var package ={};
	var event={};
	var hotel={};
	var cartItems = req.body.payload.products;
	var cart = new ShoppingCart(cartItems);
	cart.save(); // cartItems is now saved to the db!!
}
exports.getOrders = function(req,res) {
	mongoose.models['ShoppingCart'].find( function (err, data) {
		if (err) throw err;
		else {
			var datas = data.map(function (record) {
				return record.toObject();
			});
			return res.send(200, datas);
		}
});
}

exports.GetCallback = function(req,res) {
var message_obj = req.body.payload;
	var message = new Message(message_obj);
	message.save();
	res.send({});
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
			coordinates: [req.body.payload.longitude, req.body.payload.latitude]
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
				coordinates: [req.body.payload.longitude, req.body.payload.latitude]
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
				coordinates: [req.body.payload.longitude, req.body.payload.latitude]
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
				coordinates: [req.body.payload.longitude, req.body.payload.latitude]
			},
			district:req.body.payload.district,
			city :req.body.payload.city,
			state:req.body.payload.state,
			pincode:req.body.payload.pincode,
			noofdays:req.body.payload.noofdays,
			noofnights:req.body.payload.noofnights,
			duration:req.body.payload.duration,
			description:req.body.payload.description,
			whattoeat:req.body.payload.whattoeat,
			whattodo:req.body.payload.whattodo,
			howtoreach:req.body.payload.howtoreach,
			landmark: req.body.payload.landmark,
			assets:req.body.payload.assets,
			price: req.body.payload.price,
			products:req.body.payload.products,
			classification:req.body.payload.classification,
			sale: [{
				salePrice: 0,
				saleEndDate: Date.now(),
			}],
			created_by:req.body.payload.operator,
			aboutoperator:req.body.payload.aboutoperator,
			category:req.body.payload.category,
			season: String,
		});
	}


	if(req.body.payload.type=="standalone")
	{
		console.log('Adding Place: ' + JSON.stringify(product));
		var upsertData = product.toObject();
		Place.findOneAndUpdate({"_id": upsertData._id}, upsertData, {upsert: true}, function(err, result){
			if (err) throw err;
			if(result)
			{

			}
			console.log('Place created!');
		});
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

exports.GetRatingEntries = function(req,res)
{
	if(req.body.payload.ratingEntry=="Hotel")
	{

	}
	if(req.body.payload.ratingEntry=="Place")
	{
		
	}
	if(req.body.payload.ratingEntry=="Package")
	{
		
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
		var sess = req.session;

		var seoTable =[];
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
			//datatable.push('Place');
			datatable.push('AppScripts');
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
			//datatable.push('AdditionalService');
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
			request = mapCreateRequest(req.body.payload,request);
			if(req.body.payload.lat==undefined && req.body.payload.sectionName!= undefined)
			{
				if(req.body.payload.sectionName!="refresh")
				{
					if(req.body.payload.sectionName=="search")
					{
						callbackFunctions.push(FindFullVolumeFunction(request));
					}
					else
					{
						callbackFunctions.push(FindFunction(request));
					}
				}
				if(req.body.payload.sectionName=="refresh")
				{
					callbackFunctions.push(FindByIDAndThenNearby(request));
				}
				if(req.body.payload.sectionName=="promotion")
				{
					callbackFunctions.push(geoFindFunction(request));
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
						if(results[i].findTable =="AppScripts")
						{
							response.appscripts =results[i]||[];
							response.appScriptsCount = results[i].sizes;
							response.searchOn = "appscripts";
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

var mapCreateRequest = function(req, request)
{


	var reqFormat = {};
	if(request!= undefined)
	{
		reqFormat = request;
	}
	if( req.searchOptions && req.searchOptions.searchOptions && Array.isArray(req.searchOptions.searchOptions))
	{
		for(var s=0; s<req.searchOptions.searchOptions.length;s++)
		{
			reqFormat[req.searchOptions.searchOptions[s].split(',')[0]] = req.searchOptions.searchOptions[s].split(',')[1];
			//reqFormat[[req.searchOptions.search[0]]]=reqFormat[[req.searchOptions.search[1]]];
		}
	}
	else if( req.searchOptions && req.searchOptions.searchOptions && !Array.isArray(req.searchOptions.searchOptions))
	{
			reqFormat[req.searchOptions.searchOptions.split(',')[0]] = req.searchOptions.searchOptions.split(',')[1];
			//reqFormat[[req.searchOptions.search[0]]]=reqFormat[[req.searchOptions.search[1]]];
	}
	if(req.searchOptions && req.searchOptions.search)
	for(var s=0; s<req.searchOptions.search.length;s++)
	{
		reqFormat[[req.searchOptions.search[0]]]=reqFormat[[req.searchOptions.search[1]]];
	}
	if(req._id != undefined)
		reqFormat._id = req._id;
	if(req['searchby'] != undefined)
		reqFormat[req['searchby']] = req['searchvalue'];
	return reqFormat;
}

var getCreateRequest= function(req)
{
	if(req.searchOptions)
	{
		for(var i=0;i<req.searchOptions.length; i++)
		{

		}
	}

	var reqFormat = {};
	if(req._id != undefined)
	reqFormat._id = req._id;
	if(req.city != undefined)
		reqFormat.city = req.city;
	if(req.state != undefined)
		reqFormat.state = req.state;
	if(req.category != undefined)
		reqFormat.category = req.category;
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
				var longitude = location.coordinates[0];
				var latitude = location.coordinates[1];

				var point = {
					type: "Point",
					coordinates: [longitude, latitude]
				};
				var geoOptions = {
					spherical: true,
					//maxDistance: meterConversion.kmToM(req.max),
					num: 10
				};
				if(mongoose.models[req.findTable]) {
                    mongoose.models[req.findTable].collection.ensureIndex({"loc": "2dsphere"},function(err,res){
                    	debugger;
                    	if(err)
						{

						}
					});
                }
				//document exists });
				if (mongoose.models[req.findTable] != undefined)
					var query = {};
				if (query != undefined) {
					query.loc = {
						$near: {
							$geometry: {
								type: "Point",
								coordinates: [longitude, latitude]
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

var FindCategoryAndCount = function(req,callback)
{
}

var GetScripts = function (req,callback) {
	return function (callback) {
		try {
			var findRequest = getCreateRequest(req);

			mongoose.models[req.findTable].find(findRequest, {}, {sort: {'created_date': -1}}, function (err, data) {
				if (err) throw err;
				var datas = data.map(function (record) {
					return record.toObject();
				});
				datas.findTable = req.findTable;
				mongoose.models[req.findTable].count({}, function (err, c) {
					datas.sizes = c;
					callback(null, datas);
				});
			});
		}
		catch (e) {
			console.log("Exception in FindFunction:" + e);
		}
	}
}

exports.FindCountFunction = function (req,callback) {
	//return function (callback) {
		try {
			var findRequest = getCreateRequest(req);
var script ={};
script.packages="Upto 50% offer in south india tours.";
script.hotels="Book a premium hotel now before 15th this month and get a chance to fly france";
script.events="Buy 1 ticket to Champions league and get 1 ticket absolutely free.";
			Package.aggregate([
					{
						$unwind: "$category"
						//$project: {'display':1}
					}, {$sortByCount: "$category"}], function (err, data) {
					if (err) throw err;
					//	var AppScripts = mongoose.model('AppScripts',AppScriptsSchema);
					AppScripts.remove({}, function (err) {
							if (err) {
								console.log(err)
							} else {
								AppScripts.create({CategoryCount: data,SectionScripts:script}, function (err, small) {
									if (err) return handleError(err);
									// saved!
								})
							}
						}
					);
					//callback(null, data);

				}
			);
		}
		catch (e) {
			console.log("Exception in FindFunction:" + e);
		}
		//}
	//}
}

var FindFullVolumeFunction =function (req, callback) {
	return  function(callback) {
		try {
			var findRequest = getCreateRequest(req);
var tableName = (req.findTable!= undefined && req.findTable=="packages")?"Package":req.findTable;
			mongoose.models[tableName].find(findRequest,{},{sort:{'created_date':-1}}, function(err, data) {
				if (err) throw err;
				var datas = data.map(function (record) {
					return record.toObject();
				});
				datas.findTable =tableName;
				mongoose.models[tableName].count({}, function(err, c) {
					datas.sizes = c;
					callback(null, datas);
				});
			});
		}
		catch (e)
		{
			console.log("Exception in FindFunction:"+e);
		}
	};

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
				coordinates: [longitude,latitude]
			};
			var geoOptions = {
				spherical: true,
				//maxDistance: meterConversion.kmToM(req.max),
				num: 10
			};
	mongoose.models[req.findTable].count({}, function (err, count) {

		if (count > 0) {
            if(mongoose.models[req.findTable]) {
                mongoose.models[req.findTable].collection.ensureIndex({"loc": "2dsphere"},function(err,x){
                	debugger;
                	if(err)
					{

					}
				});
            }
			//document exists });
			if (mongoose.models[req.findTable] != undefined)
				var query = {};
			if (query != undefined && !isNaN(latitude)) {
				query.loc = {
					$near: {
						$geometry: {
							type: "Point",
							coordinates: [longitude, latitude]
						},
						//	$maxDistance : 1000
					}
				}
			}
			mongoose.models[req.findTable].find(query, function (err, data) {
				if (err) {}//throw err;
				else {
					var datas = data.map(function (record) {
						return record.toObject();
					});
					datas.findTable = req.findTable;
					callback(null, datas);
				}
			});
		}
		else {
			var results = [];
			results.findTable = req.findTable;
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
//var regex1 = new RegExp(req.body.payload.search, 'i');
var searchby =		req.body.payload.searchby;
var nofilter =		req.body.payload.nofilter;

var st = req.body.payload.searchby;
var key=req.body.payload.resultKey;
		var regex = new RegExp("^"+req.body.payload.search, "i")
			,   query = {};
		query[searchby] = regex;
		var fields ={};
		if(nofilter!= "true") {
			fields[req.body.payload.searchby] = 1;
			//fields["loc"] = 1;
			fields[key] = 1;
		}
		mongoose.models[req.body.payload.searchon].find(query,fields, function(err, products) {
			if (err) {
				res.json(err);
			}
			var datas = products.map(function (record) {
			//	var distinctArr =[];

				var obj = record.toObject();
				return obj;
			});
			//var unique = datas.filter( onlyUnique );
			res.send(200, JSON.stringify(datas));
		});

		function onlyUnique(value, index, self) {
			return self.indexOf(value.city) === index;
		}

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
exports.GetAdditionalServices = function(req,res)
{
	//var schemaName = req.body.payload.schemaName;
	var images = [
		{
			url: "http://tripconnoisseurs.com/wp-content/uploads/2016/08/Honeymoon.jpg",
			text:"cabs",
			clickHandler: (url, obj) => {
				console.log("inside category click "+obj)
			}
		},
		{
			url: "http://www.easternwatersports.com/wp-content/uploads/2016/04/grouptrip-300x300.jpg?x94867",
			text:"caravans",
			clickHandler: (url, obj) => {
				console.log("inside category click "+obj)
			}
		},
		{
			text:"meals",
			url: "https://static2.tripoto.com/media/filter/t/img/101328/TripDocument/1474279330_1474279325380.jpg",
			clickHandler: (url, obj) => {
				console.log("inside category click "+obj)
			}
		},
		{
			text:"pets",
			url: "http://travelsourceindia.in/wp-content/uploads/2016/06/family-ties-300x300.jpg",
			clickHandler: (url, obj) => {
				console.log("inside category click "+obj)
			}
		}
	];
	return res.send(200, images);
}


exports.GetSchema = function(req,res)
{
	var schemaName = req.body.payload.type;
	var arr = Object.keys(mongoose.models[schemaName].schema.paths).map(function (key) {
		return [key,mongoose.models[schemaName].schema.paths[key].instance];
	});
arr =	arr.filterItems(schemaName);
	//return arr;
	res.send(200, JSON.stringify(arr));
}

exports.SaveAddon = function (req,res) {

	var addonItem = req.body.payload;
	addonItem.formElements = null;
	var addon = new Addon({
		category: req.body.payload.category,
		loc: {
			type: "Point",
			coordinates: [req.body.payload.longitude, req.body.payload.latitude]
		},
	city: req.body.payload.city,
		district: req.body.payload.district,
		state: req.body.payload.state,
		data: req.body.payload
	});
	addon.save(function(err, user) {
		if(err) { return next(err); }
	//	res.status(201).json({
	//		user: user,
	//	})
	});
	/*
	addon.save(function (x) {

	}).then(function(res,err)
	{
		debugger;
	});
	*/
}

exports.filterItems = function(array,schema)
{

}

Array.prototype.filterItems=function(schema)
{
	var len = this.length >>> 0;
	var returnArray;
	//if (typeof schema != "function")
	//	throw new TypeError();
	var toRemove=[];
	switch(schema)
	{
		case 'Package':
			toRemove =["_id","start_date","end_date","__v","loc.coordinates","loc.type"];
			break;
		case 'Place':
			toRemove=["_id","created_date","__v","loc.coordinates","loc.type"];
			break;
		case 'AdditionalItem':
			toRemove=["_id","__v","loc.coordinates","loc.type"];
			break;
		case 'Caravan':
		case 'Taxi':
		case 'MotorCycle':
			toRemove=["_id","created_date","__v","loc.coordinates","loc.type"];
	}
	returnArray = this.filter(function(x) { return toRemove.indexOf(x[0]) < 0 })
	return returnArray;
}

exports.FetchUpdatedAppDataCountAndScripts = function (req, res) {
	try
	{
		var seoTable =[];
		var noOfRecords=0;
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
					//callbackFunctions.push(FindCountFunction(request));
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

Array.prototype.getStays=function()
{
	var stays=[];
	for(var i=0; i<this.length;i++)
	{
		if(this[i].type=="hotel")
		{
			var checkin =	this[i].checkin;
			var checkout = this[i].checkout;
			var hotel = this[i];
			hotel.checkin = checkin;
			hotel.checkout = checkout;
			stays.push(hotel);
		}
	}
	return stays;
}

Array.prototype.getTripStates = function()
{
	var states =[];
	for(var i=0; i< this.length; i++)
	{
		if(this[i].state && states.indexOf(this[i].state) == -1)
			states.push(this[i].state);
	}
	return states;
}
Array.prototype.getTripCountries = function()
{
	var states =[];
	for(var i=0; i< this.length; i++)
	{
		if(this[i].country && states.indexOf(this[i].country) == -1)
			states.push(this[i].country);
	}
	return states;
}
Array.prototype.getPackages = function()
{
	var packages =[];
	for(var i=0; i< this.length; i++)
	{
		if(this[i].type && (this[i].type) == "package")
			packages.push(this[i]);
	}
	return packages;
}

