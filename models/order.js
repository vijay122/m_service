var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var OrderSchema = new Schema({
	mon: String,
	userInfo:{},
	customerInfo:{},
	paymentInfo:{},
	productsInfo:{},
	duedateInfo :{},
	created_date: { type: Date, default: Date.now },
});

var Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
