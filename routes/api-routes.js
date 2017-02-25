var News = require("../models/News.js");

// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

module.exports = function(app) {
  // Main route (load db)
  app.get("/", function(req, res) {
    // Make a request for the news from ARS Technica
    request("https://arstechnica.com/", function(error, response, html) {
      // Load the html body from request into cheerio
      var $ = cheerio.load(html);
      // For each element with a "title" class
      $(".tease").each(function(i, element) {
        // Save the text of each link enclosed in the current element
        var title = $(this).find("h2 a").text();
        //console.log(title);
        // // Save the href value of each link enclosed in the current element
        var link = $(this).find("h2 a").attr("href");
       // console.log(link);
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
              res.render("index");
            }
          }); 
        }
      });
    });
    // This will send a "Scrape Complete" message to the browser
   // res.send("Scrape Complete");
  });

  // New note creation via POST route
  app.post("/submit", function(req, res) {

    News.find({}, function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or send the doc to the browser
      else {
        res.send(doc);
      }
    });
    // // Find all results from the scrapedData collection in the db
    // News.find({}, function(error, found) {
    //   // Throw any errors to the console
    //   if (error) {
    //     console.log(error);
    //   }
    //   // If there are no errors, send the data to the browser as a json
    //   else {
    //     var hbsObject = { news: found };
    //     console.log(hbsObject);
    //     res.render("index", hbsObject);
    //   }
    // });
  });




  // // Save the new note to mongoose
  // newNote.save(function(error, doc) {
  //   // Send any errors to the browser
  //   if (error) {
  //     res.send(error);
  //   }
  //   // Otherwise
  //   else {
  //     // Find our user and push the new note id into the User's notes array
  //     User.findOneAndUpdate({}, { $push: { "notes": doc._id } }, { new: true }, function(err, newdoc) {
  //       // Send any errors to the browser
  //       if (err) {
  //         res.send(err);
  //       }
  //       // Or send the newdoc to the browser
  //       else {
  //         res.send(newdoc);
  //       }
  //     });
  //   }
  // });
};