var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name:  String,
	password: String,
	email: String,
	username:String,
	_id :String,
	role:String,
	mapped_users:[{
		id:String,
		name:String,
		status:String,
		company:String,
		role:String,
	}],
	supervisor:String,
	orders: [{ body: String, date: Date }],
	payment_methods: [
		{name: String,
			last_four: String,
			crypted_number: String,
			expiration_date: Date
		}
	],
	addresses: [{name: String,
		street: String,
		city: String,
		state: String,
		zip: String}],
	created_date: { type: Date, default: Date.now },
	hidden: Boolean,
});

var User = mongoose.model('User', UserSchema);

// make this available to our users in our Node applications
module.exports = User;