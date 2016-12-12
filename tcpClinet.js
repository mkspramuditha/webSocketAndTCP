/**
 * Created by shan on 12/12/16.
 */
var net = require('net');

var client = new net.Socket();
client.connect(3000, '127.0.0.1', function() {
    console.log('Connected');
    // var value1 = '78781f12100a100d1408c70211111100322222003401019d01cb20002e02000db1b20d';
    // var value2 = '78780d0103554880201067640004b1bb0d0a';
    // client.write(new Buffer(value2, 'hex'),function () {
    //     client.write(new Buffer(value1, 'hex'),function () {
    //         client.destroy();
    //     });
    // });
    client.write(new Buffer("12345 tcp client"),function () {
        
    })
});

client.on('data', function(data) {
    console.log(data);

});

client.on('close', function() {
    console.log('Connection closed');
});
