var mongoose = require('mongoose');
var User = require('../models/user');
var connectionString = 'mongodb://root:Vjy4livelytrips@192.169.149.245:27017/placesDB?authSource=admin';

mongoose.connect('mongodb://root:Vjy4livelytrips@192.169.149.245:27017/placesDB?authSource=admin');

exports.updateUser = function (req, res) {
	try
	{
		if(req.body.payload.phone_number !="")
		{
			User.findOneAndUpdate({ phone_number: req.body.payload.phonenumber }, {
				name:  req.body.payload.name,
				password: req.body.payload.password,
				email: req.body.payload.email,
				username:req.body.payload.username,
				phone_number :req.body.payload.phonenumber,
			}, function(err, user) {
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

exports.loadUserInfo = function (req, res) {
	try
	{
		// get the user starlord55
		User.findOne({ phone_number: req.body.payload.phone_number }, function(err, user) {
			if (err) throw err;

			// object of the user
			var s = user.toObject();
			return res.send(200, JSON.stringify(s));
		});
	}
	catch (e)
	{
		console.log(' user details fetch error: ');
		console.log(e);
	}
}
exports.addUser = function (req, res) {

	var firsttimekey ="12345678";// rand.generate(7);

	var newUser = User({
		phone_number: req.body.phone_number,
		password:firsttimekey
	});
	console.log('Adding user: ' + JSON.stringify(newUser));
	newUser.save(function(err) {
		if (err) throw err;
		if(req.body.supervisor_id!= "" && req.body.supervisor_id && req.body.supervisor_id != req.body.phone_number)
		{
			var user ={};
			user.id =req.body.phone_number;
			user.name=req.body.name;
			user.status="Active";
			User.findOneAndUpdate({ phone_number: req.body.supervisor_id },
			{$push: {"mapped_users": user}}, function(err, user) {
				if (err) throw err;
				console.log(user);

			});
		}
		console.log('User created!');
	});
}