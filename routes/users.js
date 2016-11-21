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
				_id :req.body.payload.phonenumber,
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
		User.findOne({ _id: req.body.payload.phone_number }, function(err, user) {
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

	if(req.body.payload.status)
	{

	}

	var newUser = User({
		_id: req.body.payload.phone_number,
		password:firsttimekey
	});
	newUser.status = req.body.payload.status!=undefined?req.body.payload.status:"active";
	newUser.role = req.body.payload.role!= undefined?req.body.payload.role:"user";
	newUser.company = req.body.payload.company;
	console.log('Adding user: ' + JSON.stringify(newUser));
	newUser.save(function(err) {
		if (err) throw err;
		if(req.body.payload.supervisor_id!= "" && req.body.payload.supervisor_id && req.body.payload.supervisor_id != req.body.payload.phone_number)
		{
			var user ={};
			user.id =req.body.payload.phone_number;
			user.name=req.body.payload.name;
			user.status=req.body.payload.status;
			user.role=req.body.payload.role;
			user.company=req.body.payload.company;
			User.findOneAndUpdate({ _id: req.body.payload.supervisor_id },
			{$push: {"mapped_users": user}}, function(err, user) {
				if (err) throw err;
				console.log(user);

			});
		}
		console.log('User created!');
	});
}