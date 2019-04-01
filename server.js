var express = require("express");
// var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/ugandanews", { useNewUrlParser: true });

// Routes
app.get("/", (req, res) => {
  res.send(__dirname + "/public/index.html");
})
// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.newvision.co.ug/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".common-left.col-world > .list_content").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children(".list_discription")
        .children('h3')
        .children('a')
        .text();
      result.link = $(this)
        .children(".list_discription")
        .children('h3')
        .children('a')
        .attr("href");

      result.summary = $(this)
        .children(".list_discription")
        .children("p")
        .text();
      console.log(result)

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          //res.json(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(req.body)
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id }  });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      db.Article.find({_id:req.params.id })
      .populate('note')
      .then(dbArticle => {
        res.json(dbArticle);
      })
      .catch(err => {
        res.status(400).json(err);
      })
      
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      
    });
});

// Delete article note : /deleteArticle
app.delete("/deleteArticle", function (req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(req.body)
  db.Article
    .deleteOne({_id: req.body.articleId })
    .then(function () {
      // If we were able to successfully update an Article, send it back to the client
      db.Article.find({_id:req.body.articleId })
      .populate('note')
      .then(dbArticle => {
        res.json(dbArticle);
      })
      .catch(err => {
        res.status(400).json(err);
      })
      
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      console.log(err)
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.post("/saveArticle", function (req, res) {
  console.log(req.body)
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findByIdAndUpdate(req.body.id, { saved: true })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/savedArticles", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.find({ saved: true })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Delete article : /deleteNote
app.delete("/deleteArticle", function (req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(req.body)
  db.Note.deleteOne({_id: req.body.noteId })
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.body.articleId }, { $pull: { note: req.body.noteId }  });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      db.Article.find({_id:req.body.articleId })
      .populate('note')
      .then(dbArticle => {
        res.json(dbArticle);
      })
      .catch(err => {
        res.status(400).json(err);
      })
      
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      console.log(err)
    });
});



// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
