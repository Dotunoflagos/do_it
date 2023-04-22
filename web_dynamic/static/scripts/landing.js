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
      var image = $("<img>").attr("src", "../static/images/DOIT.png").attr("class", "movers");
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
        clearInterval($element.data("intervalId"));
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
  const slides = [
    [".w1", "R", 25],
    [".w2", "L", 15],
    [".w3", "R", 19],
    [".w4", "L", 20],
    [".m1", "R", 25],
    [".m2", "L", 15],
    [".m3", "R", 19],
    [".m4", "L", 20],
  ]

  function slide(arr) {
    arr.forEach((line) => {
      move(...line)
    })
  }

  var previousWidth = $(window).width();
  slide(slides);
  $(window).on('resize', function () {
    var currentWidth = $(window).width();
    // Check if only the window width has changed
    if (currentWidth !== previousWidth && $(window).height() === $(window).outerHeight()) {
      // Remove all elements with the class "movers"
      $('.movers').remove();

      // Call the slide function passing in the "slides" variable
      slide(slides);
    }

    previousWidth = currentWidth;
  });

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
      if (elementTop <= viewportTop + $(".navbar").height()/*+ 25.9375*/ && elementBottom /*+ 25.9375*/ >= viewportBottom) {
        let bgc = $(this).css("background-color")
        if (bgc == "rgba(0, 0, 0, 0)" || bgc == "rgb(138, 43, 226)") {
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
