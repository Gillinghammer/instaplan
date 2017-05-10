$(function() {
  console.log("ola world!")
  $('#checkboxes').click(function() {
    if($('#homebase_question').prop('checked')) {
      $("input#home_base").removeAttr("disabled");
    } else {
      $("input#home_base").attr("disabled", true);
      $("input#home_base").val("");
    }
    if($('#current_question').prop('checked')) {
      $("input#current_trip").removeAttr("disabled");
    } else {
      $("input#current_trip").attr("disabled", true);
      $("input#current_trip").val("");
    }
  });
});
