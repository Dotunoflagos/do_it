// Start the loading animation
function loadr(a) {
  if (a == 1) {
    $(".loading-bar").html('<div class="loading-bar-progress"></div>');
  } else {
    // Stop the loading animation
    $(".loading-bar").empty();
  }
}

export { loadr }