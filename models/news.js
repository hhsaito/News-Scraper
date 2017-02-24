// Require mongoose
var mongoose = require('mongoose');

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// Make NewsSchema a Schema
var NewsSchema = new mongoose.Schema({
  title: {
    type: String
  },
  link: {
  	type: String
  },
  // comments is an array that stores ObjectIds
  // The ref property links these ObjectIds to the Commment model
  // This will let us populate the News with these comments, rather than the ids,
  // using Mongoose's populate method (See the routes in Server.js)
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

// Save the Library model using the LibrarySchema
var News = mongoose.model("News", NewsSchema);

module.exports = News;