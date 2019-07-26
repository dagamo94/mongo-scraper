const articlesElem = $("#articles");
const savedArticlesElem = $("#saved-articles");

let goToSaved = false;
let savedArticles;
$(".scrape-new").click(function (event) {
  location.reload();
  articlesElem.empty();
  renderArticles();
})

$(".clear").click(function (event) {
  articlesElem.empty();
  $.getJSON("/clear", function () {
    articlesElem.append("<p>CLEARED ALL ARTICLES</p>");
  })
});


$(document).on("click", ".comment", function () {
  // Empty the notes from the note section
  $("#comments").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      $("#comments").append("<h2>" + data.title + "</h2>");
      $("#comments").append("<input id='titleinput' name='title' >");
      $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#comments").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      if (data.notes) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.notes[0].title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.notes[0].body);
      }
    });
});

$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).ready(function () {
  renderArticles();
  renderSavedArticle();
});

// WHEN SAVED IS CLICKED
$(document).on("click", ".save", function(){
  let savedId = $(this).attr("data-id");
  // alert($(this).attr("data-id"));
  alert(savedId);
  $(this).parent().parent().hide();
  $.post("/saved/articles/" + savedId, function(article){
    console.log(article);
  })
});

// WHEN UNSAVE IS CLICKED
$(document).on("click", ".unsave", function(){
  let savedId = $(this).attr("data-id");
  // alert($(this).attr("data-id"));
  alert(savedId);
  $(this).parent().parent().hide();
  $.post("/saved/articles/unsave/" + savedId, function(article){
    console.log(article);
  })
});

// RENDERING TO PAGE FUNCTIONS
function renderArticles() {
  $.getJSON("/scrape", function (data) {
    savedArticles = data;
    if (data.length) {
      for (var i = 0; i < data.length; i++) {
        if (!data[i].saved) {
          // Display the apropos information on the page
          articlesElem.append("<div class='card bg-dark'><div class='card-body'><h2 class='card-text' data-id='" + data[i]._id + "'>" + data[i].title + "</h2><a href='" + data[i].link + "' target='_blank'><p>" + data[i].link + "</p></a><a class='btn btn-primary save' data-id='" + data[i]._id + "'>Save</a></div></div>");
        }
      }
    }
  });
}

function renderSavedArticle() {
  $.getJSON("/saved/articles", function (data) {
    savedArticles = data;
    for (var i = 0; i < data.length; i++) {
      if (data[i].saved) {
        // Display the apropos information on the page
        savedArticlesElem.append("<div class='card bg-dark'><div class='card-body'><h2 class='card-text' data-id='" + data[i]._id + "'>" + data[i].title + "</h2><a href='" + data[i].link + "'><p>" + data[i].link + "</p></a><a class='btn btn-primary unsave' data-id='" + data[i]._id + "'>Unsave</a><a  class='btn btn-primary comment' data-id='" + data[i]._id + "'>Add a comment</a></div></div>");
      }
    }
  });
}