var express           = require("express"),   // importing express module
    mongoose          = require("mongoose"),  // importing mongoose module
    device            = require('express-device'),
    bodyParser        = require("body-parser"), // importing body-parser module
    User              = require("./models/user.js"),  // importing User model 
    passportSetup     = require("./services/passportSetup.js"), // importing passportSetup
    authRoutes        = require("./services/authRoutes.js"),  // importing authentication Routes
    app               = express();

    app.use(device.capture());

    

var Id = {value:""};      // store user profile id in an object
var matchedEvent = "";    
var dateOfEmail = ""; 
var toShowOnSend = "";
var toShowOnEdit = "";
app.use(bodyParser.urlencoded({extended:true}))

// connecting mongoose
mongoose.connect("mongodb://localhost/event_data",{ useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true });
// calling passportSetup function 
passportSetup(app,Id);


 // authentication routes

authRoutes(app);

// middleware function that checks if user is logged in or not
function isLoggedIn(req,res,next){ 

    if(req.isAuthenticated()){ 
        return next();
    } 
        res.redirect("/auth/google")
}


// get route for home page 
app.get("/",function(req,res){ 
    res.render("home.ejs",{isLoggedIn : req.isAuthenticated()})
})


 // route for showing user's event
app.get("/showMyEvents",isLoggedIn,function(req,res){ 
        // finding user with google Id == Id.value
    User.findOne({googleId : Id.value},function(err,found){ 
        
        if(err){ 
            console.log(err);
            res.redirect("/");
        }else{ 
            if(found == null){ 
                res.render("showMyEvents.ejs",{f:""})
            }else{ 
            res.render("showMyEvents.ejs",{f:found})
            }
          
        }
    })
  })
 // route for adding a new event
app.get("/addEvent",isLoggedIn,function(req,res){ 
    res.render("addEvent.ejs",{toFill:false})
})
// post route for addEvent , this will be triggered when user will add a new Event
app.post("/addEvent",function(req,res){
    
      if(req.body.title == ""|| req.body.body == ""|| req.body.date == ""){ 
            res.render("addEvent.ejs",{toFill:true})
      }else{ 
                  // finding user with google Id == Id.value
      User.findOne({googleId : Id.value},function(err,found){ 
          
          if(err){ 
              console.log(err);
              res.redirect("/showMyEvents")
          }else{ 
              
    // if there is no event and user will add an event, it will create an element
       if(found.events.length == 0){ 
        found.events[found.events.length] ={event:[{body:req.body.body,title:req.body.title}], date:req.body.date};
       }else{ 
   // if there are already events , then we will check if date of event matches with date of any event,
   // if it does , we will push an element in event array of events having same date, but if it does
   // not match , we will create a new element in events array
        for(var i = 0;i<found.events.length;i++){ 
            
            if(new Date(found.events[i].date).toLocaleDateString() == new Date(req.body.date).toLocaleDateString() ){ 
                  matchedEvent = found.events[i];
            }
        }
        if(matchedEvent == ""){ 
            found.events[found.events.length] ={event:[{body:req.body.body,title:req.body.title}], date:req.body.date};
       }else{ 
           matchedEvent.event.push({ 
               body : req.body.body,
               title: req.body.title
           })
       } 
       }
     //saving the user's info 
       found.save().then(()=>{ 
           // redirecting back to showMyEvents
        res.redirect("/showMyEvents");
        matchedEvent = ""
       });
    
          }
        
      })
    }
})
// route for delete an event 
app.get("/delete/:id",isLoggedIn,function(req,res){ 
  // finding user with google Id == Id.value
        User.findOne({googleId : Id.value},function(err,found){ 
            if(err){ 
                console.log(err);
                res.redirect("/showMyEvents")
            }else{ 
                // finding that event in event array whose id matches with req.params.id and removing it
                for(var i = 0;i<found.events.length;i++){ 
                    for(var k = 0;k<found.events[i].event.length;k++){
                              if(found.events[i].event[k]._id == req.params.id){ 
                                  found.events[i].event[k].remove();
                              }
                    }
                }
                //saving the user's info
                found.save().then(()=>{ 
                    res.redirect("/showMyEvents")
                });
                
               
            }
        })
})


 
//route for edit any event
app.get("/edit/:id",isLoggedIn,function(req,res){ 
      // finding user with google Id == Id.value

    User.findOne({googleId:Id.value},function(err,found){ 
             if(err){ 
                 console.log(err);
             }else{ 
            // finding that event in event array whose id matches with req.params.id and rendering
            //  its info on edit page 

                 for(var i = 0;i<found.events.length;i++){ 
                     for(var k = 0;k<found.events[i].event.length;k++){ 
                         if(found.events[i].event[k]._id == req.params.id){ 
                              toShowOnEdit = found.events[i].event[k]
                             res.render("edit.ejs",{f:found.events[i].event[k],toFill : false})
                         }
                     }
                 }
             }
    })
})
// post route for editing of any event
app.post("/edit/:id",function(req,res){ 
   
 // if user left fields empty , we will redirect it to  edit page with a message
 // "please fill all the details"
    if(req.body.body.trim() == "" || req.body.title.trim() == ""){ 
            res.render("edit.ejs",{f:toShowOnEdit,toFill:true})
    }else {
              // finding user with google Id == Id.value

     User.findOne({googleId : Id.value},function(err,found){ 

               if(err){ 
                   console.log(err);
               }else{ 

                // finding that event in event array whose id matches with req.params.id and changing
               //  its event title and detail
                   for(var i = 0;i<found.events.length;i++){ 
                     for(var k = 0;k<found.events[i].event.length;k++){ 
                         if(found.events[i].event[k]._id == req.params.id){ 
                             found.events[i].event[k] = {body : req.body.body,title:req.body.title}
                         }
                     }


                   }
                   found.save().then(()=>{ 
                    res.redirect("/showMyEvents")
                   });
                   
               }

     }) 
    }

})

