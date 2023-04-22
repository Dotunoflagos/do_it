$(document).ready(function () {
  function move(id, direction, rate) {
    var imageWidth = 80;
    var imageSpacing = 25;
    var numImages = Math.floor($(window).width() / (imageWidth + imageSpacing)) + 3;
    var containerWidth = numImages * (imageWidth + imageSpacing) - imageSpacing;
    var currentPosition = 0;
    var speed = 1.5;

    // Set the width of the container
    $(id).width(containerWidth);

    // Add the images to the container
    for (var i = 0; i < numImages; i++) {
      var image = $("<img>").attr("src",`../static/images/DOIT.png?${i}`);
      image.css({
        "position": "absolute",
        "left": i * (imageWidth + imageSpacing),
        "top": "0px"
      });
      $(id).append(image);
    }

    // Move the images across the screen
    function moveLeft() {
      currentPosition -= speed;
      if (currentPosition < -imageWidth) {
        currentPosition += imageWidth + imageSpacing;
        $(`${id} img:last-child`).after($(`${id} img:first-child`));
      }
      $(id).css("left", currentPosition + "px");
    }

    function moveRight() {
      currentPosition += speed;
      if (currentPosition > 0) {
        currentPosition -= imageWidth + imageSpacing;
        $(`${id} img:first-child`).before($(`${id} img:last-child`));
      }
      $(id).css("left", currentPosition + "px");
    }

    const $element = $(id);

    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // If the element is in view, start moving right
        if (entry.isIntersecting) {
          if (direction == "R") {
            $element.data("intervalId", setInterval(moveRight, rate));
          } else if (direction == "L") {
            $element.data("intervalId", setInterval(moveLeft, rate));
          }
        } else {
          // If the element is out of view, stop moving
          clearInterval($element.data("intervalId"));
        }
      });
    });

    // Start observing the element
    observer.observe($element[0]);

  }
  move(".w1", "R", 25);
  move(".w2", "L", 15);
  move(".w3", "R", 19);
  move(".w4", "L", 20);

  move(".m1", "R", 25);
  move(".m2", "L", 15);
  move(".m3", "R", 19);
  move(".m4", "L", 20);

  $('.navbar-nav a[href^="#"]').on('click', function (event) {
    const target = $(this.getAttribute('href'));

    if (target.length) {
      event.preventDefault();
      $('html, body').stop().animate({
        scrollTop: target.offset().top
      }, 800);
    }
  });

  var timer;

  $(window).scroll(function () {
    //clearTimeout(timer);

    //timer = setTimeout(function () {
      var viewportTop = $(window).scrollTop();
      var viewportBottom = viewportTop + $(".navbar").height();

      $('#home, #about, .contactus, .pmov, .features').each(function () {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();

        //if (elementTop <= viewportBottom && elementBottom >= viewportTop) {
        //console.log(`elementTop: ${elementTop} <= viewportTop: ${viewportTop} && elementBottom: ${elementBottom} >= viewportBottom: ${viewportBottom}`);
        if (elementTop <= viewportTop + 25.9375 && elementBottom  + 25.9375 >= viewportBottom) {
          let bgc = $(this).css("background-color")
          if ( bgc == "rgba(0, 0, 0, 0)") {
            $(".nav-link").css("color", "rgb(0 0 0 / 50%)")
            $(".navbar-dark .navbar-nav .active>.nav-link").css("color", "Black")
          } else {
            $(".nav-link").css("color", "rgba(255,255,255,.5)")
            $(".navbar-dark .navbar-nav .active>.nav-link").css("color", "white")
          }
        }
      });
    //}, 200); // delay the execution by 200 milliseconds
  });

});
