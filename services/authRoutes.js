var passport = require("passport")
function authRoutes(app){ 
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  function(req, res,next) {
    res.redirect("/showMyEvents");
  });
}

module.exports = authRoutes;