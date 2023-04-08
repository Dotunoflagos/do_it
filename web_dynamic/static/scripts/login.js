$(() => {
  if (localStorage.hasOwnProperty("user")) {
    const emailval = JSON.parse(localStorage.getItem('user')).email;
    if (emailval) {
      $('#email').val(emailval);
    }
  }
  const linkbody = 'http://127.0.0.1:5001/api/v1'
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
        var myJSON = JSON.stringify(response);
        //save response
        localStorage.setItem('user', myJSON)
        let jsonData = localStorage.getItem('user');
        let data = JSON.parse(jsonData);
        let id = data.user.id;
        //get base url
        const baseUrl = window.location.origin;
        const link = baseUrl + "/dashboard/" + id
        //redirect after 3sec
        message.css('color', 'green');
        message.text('Logging in...');
        setTimeout(function () {
          window.location = link;
        }, 800);
        //console.log(response);
      },
      error: function (xhr, textStatus, errorThrown) {
        // handle error response
        alert(xhr.responseJSON.error);
      }
    });
  });
});