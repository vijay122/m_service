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



var publicConfig = {
    key: 'AIzaSyAVebFb0CRGtfPyIz0VPv9nul-vxRMYt5U',
    stagger_time:       1000, // for elevationPath
    encode_polylines:   false,
    secure:             true, // use https
  //  proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
};

var gmAPI = new GoogleMapsAPI(publicConfig);

var Touringutility = require('./utils');

var db = new Db('placesDB', server, {safe: true});

db.open(function (err, db) {
    if (!err) {
        console.log("'placesDB' opened for connection with Livelytrips");
        db.collection('places', {safe: true}, function (err, collection) {
            if (err) {
                console.log("The 'places' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});


exports.SaveScrollImages = function (req, res) {
    console.log('Retrieving all places: ');
    var place = req.body;
    console.log('Adding place into placesTable: ' + JSON.stringify(place));
    db.collection('places', function (err, collection) {
        collection.insert(place, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('Success: inserted into Places ' + JSON.stringify(result[0]));
                var scrollimg = {};
                scrollimg._id = place._id;
                scrollimg.name = place.name;
                scrollimg.longitude = place.longitude;
                scrollimg.latitude = place.latitude;
                scrollimg.image = place.displaypicture;
                scrollimg.type = place.type;
                db.collection('scrollimages', function (err, collection) {
                    collection.insert(scrollimg, {safe: true}, function (err, result) {
                        if (err) {
                            res.send({'error': 'An error has occurred'});
                        } else {
                            console.log('Success: inserted into scrollimages' + JSON.stringify(result[0]));
                            res.send(result[0]._id);
                        }
                    });
                });
            }
        });
    });
}

exports.LoadScrollImages = function (req, res) {
    console.log('Retrieving all places: ');
    db.collection('scrollimages', function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.send(items);
        });
    });
};
/*
 * function to fetch file from a folder by filename.
 */
function GetFileInsideFolderByName(dir, foldername, files_) {

    files_ = files_ || [];
    dir = dir + foldername;
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            GetFileInsideFolderByName(name, files_);
        } else {
            var res = {};
            var str = name.split(foldername);
            res.id = i;
            res.image = foldername + str[1];
            files_.push(res);
        }
    }
    return files_;
}

//

function BuildNearbyPlacesList(placelist, currentplace) {
    var suggestionlist = [];
    var resultarray;
    for (var i = 0; i < placelist.length; i++) {
        if (placelist[i].placeid != currentplace._id.toString() && placelist[i].type=='standalone') {
            var pl = {};
            pl.placeid = placelist[i].placeid;
            pl.placename = placelist[i].placename;
            pl.lon = placelist[i].location.coordinates[0];
            pl.lat = placelist[i].location.coordinates[1];
            pl.displaypicture = placelist[i].displaypicture;
            suggestionlist.push(pl);
        }
    }
    if (suggestionlist.length > 4) {
        resultarray = suggestionlist.splice(0, 4);
    }
    else {
        resultarray = suggestionlist;
    }
    return resultarray;
}

/*
 Function to get similar type of places to display on the bottom section of the details page.
 Accepts an Array_of_places and current_place to decide based on type pf the package
 */
function BuildSuggestionListByType(Arr_places, currentplace) {
    var suggestionlist = [];
    for (var i = 0; i < Arr_places.length; i++) {
        if (Arr_places[i].type == currentplace.type && Arr_places[i]._id.toString() != currentplace._id.toString()) {
            var pl = {};
            pl.id = Arr_places[i]._id.toString();
            pl.rank = Arr_places[i].rating;
            pl.displaypicture = Arr_places[i].displaypicture;
            pl.placename = Arr_places[i].name;
            pl.city = Arr_places[i].city;
            suggestionlist.push(pl);
        }
    }
    if (suggestionlist.length > 4) {
        suggestionlist.slice(1, 5);
    }
    return suggestionlist;
}

