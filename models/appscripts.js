var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AppScriptsSchema = new Schema({
	CategoryCount : [],
	SectionScripts:{}
});

var AppScripts = mongoose.model('AppScripts',AppScriptsSchema);

module.exports = AppScripts;