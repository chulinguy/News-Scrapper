var express = require("express");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var logger = require("morgan");

// Initialize Express
var app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static("public"));

// Database configuration
var databaseUrl = "news-scraper";
mongoose.Promise = Promise;
mongoose.connect(`mongodb://127.0.0.1/${databaseURL}`);
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Database Error:", error);
});
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

require("./controller/routes.js")(app, db)

// Listen on port
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("App running on port 3000!");
});
