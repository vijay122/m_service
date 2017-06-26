var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShoppingCartSchema = new Schema({}, { strict: false });
var ShoppingCart = mongoose.model('ShoppingCart', ShoppingCartSchema);

module.exports = ShoppingCart;