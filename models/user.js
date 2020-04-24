var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
// setting schema for User's data
var userSchema = new mongoose.Schema({ 
   googleId : String,
   events :[ { event:[{body:String,title:String}], date:Date } ]
})

// exporting User model
module.exports = mongoose.model("User",userSchema)