// get route for sending any event
app.get("/send/:id",isLoggedIn,function(req,res){
          // finding user with google Id == Id.value
    if(req.device.type == "desktop"){
    User.findOne({googleId:Id.value},function(err,found){ 
        if(err){ 
            console.log(err);
            res.redirect("/showMyEvents")
        }else{ 
            // finding that event in event array whose id matches with req.params.id and 
            // rendering its info on send page

            for(var i = 0;i<found.events.length;i++){ 
                for(var k = 0;k<found.events[i].event.length;k++){ 
                    if(found.events[i].event[k]._id == req.params.id){ 
                        dateOfEmail = found.events[i].date.toDateString();
                        toShowOnSend = found.events[i].event[k]
                        res.render("send.ejs",{toFill:false,f:found.events[i].event[k]});
                    }
                }
            }
        }
})
    } else{
        res.redirect("https://mail.google.com/mail/mu/mp/873/#co")

    }
})


app.post("/send",function(req,res){ 
    
// if user left fields empty , we will redirect it to  send page with a message
 // "please fill all the details"
if(req.body.title == ""|| req.body.body == ""|| req.body.email==""){
           res.render("send.ejs",{toFill:true,f:toShowOnSend})
   }
   else{ 
    if(req.device.type == "desktop"){ 
        res.redirect("https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=" + req.body.email +"&body=on " + dateOfEmail +", " + req.body.body+"&su="+req.body.title);  
        } else{ 
            res.redirect("https://mail.google.com/mail/mu/mp/873/#co/to="+   req.body.email)
        }

}
})
// logging out user and logging it with different email id
app.get("/log",function(req,res){ 
    req.session.destroy(function(e){
        req.logout();
        res.redirect('/auth/google');
        
    });
})


// logging out user
app.get('/logout', function(req, res) {
    req.session.destroy(function(e){
        req.logout();
        res.redirect('/');
        
    });
});

// setting up port number for our app
let port = 200;

app.listen(port,function(){ 
    console.log("server started on port " + port)
})

