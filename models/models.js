var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!"); 
});
var login_schema = mongoose.Schema({
  local:{
    username:String,
    password:String
  },

  facebook:{
    id:String,
    token:String,
    email:String,
    name:String
  },
  google:{
    googleId:String,
    email:String
  },
  github:{
    githubId:String
  }
  })
  var Log = mongoose.model('login',login_schema);

  module.exports = Log;