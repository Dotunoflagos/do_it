$(() => {
  const input = $("ul li input[type='checkbox']")
  const search = $("div.amenities h4")
  let variable = []
  let searval = []
  //jquery
  input.on("click", (e) => {
    let data = e.target
    if (data.checked == true) {
      variable.push(data.attributes['data-id'].value)
      searval.push(data.attributes['data-name'].value)
    } else {
      variable = variable.filter((val) => {
        if (val != data.attributes['data-id'].value) {
          return true
        }
      })
      searval = searval.filter((val) => {
        if (val != data.attributes['data-name'].value) {
          return true
        }
      })
    }
    search.text(searval.join(', '))
  })

  $.ajax('http://0.0.0.0:5001/api/v1/status').done(function (data) {
    if (data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
})