exports.GetDataForHomePage = function (req, res) {
    console.log('Retrieving all from scrollimages: ');
    Async.parallel([
        function(callback) {
            db.collection('places').find().limit(8).toArray(function (e, docs) {
                //db.collection('places').find().sort('type').toArray(function (e, docs) {
                if (docs == null) {
                    callback(null, null);
                }
                var resultSet = [];
                db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                    if (error) {
                    }

                    docs.forEach(function (doc) {
                        db.collection('placeLocationIDLookup').find({
                            location: {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                    }
                                    // $maxDistance : <distance in meters>
                                }
                            }
                        }).toArray(function (err, nearbyplace) {
                            if (err) return console.dir(err)
                            {
                                // doc.Scrollimages = [];//GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                doc.suggestions = BuildSuggestionListByType(docs, doc);
                                // doc.timings = doc.timings.split('.');
                                doc.landmark = doc.landmark.split('.');
                                resultSet.push(doc);
                                if (docs.length == resultSet.length) {
                                 //   res.send(resultSet);
                                    callback(null, resultSet);
                                }
                            }
                        });

                    });
                });
            });
        },
        function(callback) {
            db.collection('offers').find().toArray(function (e, docs) {
                //db.collection('places').find().sort('type').toArray(function (e, docs) {
                if (docs == null) {
                    callback(null, null);
                }
                else
                {
//flatten data for user recommendations based on user intrests
                    var array = [];
                    docs.forEach(function(x)
                    {
                        array = x.value.products.concat(array).unique();
                    })

                  var  displayOffers = array;
                   var userOffer =array;
                    var response = {};
                    response.displayoffers = displayOffers;
                    response.useroffers = userOffer;
                    callback(null, response);
                }
                });
        },
            function(callback) {
                console.log("getseo");
                db.collection('packages').find({},{name:1,_id:0}).toArray(function (e, docs) {
                    //db.collection('places').find().sort('type').toArray(function (e, docs) {
                    if (docs == null)
                    {
                        callback(null, null);

                    }
                    else {
						callback(null, docs);
					}
                    //var resultSet = [];
                  //  res.send(docs);

                });
            }
    ],
        function(err, results) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            if (results == null || results[0] == null) {
                return res.send(400);
            }

            //results contains [sheets, Friends, Expenses]
            var response = {};
            response.places = results[0] || [];
            response.offers = results[1].displayoffers || [];
            response.useroffers = results[1].useroffers || [];
            response.seo = results[2]||[];
     //       response.events = results[2] || [];
            return res.send(200, response);
        });
}

exports.GetHomePageDataObject = function () {
    db.collection('places').find().sort('type').toArray(function (e, docs) {
        var resultSet = [];
        db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
            if (error) {
            }
            docs.forEach(function (doc) {
                db.collection('placeLocationIDLookup').find({
                    location: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                            }
                            // $maxDistance : <distance in meters>
                        }
                    }
                }).toArray(function (err, nearbyplace) {
                    if (err) return console.dir(err)
                    {
                      //  doc.Scrollimages = [];//GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                        doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                        doc.suggestions = BuildSuggestionListByType(docs, doc);
                        doc.timings = doc.timings.split('.');
                        doc.landmark = doc.landmark.split('.');
                        resultSet.push(doc);
                        if (docs.length == resultSet.length) {
                            res.send(resultSet);
                        }
                    }
                });

            });
        });
    });
}

/*
 * Function used to insert data into the places db from homepageManager html page.
 */
