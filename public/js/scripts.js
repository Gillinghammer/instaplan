$(function() {
  console.log("world!")

  // grab username text
  $("#subscribe").on("click", function() {
    var userName = $('#username').val();
    console.log("username: ", userName);

    lookUpUser(userName);
  });
});

lookUpUser = function(userName) {
  $.ajax({
        url: "https://api.instagram.com/v1/users/search?q=" + userName + "&access_token=5391092257.f354d0e.19e6f60f848a4fabb92b2aeb5afeaf45",
        error: function() {
          alert('error');
        },
        success: function(data) {
        subscribeToUser(data.data[0]);
        },
        type: 'GET',
        dataType: "jsonp"
     });

}

subscribeToUser = function(user) {
  console.log("user passed to subscribe ", user)
  console.log(user.id)

  $.post("https://api.instagram.com/v1/subscriptions/",
    { verify_token: 'charmander',
      client_id: 'f354d0ea817643559a11a06a7c905264',
      client_secret: 'cee7bf9981bc438d8b0a8dc168a1cbae',
      object: 'user',
      object_id: user.id,
      aspect: 'media',
      callback_url: '/cb'
     } , function(data){
          console.log(data);
      }, 'jsonp')
      .done(function(result){
          console.log("posted ", result);
      })
      .fail(function(err){
          console.error(err);
      });

}