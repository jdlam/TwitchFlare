// Dependencies/npm's
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    requestify = require('requestify'),
    schedule = require('node-schedule');

var Game = require('./server/models/game.js');

var app = express();

// Connect to Database
mongoose.connect('mongodb://localhost/twitch-stats')

// Server Logging
app.use(morgan('dev'));

// Configure
app.use(express.static(__dirname + '/client'));

// Config Body Parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Routes
app.get('/', function(){
  res.sendFile(__dirname + '/client/index.html');
});

// Routing/Controllers
var UsersController = require('./server/controllers/users');
app.use('/api/users', UsersController);

var GamesController = require('./server/controllers/games')
app.use('/api/games', GamesController)

// Server
port = 8080;
app.listen(port, function(){
  console.log('listening on ' + port + '...')
})



// CRON Job
var job = schedule.scheduleJob('*/5 * * * * *', function(){
  fetchTopGames();
})

function fetchTopGames(){
  requestify.get('https://api.twitch.tv/kraken/games/top?limit=3').then(function(res){
    var data = res.getBody();
    for (var i=0; i<data.top.length; i++) {
      newGame = {
        name: data.top[i].game.name,
        box: data.top[i].game.box.large,
        logo: data.top[i].game.logo.large,
        stats: [{
          viewers: data.top[i].viewers,
          channels: data.top[i].channels
        }]
      };
      findOrCreateGame(newGame);
      fetchStreamers(newGame.name);
    }
  });
}

function findOrCreateGame(newGame){
  Game.findOne({name: newGame.name}, function(err, game){
    if (game === null) {
      // create game
      var twitchGame = new Game(newGame);
      twitchGame.save();
      console.log("Game created " + newGame.name);
      console.log(newGame);
    } else {
      // update existing game entry
      console.log('already exists');
    }
  })
};

function fetchStreamers(gameName){

}