exports.addPlace = function (req, res) {
    var place = req.body.postdata;
    place.displaypicture = place.image;
    console.log('Adding place: ' + JSON.stringify(place));
    place.season='summer';
    if (place.type == "standalone")
        db.collection('places', function (err, collection) {
            collection.insert(place, {safe: true}, function (err, result) {
                if (err) {
                    res.send({'error': 'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result[0]));
                    var locationObj = {};
                    locationObj.placeid = place._id.toString();
                    locationObj.placename = place.name;
                    locationObj.type = place.type;
                    locationObj.displaypicture = place.displaypicture[0];
                    locationObj.location = {};
                    locationObj.location.type = "Point";
                    locationObj.location.coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];
                }
                var locationCollection = db.collection('placeLocationIDLookup');
                //locationCollection.createIndex({ loc: "2dsphere" }, { min: -500, max: 500, w: 1 }, function (err, result) {
                locationCollection.ensureIndex({"location": "2dsphere"}, function (err, result) {
                    if (err) return console.dir(err);
                    locationCollection.insert(locationObj, {w: 1}, function (err, result) {
                        if (err) return console.dir(err)
                    });
                });
                var SeasonCollection = db.collection('SeasonLookup');
                if (!(place.season.indexOf(',') > -1)) {
                    place.season = place.season + ',';
                }
                place.season.split(',').forEach(UpdateMonthlySeasonalList);
                function UpdateMonthlySeasonalList(element, index, array) {
                    console.log('a[' + index + '] = ' + element);
                    element = parseInt(element);
                    if (element != -1 && element != undefined) {
                        SeasonCollection.update({_Monthid: element},
                            {$addToSet: {MonthlyPlaces: place._id.toString()}},
                            {w: 1, upsert: true},
                            function (err, result) {
                                if (err) return console.dir(err);
                            });
                    }
                }
            });
        });
    if (place.type == "hotel")
        db.collection('hotels', function (err, collection) {
            collection.insert(place, {safe: true}, function (err, result) {
                if (err) {
                    res.send({'error': 'An error has occurred'});
                } else {
                    /*
                    console.log('Success: ' + JSON.stringify(result[0]));
                    var locationObj = {};
                    locationObj.placeid = place._id.toString();
                    locationObj.placename = place.name;
                    locationObj.displaypicture = place.displaypicture;
                    locationObj.type = place.type;
                    locationObj.location = {};
                    locationObj.location.type = "Point";
                    locationObj.location.coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];
*/
                }
                /*
                var locationCollection = db.collection('placeLocationIDLookup');
                //locationCollection.createIndex({ loc: "2dsphere" }, { min: -500, max: 500, w: 1 }, function (err, result) {
                locationCollection.ensureIndex({"location": "2dsphere"}, function (err, result) {
                    if (err) return console.dir(err);
                    locationCollection.insert(locationObj, {w: 1}, function (err, result) {
                        if (err) return console.dir(err)
                    });
                });
                */
                /*
                var SeasonCollection = db.collection('SeasonLookup');
                if (!(place.season.indexOf(',') > -1)) {
                    place.season = place.season + ',';
                }
                place.season.split(',').forEach(UpdateMonthlySeasonalList);
                function UpdateMonthlySeasonalList(element, index, array) {
                    console.log('a[' + index + '] = ' + element);
                    element = parseInt(element);
                    if (element != -1 && element != undefined) {
                        SeasonCollection.update({_Monthid: element},
                            {$addToSet: {MonthlyPlaces: place._id.toString()}},
                            {w: 1, upsert: true},
                            function (err, result) {
                                if (err) return console.dir(err);
                            });
                    }
                }
                */
            });
        });
    if (place.type == "package")
        db.collection('packages', function (err, collection) {
            collection.insert(place, {safe: true}, function (err, result) {
                if (err) {
                    res.send({'error': 'An error has occurred'});
                } else {
                    /*
                    var imagelist =[];
                    for(var i=0;i<place.products.length;i++)
                    {
                        imagelist.push(place.products[i].image);
                    }
                    console.log('Success: ' + JSON.stringify(result[0]));
                    var locationObj = {};
                    locationObj.placeid = place._id.toString();
                    locationObj.placename = place.name;
                    locationObj.displaypicture = imagelist;
                    locationObj.location = {};
                    locationObj.location.type = "Point";
                    locationObj.location.coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];
                    */
                }
                /*
                var locationCollection = db.collection('placeLocationIDLookup');
                //locationCollection.createIndex({ loc: "2dsphere" }, { min: -500, max: 500, w: 1 }, function (err, result) {
                locationCollection.ensureIndex({"location": "2dsphere"}, function (err, result) {
                    if (err) return console.dir(err);
                    locationCollection.insert(locationObj, {w: 1}, function (err, result) {
                        if (err) return console.dir(err)
                    });
                });

                var SeasonCollection = db.collection('SeasonLookup');
                if (!(place.season.indexOf(',') > -1)) {
                    place.season = place.season + ',';
                }
                place.season.split(',').forEach(UpdateMonthlySeasonalList);
                function UpdateMonthlySeasonalList(element, index, array) {
                    console.log('a[' + index + '] = ' + element);
                    element = parseInt(element);
                    if (element != -1 && element != undefined) {
                        SeasonCollection.update({_Monthid: element},
                            {$addToSet: {MonthlyPlaces: place._id.toString()}},
                            {w: 1, upsert: true},
                            function (err, result) {
                                if (err) return console.dir(err);
                            });
                    }
                }
                */
            });
        });
}
exports.updatePlace = function (req, res) {
    var id = req.params.id;
    var place = req.body;
    delete place._id;
    console.log('Updating place: ' + id);
    console.log(JSON.stringify(place));
    db.collection('places', function (err, collection) {
        collection.update({'_id': new BSON.ObjectID(id)}, place, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating place: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(place);
            }
        });
    });
}

exports.deletePlace = function (req, res) {
    var id = req.params.id;
    console.log('Deleting place: ' + id);
    db.collection('places', function (err, collection) {
        collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

//ToDo
exports.GetCategories = function (req, res) {
    console.log('Retrieving all from scrollimages: ');
    db.collection('places', function (err, collection) {
        //  collection.find().toArray(function(err, items) {
        //  var splitobj= {};
        //items = sortByKey(items,items.type);
        //  res.send(items);
        //      console.log("homepage items received from node: count:"+items);
        // });

        collection.aggregate([
            // First sort all the docs by name
            {$sort: {name: 1}},
            // Take the first 100 of those
            {$limit: 5}
            // Of those, take only ones where marks > 35
            //  {$match: {marks: {$gt: 35}
//}}
        ], function (err, response) {
            res.send(response);
            console.log("homepage items received from node: count:" + response);
        });
//};
    });


};

exports.GetPlacesByCategoryId = function (req, res) {
    var id = req.params.id;
    var type = req.params.type;
    latitude = req.params.lat;
    longitude = req.params.long;
    console.log('inside GetPlacesByCategoryId: with request:', id);
    db.collection('placeLocationIDLookup', function (err, collection) {
        collection.distinct('placeid',
            {
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(longitude), parseFloat(latitude)]
                        }
                        // $maxDistance : <distance in meters>
                    }
                },
                type: type
            },
            function (err, nearbyplace) {
                if (err) return console.dir(err)
                {
                    BuildPlacesFromPlaceIds(nearbyplace, type);
                }
            });
    });
}

