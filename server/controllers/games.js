// Require what will be needed for the controller
var express  =  require('express'),
    Game     =  require('../models/game'),
    gamesRouter   =  express.Router();

// INDEX
gamesRouter.get('/', function (req, res) {
  // Return ALL the games from the past 24 hours
  Game.find({}, function (err, results) {
    // Parse into Sunburst format
    var flare = {
      name: "Streams from the past 24 hours",
      children: [results]
    };
    res.send(flare);
  });
});

// SHOW
gamesRouter.get('/:hour', function(req, res){
  var hours = req.params.hour
  // Return only games that were recorded at specified time of day
  Game.find({updated: hours}, function(err, results){
    // Parse into Sunburst Flare format
    var flare = {
      name: "Streams from " + hours + "00",
      children: [results]
    };
    res.send(flare);
  });
})

// Export the controller
module.exports = gamesRouter;
