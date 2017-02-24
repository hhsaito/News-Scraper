// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Mongoose mpromise deprecated - use bluebird promises
var Promise = require("bluebird");
// Require request and cheerio. This makes the scraping possible
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

// Main route (simple Hello World Message)
app.get("/", function(req, res) {

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
          // or send the doc to our browser
          else {
            console.log(doc);
          }
        });
      }
    });
  });
  // This will send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as a json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