exports.getTypeAheadPlaceNames = function (req, res) {
    var b = req.params.search;
    console.log('Retrieving all from scrollimages: ');
    db.collection('places', function (err, collection) {
        console.log("inside db count:");
        //
        var arr = [];
        collection.find({$or: [{name: new RegExp(b, 'i')}, {city: new RegExp(b, 'i')}]}).limit(5).toArray(function (err, items) {
            for (var s = 0; s < items.length; s++) {
                console.log("homepage items received from node: count:" + items[s].name);
                var sr = {};
                if (items[s].name.indexOf(b) > -1) {
                    sr.name = items[s].name;
                }
                else {
                    sr.name = items[s].city;
                }
                sr.value = items[s]._id;
                sr.image = items[s].image[0];
                sr.latitude = items[s].latitude;
                sr.longitude = items[s].longitude;
                arr.push(sr);
            }
            res.send(arr);
            console.log("homepage items received from node: count:" + arr);
        });
    });
};

exports.getTemperature = function (req, res) {
    var b = req.params.location;
    var latitude = b.split(',')[0];
    var longitude = b.split(',')[1];
    forecast.get([latitude, longitude], function (err, weather) {
        if (err) return console.dir(err);
        console.dir(weather);
        res.send(weather);
    });
};

exports.GeoCode = function (req, res) {

    var geocodeParams = {
        "address":    "Olympia tech park, No.1, SIDCO Industrial Estate, Guindy, NH45, Guindy, Chennai, Tamil Nadu 600032, IN",
        "components": "components=country:GB",
        "bounds":     "55,-1|54,1",
        "language":   "en",
        "region":     "in"
    };

    gmAPI.geocode(geocodeParams, function(err, result){
        debugger;
        console.log(result);
    });
};


//exports.GetSuggestionList = function (req, res) {
//    console.log('Retrieving all from scrollimages: ');
//    db.collection('places', function (err, collection) {
//        console.log("inside db count:");
//        collection.findOne({ 'id': id }, function (err, item) {
//            res.send(item);
//            console.log("homepage items received from node: count:" + items);
//        });
//    });
//};


function loadWeather(latitude, longitude) {
    var options = {
        host: "https://api.worldweatheronline.com/free/v2/weather.ashx?q=new+york&num_of_days=5&key=1fe2d1430c880b143cc714fa91ed6&tp=24&format=json",
        port: 80,
        path: '/resource?id=foo&bar=baz',
        method: 'POST'
    };

    http.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    }).end();

}

/*
 * Api used for getting the recommendations based on monthid {monthid refers to number of the month in the calender eg '1' for jan and '12' for dec}.
 * Accepts monthid as a parameter and returns Array of places popular in that particular month.
 */
exports.GetRecommendationsForSeason = function (req, res) {
    try {
        console.log("recommendations called");
        if (req.body != undefined) {
            var monthid = 1;
            var findqry = DecisionEngine(req.body);  // findqry
            // var input = JSON.parse(findqry);
            var placetype = 'standalone';
            if (findqry.type != undefined && findqry.type == 'package') {
                //  placetype = 'package';
            }
            db.collection('SeasonLookup').find(findqry).sort('type').toArray(function (e, docs) {
                if (placetype == 'package') {
                    BuildPlacesFromPlaceIds(docs[0]._id.toString(), placetype, res);
                }
                if (docs != undefined && docs.length > 0) {
                    var resp = BuildPlacesFromPlaceIds(docs[0].MonthlyPlaces, placetype, res);
                }

                //  var jsoneres = JSON.stringify(resp);
                //  res.send(resp);
            });
        }
    }
    catch (a) {
        console.log(a);
    }
}

/*
 * Api used for getting the recommendations based on monthid {monthid refers to number of the month in the calender eg '1' for jan and '12' for dec}.
 * Accepts monthid as a parameter and returns Array of places popular in that particular month.
 */
exports.GetPlaceDetailsByPlaceID = function (req, res) {
    try {
        console.log("inside the places fetch");
         console.log("the request id"+req.params.id);
        if (req.params.id != undefined) {
            var id = [];
            id.push(req.params.id);
        BuildPlacesFromPlaceIdForPackage(id, "standalone", res).then(function (x) {
console.log("done");
            res.send(x);
         });
      //   res.send(st);
        }
    }
    catch (a) {

    }
}

