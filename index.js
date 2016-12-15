var express = require('express');
var request = require("request");
var app = express();

var port = process.env.PORT || 8080;

var responseCounter = 0;
var where = "";
var found = false;

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', function (req, res) {
    var kochwerkUrls = {
        alster : "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-alster.html",
        elbe : "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-elbe.html",
        bonprix : "http://speiseplan.kochwerk-hamburg.de/home/bon-prix.html"
    };
    var twisterRegex = /twister/i;

    var gibtsTwisterFritten = false;

    request(kochwerkUrls.alster, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var match = gibtsTwisterFritten = body.match(twisterRegex);
            var frittenResponse = !!gibtsTwisterFritten ? "<h1>JA</h1>" : "<h1>NEIN</h1>";
            var headline = "<h3>Gibt's heute Twisterfritten?</h3>\n";
            res.render('index', { title: 'Gibt\'s heute Twisterfritten?' , message: headline + frittenResponse});
        } else {
            res.error(error);
        }
    });
});

function collectResponses() {

}

app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

