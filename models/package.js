var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PackageSchema = new Schema({
	name: String,
	duration:String,
	noofnights:String,
	noofdays:String,
	title:String,
	_id:String,
	classification:String,
	type:String,
	loc: {
		type: { type: String },
		coordinates: [ Number ],
	},
	city :String,
	district:String,
	state:String,
	pincode:String,
	country:String,
	products:[],
	assets:
		{
			display:String,
			image:[]
		},
	description:String,
	landmark: String,
	price: Number,
	sale: [{
		salePrice: Number,
		saleEndDate: { type: Date, default: Date.now },
	}],
	last_updated_date: { type: Date, default: Date.now },
	start_date: { type: Date, default: Date.now },
	end_date: { type: Date, default: Date.now },
	created_by:String,
	aboutoperator:String,
	category:[String],
	season: String,
});

var Package = mongoose.model('Package', PackageSchema);

module.exports = Package;
