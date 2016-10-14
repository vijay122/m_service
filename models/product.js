var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	_id:  String,
	name: String,
	title:String,
	type :String,
	inputType:String,
   location:{
	   coordinates : [String,String],
	   index: true
   },
	city :String,
	state:String,
	pincode:String,
	displaypicture:String,
	description:String,
	landmark: String,
	image: [],
	created_date: { type: Date, default: Date.now },
	season: String,
});

var Place = mongoose.model('Place', ProductSchema);
