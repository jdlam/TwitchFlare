// Require what will be needed for the model
var mongoose    =    require('mongoose');

// Schema for the model
var GameSchema = new mongoose.Schema({
  name: {type: String, required: true },
  box: {type: String},
  logo: {type: String},
  stats: [{
    updated: {type: Date, default: Date.now},
    viewers: {type: Number},
    channels: {type: Number},
    streams: [{
      stream_name: {type: String},
      url: {type: String},
      logo: {type: String},
      stats: [{
        stream_viewers: {type: Number}
      }]
    }]
  }]
});


var GameSchema = new mongoose.Schema({
  name: {type: String, required: true },
  box: {type: String},
  logo: {type: String},
  updated: {type: Number},
  viewers: {type: Number},
  channels: {type: Number},
  children: [
    {
      name: {type: String},
      url: {type: String},
      logo: {type: String},
      size: {type: Number}
    }
  ]
});

// Create a TwitchGame mongoose model based on the TwitchGameSchema
var Game = mongoose.model('Game', GameSchema);

// Export the TwitchGame model
module.exports = Game;
