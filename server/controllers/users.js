// Require what will be needed for the controller
var express  =  require('express'),
    User     =  require('../models/user'),
    usersRouter   =  express.Router();

// Return ALL the users as json to GET to '/api/users'
usersRouter.get('/', function (req, res) {
  User.find({}, function (err, results) {
    res.json(results);
  });
});

usersRouter.post('/authentication_token', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({username: username}, function(err, user){
    user.authenticate(password, function(isMatch){
      if(isMatch){
        user.generateToken();
        user.save(function(){
          res.json({token: user.token});
        });
      } else {
        res.json({status: 401, message: "You're not allowed"});
      }
    });
  });
});


// Create a new user and return as json for POST to '/api/users'
usersRouter.post('/', function (req, res) {
  var user = new User(req.body);
  user.save(function(){
    res.json(user);
  });
});

// Export the controller
module.exports = usersRouter;
