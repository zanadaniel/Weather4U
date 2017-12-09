var express = require('express');
var router = express.Router();
var YQL = require('yql');

/* GET locations page. */
router.get('/', function(req, res, next) {
  req.db.get('locations').find({},{},function(e,docs){

    var saved_locations = {};
    
    docs.forEach(function(loc, currentLoc){
      
      saved_locations[loc.city + ", " + loc.country] =  [];
      
      var query = new YQL(`select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${loc.city + ", " + loc.country}") and u="c" `);
      
      query.exec(function(err, data) {
        
        if(err){
          console.log(err);
          return;
        }
    
        for(var day in data.query.results.channel.item.forecast){
          if(day == 0){
            saved_locations[loc.city + ", " + loc.country].push({
              day: data.query.results.channel.item.forecast[day].day,
              date: data.query.results.channel.item.forecast[day].date,
              condition: data.query.results.channel.item.forecast[day].text,
              high: data.query.results.channel.item.forecast[day].high,
              low: data.query.results.channel.item.forecast[day].low,
              windspeed: data.query.results.channel.wind.speed,
              humidity: data.query.results.channel.atmosphere.humidity,
              visibility: data.query.results.channel.atmosphere.visibility,
              sunrise: data.query.results.channel.astronomy.sunrise,
              sunset: data.query.results.channel.astronomy.sunset
            });
            
          }else{
            saved_locations[loc.city + ", " + loc.country].push({
              day: data.query.results.channel.item.forecast[day].day,
              date: data.query.results.channel.item.forecast[day].date,
              condition: data.query.results.channel.item.forecast[day].text,
              high: data.query.results.channel.item.forecast[day].high,
              low: data.query.results.channel.item.forecast[day].low
            });
          }
        }
      }); // API call
    }); // forEach location
    
    setTimeout(function() {
      res.render('locations', {
      title: 'Weather4U',
      locations: saved_locations
      });
    }, 1000);
  });
});

/* POST delete */
router.post('/delete/:city/:country', function(req, res) {
  
  req.db.get('locations').remove({
    city: req.params.city,
    country: req.params.country
  }, function (err,oc) {
    if (err) {
      // If it failed, return error
      res.send("There was a problem deleting the information from the database.");
    } else {
      // redirect to locations
      res.redirect("../../../locations");
    }
  }); // db delete
});

module.exports = router;