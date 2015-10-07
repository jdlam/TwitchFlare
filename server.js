var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    requestify = require('requestify'),
    schedule = require('node-schedule');


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
  console.log('job executed');
  requestify.get('https://api.twitch.tv/kraken/games/top?limit=10').then(function(res){
    var data = res.getBody();
    var topGame = data.top[0];
    newGame = {
      name: topGame.game.name,
      box: topGame.game.box.large,
      logo: topGame.game.logo.large,
      stats: [{
        viewers: topGame.viewers,
        channels: topGame.channels
      }]
    };
    // console.log(newGame);
    requestify.post('/api/games', newGame).then(function(res){
      console.log('Game created');
    });
  });
})
