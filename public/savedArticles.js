$(document).ready(function () {

    $.getJSON("/savedArticles", function (data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            var newsArticle = `
                  <div class="col-md-12">
                    <div class="card" >
                      <div class="card-body">
                        <h5 class="card-title"> <a href="https://www.newvision.co.ug${data[i].link}" target="_blank">${data[i].title}</a></h5>
                        <p class="card-text">${data[i].summary}</p>
                        <a href="#" data-id="${data[i]._id}" class="btn btn-primary singleArticle">Article Notes</a>
                        <a href="#" article-id="${data[i]._id}" class="btn btn-danger deleteArticle">Delete Article</a>
                      </div>
                    </div>
                  </div>
            
            `;
            $("#savedArticlesSection").append(newsArticle);
            //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        }
    });

    $(document).on("click", ".singleArticle", function () {

        // Empty the notes from the note section
        $("#notes").empty();
        // Save the id from the p tag
        var thisId = $(this).attr("data-id");
        console.log(thisId)
        // Now make an ajax call for the Article
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {
                $('#showModal').click()
                console.log(data);

                var noteSection = `
                  <div class="col-md-12">
                    <div class="card" >
                      <div class="card-body">
                        <h5 class="card-title">${data.title}</h5>
                        <div id="comments"></div>                           
                        <div class="form-group">
                          <label for="bodyinput">Comment</label>
                          <textarea id='bodyinput' class='form-control' name='body' rows="3"></textarea>
                        </div>
                        <button class='btn btn-success' data-id='${data._id}' id='savenote'>Save Note</button>
      
                      </div>
                      
                    </div>
                  </div>
            `;

                $("#notes").append(noteSection);
                data.note.forEach(e => {
                    let comment = `
                    <div class='row commentSection'>
                        <div class='col-md-9'><p>${e.body}</p></div>
                        <div class='col-md-3'><button article-id='${data._id}' data-id='${e._id}' class='btn btn-danger deleteNote'>x</button></div>
                    </div>
                `;
                    $("#comments").append(comment);
                });

                // If there's a note in the article
                if (data.note) {
                    // Place the title of the note in the title input
                    $("#titleinput").val(data.note.title);
                    // Place the body of the note in the body textarea
                    $("#bodyinput").val(data.note.body);
                };

                $("#showModal").trigger("click");



            });
    });


    // When you click the savenote button
    $(document).on("click", "#savenote", function () {
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("data-id");
        console.log(thisId)

        // Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
                // Empty the notes section
                $("#comments").empty();
                data[0].note.forEach(e => {

                    let comment = `
                        <div class='row commentSection'>
                            <div class='col-md-9'><p>${e.body}</p></div>
                            <div class='col-md-3'><button article-id='${thisId}' data-id='${e._id}' class='btn btn-danger deleteNote'>x</button></div>
                        </div>
                    `;

                    $("#comments").append(comment);

                });
            });

        // Also, remove the values entered in the input and textarea for note entry
        $("#titleinput").val("");
        $("#bodyinput").val("");
    });

    // Delete note
    $(document).on("click", ".deleteNote", function () {
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("data-id");
        var articleId = $(this).attr("article-id");
        console.log("thisId", thisId)
        console.log("articleId", articleId)


        //Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "DELETE",
            url: "/deleteNote",
            data: {
                noteId: thisId,
                articleId: articleId
            }

        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
                // Empty the notes section
                $("#comments").empty();
                // loop
                data[0].note.forEach(e => {
                    let comment = `
                    <div class='row commentSection'>
                        <div class='col-md-9'><p>${e.body}</p></div>
                        <div class='col-md-3'><button article-id='${articleId}' data-id='${e._id}' class='btn btn-danger deleteNote'>x</button></div>
                    </div>
                `;

                    $("#comments").append(comment);
                });
            });

        // Also, remove the values entered in the input and textarea for note entry
        $("#titleinput").val("");
        $("#bodyinput").val("");
    });


    $(document).on("click", ".deleteArticle", function () {
        // Grab the id associated with the article from the submit button

        var articleId = $(this).attr("article-id");
        console.log("articleId", articleId)


        //Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "DELETE",
            url: "/deleteArticle",
            data: {
                articleId: articleId
            }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
                // Empty the notes section
                location.reload()
            });
    });




});