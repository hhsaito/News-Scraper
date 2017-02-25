// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var logger = require("morgan");
var mongoose = require("mongoose");
// Mongoose mpromise deprecated - use bluebird promises
var Promise = require("bluebird");

var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

// Bring in our Models: Book and Library
var Comment = require("./models/comment.js");
var News = require("./models/News.js");

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newsscraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes =============================================================

//require("./routes/html-routes.js")(app);
//require("./routes/api-routes.js")(app);


// Retrieve data from the db
app.get("/", function(req, res) {
  
  News.find({}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // // Or send the doc to the browser
    else {
      //res.send(doc);
      var hbsObject = { news: doc };
      console.log(hbsObject);
      res.render("index", hbsObject);
    }
  });
});
// Route to see what user looks like without populating

app.get("/articles", function(req, res) {
  // Find all users in the user collection with our User model
  News.find({}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {
      var hbsObject = { news: doc };
      console.log(hbsObject);
      res.render("articles", hbsObject);
    }
  });
});
// New note creation via POST route
app.post("/submit", function(req, res) {
  // empty collection
  News.remove({}, function(err) { 
     console.log('collection removed') 
  });
  // Make a request for the news from ARS Technica
  request("https://arstechnica.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $(".tease").each(function(i, element) {
      // Save the text of each link enclosed in the current element
      var title = $(this).find("h2 a").text();
      console.log(title);
      // // Save the href value of each link enclosed in the current element
      var link = $(this).find("h2 a").attr("href");
     console.log(link);
      // // If this title element had both a title and a link
      if (title && link) {
        var scrapedNews = new News({
          title: title,
          link: link
        });
        // Save the data in the scrapedNews db
        scrapedNews.save(function(error, doc) {
          // send an error to the browser
          if (error) {
            res.send(error);
          }
          else {
            console.log(doc);
          }
        }); 
      }
    });
  });
 res.redirect("/");
});

app.put("/:id", function(req, res) {

  News.findOneAndUpdate({_id: req.params.id}, {$set:{saved: true}}, {upsert: true}, function(err, doc){
    if(err){
        console.log("Error: ", err);
    }
    else {
      //res.send(doc);
      res.redirect("/");
    }
  });
});
app.put("/delete/:id", function(req, res) {
  
  News.findOneAndUpdate({_id: req.params.id}, {$set:{saved: req.params.saved}}, {upsert: true}, function(err, doc){
    if(err){
        console.log("Error: ", err);
    }
    else {
      //res.send(doc);
      res.redirect("/articles");
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
