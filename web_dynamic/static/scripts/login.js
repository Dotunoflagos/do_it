import { baseUrl } from './apilnk.js';
import { loadr } from './loader.js';

$(() => {
  if (localStorage.hasOwnProperty("user")) {
    const emailval = JSON.parse(localStorage.getItem('user')).email;
    if (emailval) {
      $('#email').val(emailval);
    }
  }
  //const linkbody = 'http://127.0.0.1:5001/api/v1'
  const linkbody = baseUrl
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
    //Start loader
    message.text("");
    loadr(1);
    // send a POST request to the server with the form data
    $.ajax({
      url: link,
      dataType: 'json',
      type: 'POST',
      async: false,
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
        const link = "/dashboard/" + id
        //redirect after 3sec
        //loadr(1);
        message.css('color', 'green');
        message.text('Logging in...');
        setTimeout(function () {
          loadr();
          window.location = link;
        }, 1000);
        //console.log(response);
      },
      error: function (xhr, textStatus, errorThrown) {
        // handle error response
        //alert(xhr.responseJSON.error);
        let t
        if (xhr.responseJSON) {
          t = 1000
        } else {
          t = 6000
        }
        setTimeout(function () {
          loadr();
          message.css('color', 'red');
          if (xhr.responseJSON) {
            message.text(xhr.responseJSON.error);
          } else {
            message.text("Check your internet connection");
          }
        }, t);
      }
    });
    //End loader
    //loadr();
  });
});