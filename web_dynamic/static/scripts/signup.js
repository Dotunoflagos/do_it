$(() => {
  const linkbody = 'http://172.29.67.181:5001/api/v1'
  $('.eye').mousedown(function () {
    $('#password').attr('type', 'text');
  }).mouseup(function () {
    $('#password').attr('type', 'password');
  }).mouseout(function () {
    $('#password').attr('type', 'password');
  });

  let message = $('.sesionmsg p')

  $('#form').submit(function (event) {
    // prevent default form submission behavior
    event.preventDefault();

    // collect form data into an object
    const formData = $(this).serializeArray();
    let link = linkbody + $(this).attr('action');
    let jsonData = {};

    $.each(formData, function () {
      if (jsonData[this.name]) {
        if (!jsonData[this.name].push) {
          jsonData[this.name] = [jsonData[this.name]];
        }
        jsonData[this.name].push(this.value || '');
      } else {
        jsonData[this.name] = this.value || '';
      }
    });


    // send a POST request to the server with the form data
    $.ajax({
      url: link,
      dataType: 'json',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(jsonData),
      success: function (response) {
        // handle success response
        // Convert object to JSON string
        var myJSON = JSON.stringify(response);
        //save response
        localStorage.setItem('user', myJSON)
        //get base url
        const baseUrl = window.location.origin;
        //redirect after 3sec
        message.css('color', 'green');
        message.text('Account created redirecting...');
        setTimeout(function () {
          window.location.href = baseUrl + "/login/";
        }, 3000);
        //console.log(JSON.parse(localStorage.getItem('user')).email);
      },
      error: function (xhr, textStatus, errorThrown) {
        // handle error response
        let error = xhr.responseJSON.error;
        message.css('color', 'red');
        message.text(error);
      }
    });
  });
});
