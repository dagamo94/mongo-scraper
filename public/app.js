var articlesElem = $("#articles");
$(".scrape-new").click(function(event){
  articlesElem.empty();
  renderArticles();
})

$(".clear").click(function(event){
  location.reload();
  articlesElem.empty();
  $.getJSON("/clear", function(){
    articlesElem.append("<p>CLEARED ALL ARTICLES</p>");
  })
});


$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      $("#notes").append("<h2>" + data.title + "</h2>");
      $("#notes").append("<input id='titleinput' name='title' >");
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

$(document).on("click", "#savenote", function() {
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
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).ready(function(){
  renderArticles();
});

function renderArticles(){
  $.getJSON("/scrape", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      if(!data[i].saved){
        // Display the apropos information on the page
        articlesElem.append("<div class='card bg-dark'><div class='card-body'><h2 class='card-text' data-id='" + data[i]._id + "'>" + data[i].title + "</h2><a href='"+ data[i].link +"'><p>" + data[i].link + "</p></a><a class='btn btn-primary save'>Save</a></div></div>");
      }
    }
  });
}

function renderSavedArticle(){
  $.getJSON("/scrape", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      if(data[i].saved){
        // Display the apropos information on the page
        articlesElem.append("<div class='card bg-dark'><div class='card-body'><h2 class='card-text' data-id='" + data[i]._id + "'>" + data[i].title + "</h2><a href='"+ data[i].link +"'><p>" + data[i].link + "</p></a><a class='btn btn-primary unsave'>Unsave</a><a href='#' class='btn btn-primary comment'>Add a comment</a></div></div>");
      }
    }
  });
}