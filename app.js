
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

const Log = require('./models/models');//require Model

var passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
var LocalStrategy = require('passport-local').Strategy;

 app.get('/',function(req,res){

     res.sendFile('/Users/bititude/mongo_study/public/index.html');

 })

 var validPassword = function(password,dbpass){
    if(password===dbpass){
         return true;
    }

return false; 

}

 passport.use(new LocalStrategy(
    
        function(username, password, done) {
    
            Log.findOne({ username: username }, function(err, user) {
    
                if (err) { return done(err); }
    
                if (!user) {             
                //  console.log('Incorrect username')
    
                return done(null, false, { message: 'Incorrect username.' });
             }
    
             if (!validPassword(password,user.password)) {          
    
                return done(null, false, { message: 'Incorrect password.' });         
            }
    
            return done(null, user);    
    
         });
    
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
    
      app.get('/logged_in',function(req,res){
    
        //res.send('Logged in');
          res.render('user_app',{})
    
        })

  
      app.post('/login',
       passport.authenticate('local', { successRedirect: '/logged_in',
                                       failureRedirect: '/',
                                       failureFlash: true })
    );

    app.get('/logout',function(req,res){
        
            req.logout();
            res.redirect('/');
        
        })



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
//end goole_strat

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
                                            
})//end facebook


//Github authentication
var GitHubStrategy = require('passport-github').Strategy;

//Configure
passport.use(new GitHubStrategy({
    clientID: '23780cbfb0e397b3ee67',
    clientSecret: 'debdc6ac8958681ced9f53144ab1783a76179841',
    callbackURL: "http://localhost:7000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    Log.findOne({ githubId: profile.id }, function (err, user) {
      if(err) 
      return done(err);
    if(user) 
       return done(null,user);
       else{
           var newUser = new Log();
           newUser.github.githubId = profile.id;
           newUser.save(function(err){
               if(err)
                throw err;
               return done(null,newUser);
                 
           })
       }
    });
  }
));

app.get('/auth/github',
passport.authenticate('github'));

app.get('/auth/github/callback', 
passport.authenticate('github', { failureRedirect: '/' ,successRedirect:'/profile'}));
//end github auth


    app.listen(7000, (error) => {
        console.log("Listening on 7000");
    })