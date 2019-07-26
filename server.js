var express = require("express");
var logger = require("morgan");
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
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongohomework", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    $("article h2").each(function (i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });
  res.render("index");
})

app.get("/scrape", function (req, res) {
  
  db.Article.find({}).then(function (articles) {
    res.json(articles);
  }).catch(function (err) {
    res.json(err);
  })
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({}).then(function (articles) {
    res.json(articles);
  }).catch(function (err) {
    res.json(err);
  })
});

// Route for grabbing a specific Article by id, populate it with its note
app.get("/articles/:id", function (req, res) {
  
  db.Article.findOne({ _id: req.params.id }).populate("notes").then(function (article) {
    res.json(article);
  }).catch(function (err) {
    res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {

  db.Note.create(req.body).then(function (note) {
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: note._id } }, { new: true });
  }).then(function (article) {
    res.json(article);
  }).catch(function (err) {
    res.json(err);
  });
});

app.get("/saved", function(req, res){
  res.render("saved"); // create saved.handlebars file
});

app.get("/saved/articles", function(req, res){
  db.Article.find({saved: true}).then(function(articles){
    res.json(articles);
  }).catch(function(err){
    res.json(err);
  });
});

app.post("/saved/articles/:id", function(req, res){
  db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true } }, { new: true }).then(function(article){
    res.json(article);
  }).catch(function(err){
    res.json(err);
  });
});

app.get("/clear", function (req, res) {
  db.Article.remove().then(function (removed) {
    res.json(removed);
  }).catch(function (err) {
    res.json(err);
  });
})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
