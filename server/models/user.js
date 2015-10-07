// Require what will be needed for the model
var mongoose    =    require('mongoose'),
    randToken   =    require('rand-token'),
    bcrypt      =    require('bcrypt-nodejs');

// Schema for the model
var UserSchema = new mongoose.Schema({
  username: {type: String, required: true },
  password: {type: String},
  token: {type: String}
});

// pre-save "hook"
UserSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('password')) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;
  }

  next();
});

// Methods all users should have

UserSchema.methods.generateToken = function(){
  var user = this;
  user.token = randToken.generate(16);
};

UserSchema.methods.authenticate = function(password, next){
  var user = this;
  bcrypt.compare(password, user.password, function(err, isMatch) {
    next(isMatch);
  });
};

// Create a User mongoose model based on the UserSchema
var User = mongoose.model('User', UserSchema);

// Export the User model
module.exports = User;