exports.GetRecommendations = function (req, res) {
    try {
        console.log("recommendations called");
        if (req.body != undefined) {
            var monthid = 1;
            var findqry = DecisionEngine(req.body);  // findqry
            // var input = JSON.parse(findqry);
            var placetype = 'standalone';
            if (findqry.type != undefined && findqry.type == 'package') {
                placetype = 'package';
            }
            if (placetype == 'package') {
                console.log('fetching details for placeids: from places collection.');
                if (placetype == "" || placetype == "standalone")
                    db.collection('places').find(findqry).sort('type').toArray(function (e, docs) {
                        var resultSet = [];
                        db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                            if (error) {
                            }
                            docs.forEach(function (doc) {
                                db.collection('placeLocationIDLookup').find({
                                    location: {
                                        $near: {
                                            $geometry: {
                                                type: "Point",
                                                coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                            }
                                            // $maxDistance : <distance in meters>
                                        }
                                    }
                                }).toArray(function (err, nearbyplace) {
                                    if (err) return console.dir(err)
                                    {
                                       // doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                        doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                        doc.suggestions = BuildSuggestionListByType(docs, doc);
                                        doc.timings = doc.timings.split('.');
                                        doc.landmark = doc.landmark.split('.');
                                        resultSet.push(doc);
                                        if (docs.length == resultSet.length) {
                                            res.send(JSON.stringify(resultSet));
                                            // return resultSet;
                                        }
                                    }
                                });

                            });
                        });
                    });
                else if (placetype == "hotel")
                    db.collection('hotels').find(findqry).sort('type').toArray(function (e, docs) {
                        var resultSet = [];
                        db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                            if (error) {
                            }
                            docs.forEach(function (doc) {
                                db.collection('placeLocationIDLookup').find({
                                    location: {
                                        $near: {
                                            $geometry: {
                                                type: "Point",
                                                coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                            }
                                            // $maxDistance : <distance in meters>
                                        }
                                    }
                                }).toArray(function (err, nearbyplace) {
                                    if (err) return console.dir(err)
                                    {
                                      //  doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                        doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                        doc.suggestions = BuildSuggestionListByType(docs, doc);
                                        doc.timings = doc.timings.split('.');
                                        doc.landmark = doc.landmark.split('.');
                                        resultSet.push(doc);
                                        if (docs.length == resultSet.length) {
                                            //res.send(resultSet);
                                            return resultSet;
                                        }
                                    }
                                });

                            });
                        });
                    });
                else if (placetype == "package")
                    db.collection('packages').find(findqry).sort('type').toArray(function (e, docs) {
                        var resultSet = [];
                        db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                            if (error) {
                            }
                            docs.forEach(function (doc) {
                                db.collection('placeLocationIDLookup').find({
                                    location: {
                                        $near: {
                                            $geometry: {
                                                type: "Point",
                                                coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                            }
                                            // $maxDistance : <distance in meters>
                                        }
                                    }
                                }).toArray(function (err, nearbyplace) {
                                    if (err) return console.dir(err)
                                    {
                                      //  doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                        doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                        doc.suggestions = BuildSuggestionListByType(docs, doc);
                                      //  doc.timings = doc.timings.split('.');
                                        doc.landmark = doc.landmark.split('.');
                                        resultSet.push(doc);
                                        if (docs.length == resultSet.length) {
                                            res.send(resultSet);
                                            //  return resultSet;
                                        }
                                    }
                                });

                            });
                        });
                    });
            }
        }
    }
    catch (a) {
        console.log(a);
    }
}

function DecisionEngine(params) {
    var query = '';
    var s = {};
    for (var key in params) {
        var value = params[key];

        s[key] = params[key];
    }
    return s;

}

function BuildPlacesFromPlaceIds(placeids, type, res) {
    try {
        var findarray = [];
        for (var i = 0; i < placeids.length; i++) {
            var findkey = new mongo.ObjectID(placeids[i]);
            findarray.push(findkey);
        }

        console.log('fetching details for placeids: ' + placeids + ' from places collection.');
        if (type == "" || type == "standalone")
        //    db.collection('places').find({'_id': {$in: findarray}}).sort('type').toArray(function (e, docs) {
            db.collection('places').find({'_id': {$in: findarray}}).toArray(function (e, docs) {
                var resultSet = [];
                db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                    if (error) {
                    }
                    docs.forEach(function (doc) {
                        db.collection('placeLocationIDLookup').find({
                            location: {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                    }
                                    // $maxDistance : <distance in meters>
                                }
                            }
                        }).toArray(function (err, nearbyplace) {
                            if (err) return console.dir(err)
                            {
                              //  doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                doc.suggestions = BuildSuggestionListByType(docs, doc);
                              //  doc.timings = doc.timings.split('.');
                                doc.landmark = doc.landmark.split('.');
                                resultSet.push(doc);
                                if (docs.length == resultSet.length) {
                                    res.send(JSON.stringify(resultSet));
                                    // return resultSet;
                                }
                            }
                        });

                    });
                });
            });
        else if (type == "hotel")
            db.collection('hotels').find({'_id': {$in: findarray}}).sort('type').toArray(function (e, docs) {
                var resultSet = [];
                db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                    if (error) {
                    }
                    docs.forEach(function (doc) {
                        db.collection('placeLocationIDLookup').find({
                            location: {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                    }
                                    // $maxDistance : <distance in meters>
                                }
                            }
                        }).toArray(function (err, nearbyplace) {
                            if (err) return console.dir(err)
                            {
                             //   doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                doc.suggestions = BuildSuggestionListByType(docs, doc);
                                doc.timings = doc.timings.split('.');
                                doc.landmark = doc.landmark.split('.');
                                resultSet.push(doc);
                                if (docs.length == resultSet.length) {
                                    //res.send(resultSet);
                                    return resultSet;
                                }
                            }
                        });

                    });
                });
            });
        else if (type == "package")
            db.collection('packages').find({'_id': {$in: findarray}}).sort('type').toArray(function (e, docs) {
                var resultSet = [];
                db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                    if (error) {
                    }
                    docs.forEach(function (doc) {
                        db.collection('placeLocationIDLookup').find({
                            location: {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                    }
                                    // $maxDistance : <distance in meters>
                                }
                            }
                        }).toArray(function (err, nearbyplace) {
                            if (err) return console.dir(err)
                            {
                             //   doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                doc.suggestions = BuildSuggestionListByType(docs, doc);
                                doc.timings = doc.timings.split('.');
                                doc.landmark = doc.landmark.split('.');
                                resultSet.push(doc);
                                if (docs.length == resultSet.length) {
                                    //res.send(resultSet);
                                    return resultSet;
                                }
                            }
                        });

                    });
                });
            });
    }
    catch (x) {
        debugger;
    }
}


