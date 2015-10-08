// Require what will be needed for the controller
var express  =  require('express'),
    Game     =  require('../models/game'),
    gamesRouter   =  express.Router();

// Return ALL the users as json to GET to '/api/games'
gamesRouter.get('/', function (req, res) {
  Game.find({}, function (err, results) {
    res.json(results);
  });
});

// Create a new user and return as json for POST to '/api/games'
gamesRouter.post('/', function (req, res) {
  console.log('************************');
  var game = new Game(req.body);
  console.log(game);
  game.save(function(){
    res.json(game);
  });
});

// Export the controller
module.exports = gamesRouter;
