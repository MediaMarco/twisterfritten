"use strict";

const express = require('express');
const request = require("request");
const jsdom = require("jsdom");
const app = express();

const port = process.env.PORT || 8080;

const kochwerkUrls = {
    alster: "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-alster.html",
    elbe: "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-elbe.html",
    bonprix: "http://speiseplan.kochwerk-hamburg.de/home/bon-prix.html"
};

const headline = "<h6>Gibt's heute Twisterfritten?</h6>\n";
const twisterRegex = /twister/i;
const weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', function (req, res) {

    let responseCounter = 0;
    let globalMatch = new Array(5);
    let frittenResponse = new Array(5);
    let where = new Array(5);

    for (let key in kochwerkUrls) {
        doRequest(key);
    }

    function doRequest(key) {
        const callback = function (error, response, body) {
            if (!error && response.statusCode == 200) {
                collectResponse(kochwerkUrls[key], res, body);
            } else {
                res.error(error);
            }
        };
        request(kochwerkUrls[key], callback);
    }

    function collectResponse(url, res, body) {
        const today = new Date().getDay();
        jsdom.env(body, function (err, window) {
                responseCounter++;
                for (let day = 1; day <= 5; day++) {
                    let visibleMeals = window.document.getElementById("day_" + day).textContent;
                    const match = !!(visibleMeals.match(twisterRegex));
                    if (match) {
                        where[day] = `${!!where[day] ? where[day] : ""}<a href="${url}">${url}</a><br />`;
                    }
                    globalMatch[day] = globalMatch[day] || match;
                }


                if (responseCounter == Object.keys(kochwerkUrls).length) {
                    frittenResponse[today] = globalMatch[today] ? "<h1>JA</h1>" : "<h1>NEIN</h1>\n";

                    if (globalMatch[today]) {
                        where[today] = `<h4>Wo?<br />${where[today]}</h4>`;
                    }
                    let message = headline + frittenResponse[today];
                    if (!!where[today]) {
                        message += where[today];
                    }

                    if (!globalMatch[today]) {
                        for (let day = today + 1; day <= 5; day++) {
                            if (globalMatch[day]) {
                                message += "<p>Aber am " + weekDays[day] + " hier:<br/> " + where[day] + "</p>";
                            }
                        }
                    }
                    res.render('index', {
                        title: 'Gibt\'s heute Twisterfritten?',
                        message: message,
                        theme: req.query.theme
                    });
                }
            }
        );
    }
});

app.listen(port, function () {
    console.log('Twisterfritten app listening on port ' + port);
});

