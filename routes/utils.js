 
var SmsGateway = require('smsgateway');
 
var gateway = new SmsGateway('livelytrips@gmail.com','vijayarunvijay');
var jwt = require('jsonwebtoken');
var http = require("http");

exports.SendMessage = function(name) {
    console.log('sending messages: ');

var number=name;
var message="Warm welcome from LivelyTrips";
var deviceId="55362";
var options={};
//options.send_at="8110001444";
let args ={};
	 args['apikey']="Azc4voyIz4k-B0vUq96035gWYbEXSuSzd89oAj70nL";
			args['message'] =  "This is your message";
			args['sender'] =  "TXTLCL";
			args['numbers'] =  [name];
PostToTextMessage('https://api.textlocal.in/',[name],'send','post',args)
/*
    gateway.sendMessageToNumber(number, message, deviceId, options).then(function(data){
    console.log('getDevices Success');
    console.log(data);
}).fail(function(message){
    console.log('failed',message);
});
*/
   
};


function PostToTextMessage(baseUri,arrMobileNumber,path, method,args)
{
var options = {
  hostname: baseUri+path,
  path: path,
  method: method,
  headers: {
      'Content-Type': 'application/json',
  },

};
var req = http.request(options, function(res) {
  console.log('Status: ' + res.statusCode);
  console.log('Headers: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (body) {
    console.log('Body: ' + body);
  });
});
req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});
// write data to request body
req.write('{"string": "Hello, World"}');
req.end();
}

exports.generateToken = function(user){
	//1. Dont use password and other sensitive fields
	//2. Use fields that are useful in other parts of the
	//app/collections/models
	var u = {
		name: user.name,
		_id: user._id.toString(),
	};
	return token = jwt.sign(user, "my_secret", {
		expiresIn: 60 * 60 * 24 // expires in 24 hours
	});
}

