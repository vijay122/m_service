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

module.exports = ProductSchema;