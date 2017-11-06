
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const flash = require('connect-flash');
const session = require('express-session');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));

app.use(flash());
app.use(session({secret:'abc'}));

const Log = require('./models/models');

var passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
var LocalStrategy = require('passport-local').Strategy;

 app.get('/',function(req,res){

    res.sendFile()
  
 })

app.get('/profile',function(req,res){

    // Log.find(function(err,users){
    //     if(err) throw err;
    //     res.render('profile.ejs',{user:users})
    // })

     res.send('logged in')
    
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

 //facebook strategy
 var FacebookStrategy = require('passport-facebook').Strategy;
 
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

 passport.serializeUser(function(user, done) {
    
     done(null, user.id);
   
 });
   
   passport.deserializeUser(function(id, done) {
 
     Log.findById(id, function(err, user) {
 
         done(err, user);
 
     });
    });

 //routes
 app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));

 app.get('/auth/facebook/callback',
 passport.authenticate('facebook', { successRedirect: '/profile',failureRedirect: '/' }));



app.listen(7000, (error) => {
    console.log("Listening on 7000");
})