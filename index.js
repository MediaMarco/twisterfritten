var express = require('express');
var request = require("request");
var app = express();

var port = process.env.PORT || 8080;

var kochwerkUrls = {
    alster : "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-alster.html",
    elbe : "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-elbe.html",
    bonprix : "http://speiseplan.kochwerk-hamburg.de/home/bon-prix.html"
};

var headline = "<h3>Gibt's heute Twisterfritten?</h3>\n";
var twisterRegex = /twister/i;

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', function (req, res) {

    var responseCounter = 0;
    var where = "";
    var globalMatch = false;

    for (var key in kochwerkUrls) {
        doRequest(key);
    }

    function doRequest(key) {
        const callback = function (error, response, body) {
            if (!error && response.statusCode == 200) {
                collectResponses(kochwerkUrls[key], res, body);
            } else {
                res.error(error);
            }
        }
        request(kochwerkUrls[key], callback);
    }

    function collectResponses(url, res, body) {
        responseCounter++;
        var match = !!(body.match(twisterRegex));
        if (match) {
            where = where + ("<a href=\"" + url + "\">" + url + "</a><br />");
        }
        globalMatch = globalMatch || match;
        if (responseCounter == Object.keys(kochwerkUrls).length) {
            var frittenResponse = !!globalMatch ? "<h1>JA</h1>" : "<h1>NEIN</h1>\n";

            if (globalMatch) {
                where = "<h4>Wo?<br />" + where + "</h4>";
            }

            res.render('index', {title: 'Gibt\'s heute Twisterfritten?', message: headline + frittenResponse + where});
        }
    }
});

app.listen(port, function () {
    console.log('Twisterfritten app listening on port ' + port);
});

