var passport          = require("passport"),
    GoogleStrategy    = require('passport-google-oauth20').Strategy,
    User              = require("../models/user.js"),
    mongoose          = require("mongoose")
    googleKey         = require("../config/keys.js"),
 
mongoose.connect("mongodb://localhost/event_data",{ useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true });

function passportSetup(app,Id){ 

app.use(require("express-session")({ 
    secret : "Any Secret",
    resave: false,
    saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user,cb){
     cb(null,user)
});
passport.deserializeUser(function(obj,cb){ 
    cb(null,obj)
});
passport.use(new GoogleStrategy({
    clientID     : googleKey.clientID,
    clientSecret : googleKey.clientSecret,
    callbackURL  : "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    Id.value = profile.id;
     User.findOne({googleId : profile.id},function(err,found){ 
         if(found === null){ 
            User.create({ 
                googleId : profile.id
          })
         }else{ 

         }

     })   


    return cb(null, profile);

  }
));

}
module.exports = passportSetup;


