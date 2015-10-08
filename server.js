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
  // getStreams("League of Legends");
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
          updated: Date.now(),
          viewers: data.top[i].viewers,
          channels: data.top[i].channels
        }]
      };
      findGame(newGame);
    }
  });
}

// Finds game within the database
function findGame(newGame){
  Game.findOne({name: newGame.name}, function(err, game){
    // If game is not found
    if (game === null) {
      // Create game
      var game = new Game(newGame);
      console.log(newGame.name + " was added to the collection");
    } else {
      // If game is found
      // Update existing game entry
      console.log(newGame.name + ' already exists...');
      game.stats.push( newGame.stats[0] )
    }

    // Push in top 10 streams of this game
    getStreams(game, newGame.name);
  })
};

// Gets the stream data for a specific game
function getStreams(game, gameName){
  var gameStreams = [];
  var url = "https://api.twitch.tv/kraken/streams?game=" + gameName + "&limit=3";
  requestify.get(url).then(function(res){
    var data = res.getBody();
    var streams = data.streams;
    var streamsArray = [];

    // Push each stream object into the streamsArray
    for (var i=0; i<streams.length; i++) {
      var stream = {
        stream_name: streams[i].channel.display_name,
        url: streams[i].channel.url,
        logo: streams[i].channel.logo,
        stats: [{
          stream_viewers: streams[i].viewers,
          stream_followers: streams[i].channel.followers,
          views: streams[i].channel.views
        }]
      };
      streamsArray.push(stream);
    }
    var idx = game.stats.length-1;
    game.stats[idx].streams = streamsArray;
    game.save();
    console.log('Saved top ' + game.name + ' streams');
  });
}
