var passport = require("passport");
var express = require('express');
var app = express(); 


//Authenticate with google
//configiure
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
   clientID:     '785181314990-mr0d94r5u2a5qahtuli03ihgqe50f7va.apps.googleusercontent.com',
   clientSecret: 'bFTlsW7CnTDendBrwlxSfkOa',
   callbackURL: "http://localhost:7000/auth/google/callback",
   passReqToCallback   : true
 },
 function(request, accessToken, refreshToken, profile, done) {
    //  console.log(profile)
   Log.findOne({ 'google.googleId': profile.id}, function (err, user) {

     if(err) 
      return done(err);
    if(user) 
       return done(null,user);
      else{
          var newUser = new Log();
           newUser.google.googleId = profile.id;
           newUser.google.email = profile.email;

          newUser.save(function(err){
              if(err)
               throw err;
              return done(null,newUser);
                
          })
      }


   });
 }
));

//middleware
app.get('/auth/google',
passport.authenticate('google', { scope: 
    [ 'https://www.googleapis.com/auth/plus.login',
    , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

app.get( '/auth/google/callback', 
  passport.authenticate( 'google', { 
      successRedirect: '/auth/google/success',
      failureRedirect: '/auth/google/failure'
}));

app.get('/auth/google/success',function(req,res){

    Log.find(function(err,user){
      
        if(err) throw err;
      
          res.render('google.ejs',{user:user});
         
    })
    // res.send('Welcome');
})
app.get('/auth/google/failure',function(req,res){
    res.send('error');
})
//end


//facebook strategy
var FacebookStrategy = require('passport-facebook').Strategy;

//configure
passport.use(new FacebookStrategy({
    clientID: 319558548518506,
    clientSecret: '1a388ce13f1f4da1d3c66e1d4915e28a',
    callbackURL: "http://localhost:7000/auth/facebook/callback"
  },
    function(accessToken, refreshToken, profile, done) {
      process.nextTick(function(){
       //    console.log(profile)
        Log.findOne({'facebook.id':profile.id},function(err,user){
           
           if(err) 
             return done(err);
           if(user) 
              return done(null,user);
              else{
                  var newUser = new Log();
                  newUser.facebook.id = profile.id;
                  newUser.facebook.token = accessToken;
                  newUser.facebook.name = profile.displayName;
               //    newUser.facebook.email = profile.emails[0].val;

                  newUser.save(function(err){
                      if(err)
                       throw err;
                      return done(null,newUser);
                        
                  })
              }

       })
   })
  }
));

//routes
app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { successRedirect: '/profile',
                                    failureRedirect: '/' }));


app.get('/profile',function(req,res){
                                        
 Log.find(function(err,users){
    if(err) throw err;
     res.render('profile.ejs',{user:users})
})
    //  res.send('logged in')
                                            
})
