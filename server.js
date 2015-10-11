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
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/twitch-stats')

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
var GamesController = require('./server/controllers/games')
app.use('/api/games', GamesController)

// Server
var port = process.env.PORT || '8080';
app.listen(port, function(){
  console.log('listening on ' + port + '...')
})

// CRON Job
var job = schedule.scheduleJob('7 * * * *', function(){
  fetchTopGames();
})

function fetchTopGames(){
  console.log('top games');
  requestify.get('https://api.twitch.tv/kraken/games/top?limit=3').then(function(res){
    var data = res.getBody();
    for (var i=0; i<data.top.length; i++) {
      var d = new Date;
      console.log(d.getHours() + ':' + d.getMinutes());
      var h = d.getHours();
      newGame = {
        name: data.top[i].game.name,
        box: data.top[i].game.box.large,
        logo: data.top[i].game.logo.large,
        updated: h,
        viewers: data.top[i].viewers,
        channels: data.top[i].channels
      };

      findGame(newGame);
    }
  });
}

// Finds game within the database
function findGame(newGame){
  var d = new Date;
  var h = d.getHours();
  Game.findOne({name: newGame.name, updated: newGame.updated}, function(err, game){
    // If game is not found
    if (game) {
      // If game is found
      // Update existing game entry
      console.log(newGame.name + ' data already exists...');
      game.remove();
      console.log(newGame.name + ' data removed');
    }
    // Create game
    var game = new Game(newGame);
    console.log(newGame.name + " data pulled");

    // Push in top 10 streams of this game
    getStreams(game, newGame.name);
  })
};

// Gets the stream data for a specific game
function getStreams(game, gameName){
  var url = "https://api.twitch.tv/kraken/streams?game=" + gameName + "&limit=3";
  requestify.get(url).then(function(res){
    console.log('pulling streams for ' + gameName);
    var data = res.getBody();
    var streams = data.streams;
    var streamsArray = [];

    // Push each stream object into the streamsArray
    for (var i=0; i<=streams.length; i++) {
      var topStreamViewers = 0;
      if (i==streams.length) {
        var viewers = game.viewers - topStreamViewers;
        var stream = {
          name: 'Miscellaneous',
          url: 'www.twitch.tv/directory/game/' + gameName,
          logo: '',
          size: viewers
        }
      } else {
        topStreamViewers += streams[i].viewers;
        var stream = {
          name: streams[i].channel.display_name,
          url: streams[i].channel.url,
          logo: streams[i].channel.logo,
          size: streams[i].viewers
        };
      }
      streamsArray.push(stream);
    }
    game.children = streamsArray;
    game.save();
    console.log('Saved top ' + game.name + ' streams');
  });
}
