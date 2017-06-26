var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
	number: String,
	session:String,
	interests:[],
	currentItemName:String,
	currentItemId:String,
	created_date: { type: Date, default: Date.now },
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;