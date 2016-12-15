var express = require('express');
var request = require("request");
var app = express();

var port = process.env.PORT || 8080;

app.get('/', function (req, res) {
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

app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

