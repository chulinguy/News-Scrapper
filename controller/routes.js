var request = requiree('request');
var cheerio = require('cherrio');
var Article = require("../models/Article.js");
var Note = require('../models/Note.js');

function findAll(cb) {
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      cb(doc);
    }
  });
}

function scrapeURL(req, res) {

  findAll((found)=> {
    request("https://www.gamespot.com/news/", function(error, response, html) {

      var $ = cheerio.load(html);
      $("article > a").each(function(i, element) {
        var result = {};
        result.link = $(element).attr('href');
        result.title = $(element).find('.media-title').text();
        result.headline = $(element).find('.media-deck').text();
        //only insert into DB if article number's index is less than 20 and it's not found in the DB
        if (i < 20 && !found.filter((v)=>(v.title === result.title))) {
          var entry = new Article(result);
          entry.save(function(err, doc) {
          // Log any errors
            if (err) {
              console.log(err);
            }
            // Or log the doc
            else {
              console.log(doc);
            }
          });
        }
      });
    });
  })
  res.send('Scrape Complete');
}

module.exports = (app, db) => {
  app.get('/', (req, res)=>{

  })

  app.get("/all", function(req, res) {
   findAll(res);
  });

  //logic doesn't seem right
  app.get("/scrape", function(req, res) {
    scrapeURL(req, res);
  })

  app.post('/new:title', function(req, res){
    var comment = new Note({
      //grab user input
      title: '',
      body: ''
    })
    comment.save((err, doc)=>{
      if (err) console.log(err);
      else {
        console.log(doc)
        Article.findOneAndUpdate({title:req.params.title},{
          $push: {"notes":doc._id}
        }, {new: true}, (err, newdoc)=>{
          if (err) res.send(err);
          else res.send(newdoc);
        })
      }
    })
  })

  app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

}