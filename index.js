var express = require('express');
var request = require("request");
var app = express();

app.get('/', function (req, res) {
    var options = {
        host: 'speiseplan.kochwerk-hamburg.de',
        port: 80,
        path: '/home/kochwerk-alster.html',
        method: 'GET'
    };

    console.log("Sending request");

    var kochwerkUrl = "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-alster.html";
    var twisterRegex = /twister/i;

    var gibtsTwisterFritten = false;

    request(kochwerkUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var match = gibtsTwisterFritten = body.match(twisterRegex);
            var frittenResponse = !!gibtsTwisterFritten ? "<h1>JA</h1>" : "<h1>NEIN</h1>";
            res.send(frittenResponse);
        } else {
            res.error(error);
        }
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