function BuildPlacesFromPlaceIdForPackage(placeids, type) {
    try {
        return new Promise(function(resolve, reject) {
        var findarray = [];
            if(placeids[0]== undefined)
            {
                resolve("initialload");
            }
        for (var i = 0; i < placeids.length; i++) {
            var findkey = new mongo.ObjectID(placeids[i]);
            findarray.push(findkey);
        }
        console.log('fetching details for placeids: ' + placeids + ' from places collection.');
        if (type == "" || type == "standalone")
        //    db.collection('places').find({'_id': {$in: findarray}}).sort('type').toArray(function (e, docs) {
            db.collection('places').find({'_id': {$in: findarray}}).toArray(function (e, docs) {
                var resultSet = [];
                db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                    if (error) {
                    }
                    docs.forEach(function (doc) {
                        db.collection('placeLocationIDLookup').find({
                            location: {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                    }
                                    // $maxDistance : <distance in meters>
                                }
                            }
                        }).toArray(function (err, nearbyplace) {
                            if (err) return console.dir(err)
                            {
                              //  doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                doc.suggestions = BuildSuggestionListByType(docs, doc);
                              //  doc.timings = doc.timings.split('.');
                                doc.landmark = doc.landmark.split('.');
                                resultSet.push(doc);
                                if (docs.length == resultSet.length) {
                                 //   res.sendStatus(JSON.stringify(resultSet));
                                    resolve(resultSet);
                                }
                            }
                        });

                    });
                });
            });
        else if (type == "hotel")
            db.collection('hotels').find({'_id': {$in: findarray}}).sort('type').toArray(function (e, docs) {
                var resultSet = [];
                db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                    if (error) {
                    }
                    docs.forEach(function (doc) {
                        db.collection('placeLocationIDLookup').find({
                            location: {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                    }
                                    // $maxDistance : <distance in meters>
                                }
                            }
                        }).toArray(function (err, nearbyplace) {
                            if (err) return console.dir(err)
                            {
                             //   doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                doc.suggestions = BuildSuggestionListByType(docs, doc);
                                doc.timings = doc.timings.split('.');
                                doc.landmark = doc.landmark.split('.');
                                resultSet.push(doc);
                                if (docs.length == resultSet.length) {
                                    //res.send(resultSet);
                                    resolve(JSON.stringify(resultSet));
                                }
                            }
                        });

                    });
                });
            });
        else if (type == "package")
            db.collection('packages').find({'_id': {$in: findarray}}).sort('type').toArray(function (e, docs) {
                var resultSet = [];
                db.collection('placeLocationIDLookup').ensureIndex({loc: '2dsphere'}, function (error) {
                    if (error) {
                    }
                    docs.forEach(function (doc) {
                        db.collection('placeLocationIDLookup').find({
                            location: {
                                $near: {
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)]
                                    }
                                    // $maxDistance : <distance in meters>
                                }
                            }
                        }).toArray(function (err, nearbyplace) {
                            if (err) return console.dir(err)
                            {
                             //   doc.Scrollimages = GetFileInsideFolderByName("C:\\inetpub\\wwwroot\\Tourist\\images\\", doc.name);
                                doc.nearbylocation = BuildNearbyPlacesList(nearbyplace, doc);
                                doc.suggestions = BuildSuggestionListByType(docs, doc);
                                doc.timings = doc.timings.split('.');
                                doc.landmark = doc.landmark.split('.');
                                resultSet.push(doc);
                                if (docs.length == resultSet.length) {
                                    //res.send(resultSet);
                                    resolve(JSON.stringify(resultSet));
                                }
                            }
                        });

                    });
                });
            });
    });
    }
    catch (x) {
        debugger;
    }
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
exports.getstatus= function(req,res)
{
    res.status(200).send("server is up");
}

