 
var SmsGateway = require('smsgateway');
 
var gateway = new SmsGateway('livelytrips@gmail.com','vijayarunvijay');

exports.SendMessage = function(name) {
    console.log('sending messages: ');

var number="8110001444";
var message="Warm welcome from LivelyTrips";
var deviceId="1";
var options={};
options.send_at="8110001444";

    gateway.send(number, message, deviceId, options).then(function(data){
    console.log('getDevices Success');
    console.log(data);
}).fail(function(message){
    console.log('failed',message);
});
   
};

