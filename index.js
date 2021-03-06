"use strict";

const express = require('express');
const request = require("request");
const time = require('time')(Date);
const jsdom = require("jsdom");
const app = express();

const port = process.env.PORT || 8080;

const kochwerkUrls = {
    alster: "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-alster.html",
    elbe: "http://speiseplan.kochwerk-hamburg.de/home/kochwerk-elbe.html",
    bonprix: "http://speiseplan.kochwerk-hamburg.de/home/bon-prix.html"
};

const twisterRegex = /twister/i;
const weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', function (req, res) {

    let responseCounter = 0;
    let globalMatch = new Array(5);
    let frittenResponse = new Array(5);
    let where = new Array(5);
    let errorMessages = "";

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
        const now = new Date();
        now.setTimezone("Europe/Berlin");
        const today = now.getDay();
        const hour = now.getHours();

        const blink = hour >= 9 && hour <= 13;
        let question = hour >= 14 ? 'Gab\'s heute Twisterfritten?' : 'Gibt\'s heute Twisterfritten?';

        jsdom.env(body, function (err, window) {
                responseCounter++;

                for (let day = 1; day <= 5; day++) {
                    let element = window.document.getElementById("day_" + day);
                    if (element === null) {
                        errorMessages += `Leider ist der Speiseplan vom Kochwerk (<a href="${url}" target="_blank">${url}</a>) zur Zeit nicht gepflegt.<br>`;
                        break;
                    }
                    let visibleMeals = window.document.getElementById("day_" + day).textContent;
                    const match = !!(visibleMeals.match(twisterRegex));
                    if (match) {
                        where[day] = `${!!where[day] ? where[day] : ""}<a href="${url}" target="_blank">${url}</a><br />`;
                    }
                    globalMatch[day] = globalMatch[day] || match;
                }

                if (responseCounter === Object.keys(kochwerkUrls).length) {

                    const headline = "<h6>" + question + "</h6>\n";

                    frittenResponse[today] = globalMatch[today] ? "<h1>JA</h1>" : "<h1>NEIN</h1>\n";

                    if (globalMatch[today]) {
                        where[today] = `<p>Wo? ${where[today]}</p>`;
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

                    if (errorMessages !== "") {
                        message = "<h3>Twister Panic</h3>" + errorMessages;
                        question = "Twister Panic";
                    }

                    res.render('index', {
                        title: question,
                        message: message,
                        theme: req.query.theme,
                        heute: globalMatch[today] && blink
                    });
                }
            }
        );
    }
});

app.listen(port, function () {
    console.log('Twisterfritten app listening on port ' + port);
});

