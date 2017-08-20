var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CaravanSchema = new Schema({
	name: String,
	title:String,
	_id:String,
	type:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	longitude:Number,
	latitude:Number,
	pricePerKilometer:Number,
	pricePerDay:Number,
	category:String,
	ownerName:String,
	registrationNumber:String,
	model:String,
	make:String,
	numberOfSeats:Number,
	ownerPhoneNumber:Number,
	ownerUsername:String,
	city :String,
	state:String,
	pincode:String,
	country:String,
	displaypicture:String,
	description:String,
	image: [],
	created_date: { type: Date, default: Date.now },
	created_by:String,
});

var Caravan = mongoose.model('Caravan', CaravanSchema);

module.exports = Caravan;
