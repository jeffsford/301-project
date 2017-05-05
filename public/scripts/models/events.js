'use strict';

(function(module) {
  const events = {};

  events.objects = [];

  events.all = [];

  events.fetchAll = data => events.all.map(function(data){
    let newEvent = new Event(data);
    newEvent.insertRecord();
  });

  events.requestEvents = (callback) => {
    $.get(`https://app.ticketmaster.com/discovery/v2/events.json?size=30&sort=date,name,asc&city=Seattle&classificationName=Music&apikey=aPLdF6GC2G6nLNrygytPbkvPzCU7CjGS`)
    .done(data => events.all = data._embedded.events)
    .done(data => {
      events.fetchAll(data);
    })
    .done(callback), err => console.log(err)
  };

  module.events = events;
})(window);