exports.GetProducts = function (req, res) {
    try {
        var deleteFunctions = [];
       var filterrequest = DesitionEngine(req);
      console.log('inside getproducts');
      var table = req.body.table== null?'ALL':req.body.table;
        var productid = req.body.product;
      var datatable=[];
      if (table == 'ALL')
      {
        datatable.push('hotels');
        datatable.push('places');
        datatable.push('packages');
      }
      else if(table=="packages")
      {
          datatable.push('packages');
      }
      else {
        //  datatable.push(table);
        datatable.push('places');
      }
      var latitude= req.latitude;
      var longitude = req.longitude;
     

      
         for (var  i = 0; i < datatable.length; i++ ) {
           
             deleteFunctions.push(deleteFunction(datatable[i],filterrequest));
         }
        var productidlist =[];
        productidlist.push(productid);
        BuildPlacesFromPlaceIdForPackage(productidlist,'standalone').then(function(place)
        {
         
            Async.parallel(
               deleteFunctions,
                function(err,results) {
                   // exports.comments(req, res); //render a view
                 var response = {};
                    response.packages = results[0] || [];
                    response.hotels = results[1] || [];
                    response.events = results[2] || [];
                    if(place!="initialload")
                    {
                        response.place = place[0];
                    }
                 
                    return res.send(200, response);
                }
            );
        
    

    });
    }
    catch (a) {

    }
}

var deleteFunction =function (table, filterfunction, callback) {
    return  function(callback) {
        db.collection(table, function (err, collection) {
            collection.find(filterfunction).limit(4).toArray(function (err, items) {
                callback(null, items);
            });
        });
    };
}


 function fetchCollectionWithName(table, callback) {
    db.collection(table, function (err, collection) {
        collection.find().toArray(function (err, items) {
            callback( items);
        });
    });
}

