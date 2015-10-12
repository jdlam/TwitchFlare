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
var job = schedule.scheduleJob('15 */1 * * *', function(){
  fetchTopGames();
})

function fetchTopGames(){
  console.log('top games');
  requestify.get('https://api.twitch.tv/kraken/games/top?limit=6').then(function(res){
    var data = res.getBody();
    var d = new Date;
    console.log(d.getHours() + ':' + d.getMinutes());
    var h = d.getHours();

    removeGames(data, h);

  });
}

function removeGames(data, h) {
  Game.remove({updated: h}, function(err, game){

    console.log('removed old data');

    // For each game pulled from Twitch, create a new object newGame, and create it
    for (var i=0; i<data.top.length; i++) {
      newGame = {
        name: data.top[i].game.name,
        box: data.top[i].game.box.large,
        logo: data.top[i].game.logo.large,
        updated: h,
        viewers: data.top[i].viewers,
        channels: data.top[i].channels
      };

      createGame(newGame);
    }
  })
}

// Finds game within the database
function createGame(newGame){

  // Create game
  var game = new Game(newGame);
  console.log(newGame.name + " game data stored");

  // Push in top 10 streams of this game
  getStreams(game, newGame.name);
};

// Gets the stream data for a specific game
function getStreams(game, gameName){
  var url = "https://api.twitch.tv/kraken/streams?game=" + gameName + "&limit=10";
  requestify.get(url).then(function(res){
    console.log('pulling streams for ' + gameName);
    var data = res.getBody();
    var streams = data.streams;
    var streamsArray = [];
    var topStreamViewers = 0;

    // Push each stream object into the streamsArray
    for (var i=0; i<=streams.length; i++) {
      if (i==streams.length) {
        var viewers = game.viewers - topStreamViewers;
        var stream = {
          name: 'Miscellaneous',
          url: 'www.twitch.tv/directory/game/' + gameName,
          logo: 'http://images.akamai.steamusercontent.com/ugc/36357635592724233/A32679C5E8B2E28E91D9B7DC2950DC4260F88776/',
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
