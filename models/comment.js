// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// make CommentSchema a Schema
var CommentSchema = new Schema({
  // commenter: just a string
  commenter: {
    type: String
  },
  // comment: just a string
  comment: {
    type: String
  }
});

// NOTE: the comment's id is stored automatically
// Our News model will have an array to store these ids

// Create the Comment model with the CommentSchema
var Comment = mongoose.model("Comment", CommentSchema);

// Export the model so we can use it on our server file.
module.exports = Comment;