exports.addPackage = function (req, res) {
    var place = req.body.productIdList;
    place.displaypicture = req.body.imageList;
    console.log('Adding package: ' + JSON.stringify(place));
    if (place.type == "standalone")
        db.collection('places', function (err, collection) {
            collection.insert(place, {safe: true}, function (err, result) {
                if (err) {
                    res.send({'error': 'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result[0]));
                    var locationObj = {};
                    locationObj.placeid = place._id.toString();
                    locationObj.placename = place.name;
                    locationObj.displaypicture = place.displaypicture[0];
                    locationObj.location = {};
                    locationObj.location.type = "Point";
                    locationObj.location.coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];
                }
                var locationCollection = db.collection('placeLocationIDLookup');
                //locationCollection.createIndex({ loc: "2dsphere" }, { min: -500, max: 500, w: 1 }, function (err, result) {
                locationCollection.ensureIndex({"location": "2dsphere"}, function (err, result) {
                    if (err) return console.dir(err);
                    locationCollection.insert(locationObj, {w: 1}, function (err, result) {
                        if (err) return console.dir(err)
                    });
                });
                var SeasonCollection = db.collection('SeasonLookup');
                if (!(place.season.indexOf(',') > -1)) {
                    place.season = place.season + ',';
                }
                place.season.split(',').forEach(UpdateMonthlySeasonalList);
                function UpdateMonthlySeasonalList(element, index, array) {
                    console.log('a[' + index + '] = ' + element);
                    element = parseInt(element);
                    if (element != -1 && element != undefined) {
                        SeasonCollection.update({_Monthid: element},
                            {$addToSet: {MonthlyPlaces: place._id.toString()}},
                            {w: 1, upsert: true},
                            function (err, result) {
                                if (err) return console.dir(err);
                            });
                    }
                }
            });
        });
    if (place.type == "hotel")
        db.collection('hotels', function (err, collection) {
            collection.insert(place, {safe: true}, function (err, result) {
                if (err) {
                    res.send({'error': 'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result[0]));
                    var locationObj = {};
                    locationObj.placeid = place._id.toString();
                    locationObj.placename = place.name;
                    locationObj.displaypicture = place.displaypicture;
                    locationObj.type = place.type;
                    locationObj.location = {};
                    locationObj.location.type = "Point";
                    locationObj.location.coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];

                }
                var locationCollection = db.collection('placeLocationIDLookup');
                //locationCollection.createIndex({ loc: "2dsphere" }, { min: -500, max: 500, w: 1 }, function (err, result) {
                locationCollection.ensureIndex({"location": "2dsphere"}, function (err, result) {
                    if (err) return console.dir(err);
                    locationCollection.insert(locationObj, {w: 1}, function (err, result) {
                        if (err) return console.dir(err)
                    });
                });
                var SeasonCollection = db.collection('SeasonLookup');
                if (!(place.season.indexOf(',') > -1)) {
                    place.season = place.season + ',';
                }
                place.season.split(',').forEach(UpdateMonthlySeasonalList);
                function UpdateMonthlySeasonalList(element, index, array) {
                    console.log('a[' + index + '] = ' + element);
                    element = parseInt(element);
                    if (element != -1 && element != undefined) {
                        SeasonCollection.update({_Monthid: element},
                            {$addToSet: {MonthlyPlaces: place._id.toString()}},
                            {w: 1, upsert: true},
                            function (err, result) {
                                if (err) return console.dir(err);
                            });
                    }
                }
            });
        });
    if (place.type == "package")
        db.collection('packages', function (err, collection) {
            collection.insert(place, {safe: true}, function (err, result) {
                if (err) {
                    res.send({'error': 'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result[0]));
                    var locationObj = {};
                    locationObj.placeid = place._id.toString();
                    locationObj.placename = place.name;
                    locationObj.displaypicture = place.displaypicture;
                    locationObj.location = {};
                    locationObj.location.type = "Point";
                    locationObj.location.coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];
                }
                var locationCollection = db.collection('placeLocationIDLookup');
                //locationCollection.createIndex({ loc: "2dsphere" }, { min: -500, max: 500, w: 1 }, function (err, result) {
                locationCollection.ensureIndex({"location": "2dsphere"}, function (err, result) {
                    if (err) return console.dir(err);
                    locationCollection.insert(locationObj, {w: 1}, function (err, result) {
                        if (err) return console.dir(err)
                    });
                });
                var SeasonCollection = db.collection('SeasonLookup');
                if (!(place.season.indexOf(',') > -1)) {
                    place.season = place.season + ',';
                }
                place.season.split(',').forEach(UpdateMonthlySeasonalList);
                function UpdateMonthlySeasonalList(element, index, array) {
                    console.log('a[' + index + '] = ' + element);
                    element = parseInt(element);
                    if (element != -1 && element != undefined) {
                        SeasonCollection.update({_Monthid: element},
                            {$addToSet: {MonthlyPlaces: place._id.toString()}},
                            {w: 1, upsert: true},
                            function (err, result) {
                                if (err) return console.dir(err);
                            });
                    }
                }
            });
        });
}

exports.addUser = function (req, res) {
    var user = req.body.name;
    var firsttimekey ="jhikj";// rand.generate(7);
    user.passwd = firsttimekey;
    console.log('Adding user: ' + JSON.stringify(user));

    db.createUser(
        {
            user: user,
            pwd: firsttimekey,
            roles:
                [
                    { role: "readWrite", db: "config" },
                    "clusterAdmin"
                ]
        }
    );
}
exports.loadUserInfo = function (req, res) {
    var user = req.body.name;
    var firsttimekey = "";//rand.generate(7);
    user.passwd = firsttimekey;
    console.log('Adding place: ' + JSON.stringify(user));

    var userdetails =db.getUser(name);
    console.log(userdetails);
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
var mapFunction = function() {
    for (var idx = 0; idx < this.items.length; idx++) {
        var key ="Honeymoon"//; this.items[idx].category;
        var value = {
   product:this.items[idx]
        };
        emit(key, value);
    }
};

// Add up all the votes for each key.
var reduceFunction = function(key, values) {
    var productlist = [];
    values.forEach(function(doc) {
        doc.offerprice += doc.price - ( doc.offer*100);
        productlist.push(doc);
    });
    return {votes: productlist};
};

var mapFunction1 = function() {
    emit(this.category, this);
};
var reduceFunction1 = function(keyCustId, values) {
    var productlist = [];
    var minoffer =100;
    var maxoffer =0;
    values.forEach(function(doc) {
        if(doc!=undefined)
            if(minoffer>doc.offer)
            {
                minoffer = doc.offer;
            }
            if(maxoffer<doc.offer)
            {
                maxoffer = doc.offer;
            }
        doc.offerprice = doc.price - ((doc.price*100)/doc.offer);
        productlist.push(doc);
    });
    var offerrange = minoffer +" to " +maxoffer;
    keyCustId.offer =offerrange;
    return {products: productlist,offerrange :offerrange};

};

var finalizeFunction2 = function (key, reducedVal) {

   // reducedVal.avg = reducedVal.qty/reducedVal.count;

    return reducedVal;

};
exports.PopulateOffers = function(req,res)
{
    db.collection('packages').mapReduce(
        mapFunction1,
        reduceFunction1,
        {
            out: { merge: "offers" },
            //  query:{ 'offer': "Jonathan.Clark" },
        }
        );
}

exports.GetSEOContents= function(req,res)
{
    console.log("getseo");
    db.collection('packages').find({},{name:1,_id:0}).toArray(function (e, docs) {
        //db.collection('places').find().sort('type').toArray(function (e, docs) {
        if (docs == null) {
          //  callback(null, null);
        }
        var resultSet = [];
        res.send(docs);
    });
}

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

exports.getNearbyPlaces =function(req,res)
{
    var table = req.body.table;
    var referencelocation = req.body.product;
    var lastproduct = req.body.product.nearbylocation[req.body.product.nearbylocation.length-1];
    var inMeters = geolib.getDistance(
        {latitude: lastproduct.lat, longitude: lastproduct.lon},
        {latitude: referencelocation.latitude, longitude: referencelocation.longitude}
    );
    db.collection(table).ensureIndex({ "point": "2dsphere" });
    db.collection("placeLocationIDLookup").find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(referencelocation.longitude), parseFloat(referencelocation.latitude)]
                },
                $minDistance : inMeters
            }
        }
    }).toArray(function(err, res)
    {
     debugger;
    });

}



