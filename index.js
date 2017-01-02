const express = require('express');
const request = require("request");
const app = express();

const port = process.env.PORT || 8080;

const kochwerkUrls = {
    alster: "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-alster.html",
    elbe: "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-elbe.html",
    bonprix: "http://speiseplan.kochwerk-hamburg.de/home/bon-prix.html"
};

const headline = "<h3>Gibt's heute Twisterfritten?</h3>\n";
const twisterRegex = /twister/i;

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', function (req, res) {

    let responseCounter = 0;
    let where = "";
    let globalMatch = false;

    for (let key in kochwerkUrls) {
        doRequest(key);
    }

    function doRequest(key) {
        const callback = function (error, response, body) {
            if (!error && response.statusCode == 200) {
                collectResponses(kochwerkUrls[key], res, body);
            } else {
                res.error(error);
            }
        };
        request(kochwerkUrls[key], callback);
    }

    function collectResponses(url, res, body) {
        responseCounter++;
        const match = !!(body.match(twisterRegex));
        if (match) {
            where = `${where}<a href="${url}">${url}</a><br />`;
        }
        globalMatch = globalMatch || match;
        if (responseCounter == Object.keys(kochwerkUrls).length) {
            const frittenResponse = globalMatch ? "<h1>JA</h1>" : "<h1>NEIN</h1>\n";

            if (globalMatch) {
                where = `<h4>Wo?<br />${where}</h4>`;
            }

            res.render('index', {title: 'Gibt\'s heute Twisterfritten?', message: headline + frittenResponse + where});
        }
    }
});

app.listen(port, function () {
    console.log('Twisterfritten app listening on port ' + port);
});

