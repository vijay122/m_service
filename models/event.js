/**
 * Created by vanbazhagan on 26/06/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

var Event = mongoose.model('Event', EventSchema);

module.exports = Event;