var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AddonSchema = new Schema({
	category:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	city :String,
	district:String,
	state:String,
	data:{}
});

var Addon = mongoose.model('Addon', AddonSchema);
module.exports = Addon;