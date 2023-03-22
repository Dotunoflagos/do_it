$(() => {
  const input = $("ul li input[type='checkbox']")
  const input2 = $("section.filters > div.locations > div > ul > input[type=checkbox]")
  const search = $("div.amenities h4")
  let amenities = []
  let state = []
  let searval = []
  //jquery
  input.on("click", (e) => {
    let data = e.target
    if (data.checked == true) {
      amenities.push(data.attributes['data-id'].value)
      searval.push(data.attributes['data-name'].value)
    } else {
      amenities = amenities.filter((val) => {
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

  input2.on("click", (e) => {
    let data = e.target
    if (data.checked == true) {
      state.push(data.attributes['data-id'].value)
      searval.push(data.attributes['data-name'].value)
    } else {
      state = state.filter((val) => {
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
  function ud(val) {
    if (val == undefined) {
      return ""
    } else {
      return val
    }
  }
  const arr = {};
  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:5001/api/v1/places_search",
    data: "{}",
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
  }).done(function (data) {
    for (const place of data) {
      const template =
        `
      <article>
	  <div class="title_box">
	    <h2>${ud(place.name)}</h2>
	    <div class="price_by_night">$${ud(place.price_by_night)}</div>
	  </div>
	  <div class="information">
	    <div class="max_guest">${ud(place.max_guest)} Guest</div>
      <div class="number_rooms">${ud(place.number_rooms)} Bedroom</div>
      <div class="number_bathrooms">${ud(place.number_bathrooms)} Bathroom</div>
	  </div>
	  <div class="user">
            <b>Owner:</b> ${ud(place.user.first_name)} ${ud(place.user.last_name)}
          </div>
          <div class="description">
	    ${ud(place.description)}
          </div>
	</article>
      `;
      $('section.places').append(template);
    }
  });

  $(".filters button").click(() => {
    $.ajax({
      type: "POST",
      url: "http://127.0.0.1:5001/api/v1/places_search",
      data: JSON.stringify({ amenities: amenities, state: state }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
    }).done((data) => {
      $('section.places').empty();
      for (const place of data) {
        const template =
          `
      <article>
	  <div class="title_box">
	    <h2>${ud(place.name)}</h2>
	    <div class="price_by_night">$${ud(place.price_by_night)}</div>
	  </div>
	  <div class="information">
	    <div class="max_guest">${ud(place.max_guest)} Guest</div>
      <div class="number_rooms">${ud(place.number_rooms)} Bedroom</div>
      <div class="number_bathrooms">${ud(place.number_bathrooms)} Bathroom</div>
	  </div>
	  <div class="user">
            <b>Owner:</b> ${ud(place.user.first_name)} ${ud(place.user.last_name)}
          </div>
          <div class="description">
	    ${ud(place.description)}
          </div>
	</article>
      `;
        $('section.places').append(template);
      }
    })
  })
})