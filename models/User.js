var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

userSchema.methods.validPassword = function(password) {
  return password === this.password;
};
var User = mongoose.model('User', userSchema);
module.exports = User;