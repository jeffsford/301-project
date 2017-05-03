'use strict';

var clear = require('clear');
clear();

const pg = require('pg');
const fs = require('fs');
const express = require('express');

const requestProxy = require('express-request-proxy');
const bodyParser = require('body-parser');
const request = require('superagent');
const eventsURL = 'https://app.ticketmaster.com/discovery/v2/events.json?size=1&sort=date,name,asc&city=Seattle&classificationName=Music&apikey=aPLdF6GC2G6nLNrygytPbkvPzCU7CjGS';

const PORT = process.env.PORT || 3000;
const app = express();
const conString = process.env.DATABASE_URL + 'project301';
const client = new pg.Client(conString);
client.connect();
client.on('error', err => console.error(err));

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (request,response) => response.sendFile('index.html', {root:'./public'}))

// function proxyTicketmaster(request, response) {
//   console.log('Routing Ticketmaster request for', request.params[0]);
//   (requestProxy({
//     url: `https://app.ticketmaster.com/${request.params[0]}`,
//     headers: {Authorization: `token ${process.env.TICKETMASTER_TOKEN}`}
//   }))(request, response);
// }
//
// app.get('/ticketmaster/*', proxyTicketmaster);

loadDB();
app.post('/project301', loadEvents);

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));

function loadDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS
    project301 (
      artist VARCHAR(255),
      venue VARCHAR(255),
      date DATE,
      time TIME,
      address VARCHAR(255),
      description VARCHAR,
      link VARCHAR(255),
      image VARCHAR(255),
      latitude DECIMAL,
      longitude DECIMAL,
      genre VARCHAR(255)
    );`
  )
  .catch(console.error);
}


function loadEvents(request, response) {
  client.query('SELECT COUNT(*) FROM project301')
  .then(result => {
    if(!parseInt(result.rows[0].count)) {
      client.query(
        `INSERT INTO
        project301(artist, venue, date, time, address, description, link, image, latitude, longitude, genre) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [request.body.artist, request.body.venue, request.body.date, request.body.time, request.body.address, request.body.description, request.body.link, request.body.image, request.body.latitude, request.body.longitude, request.body.genre]
      ).then(response.send(this))
      .catch(console.error);
    } else {
        console.log('No new content');
    }
  })
}
