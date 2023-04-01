$(() => {
  var baseUrl = window.location.origin + "/api/v1";
  const port = "5001";
  baseUrl = baseUrl.replace("5000", port)

  let jsonData = localStorage.getItem('user');
  let data = JSON.parse(jsonData);
  let jwt = data.user.access;

  $(".name").text(data.user.full_name)
  $(".email").text(data.user.email)

  check()
  function openNav() {
    $(".leftmenu").css("width", "350px");
    $(".tadoarea").css("marginLeft", "350px");
  }

  function closeNav() {
    $(".leftmenu").css("width", "0");
    $(".tadoarea").css("marginLeft", "0");
  }

  $(".closebtn").click(closeNav)
  $(".openbtn").click(openNav)

  function opendetails() {
    $(".details").css("width", "350px");
    $(".todos").css("marginRight", "350px");
  }

  function closedetails() {
    $(".details").css("width", "0");
    $(".todos").css("marginRight", "0");
  }

  function updateDone() {
    let done = $('#done')
    let numberOftask = $('#checked')[0].children.length
    done.text(numberOftask)
  }
  updateDone();

  function newTask(taskName, id, position, dueDate = "") {
    let taskob = $(`
    <div class="task" data-id="${id}" data-task="${taskName}" data-position="${position}">
      <div>
        <div name="tick" class="tick checkbox"></div>
        <p class="taskName">${taskName}</p>
      </div>

      <div>
        <p class="dueDate">${dueDate}</p>
        <i class="important fa-regular fa-star"></i>
      </div>
    </div>
    `)

    taskob.click(details);
    taskob.find(".checkbox").click(checkBox);
    taskob.find(".important").click(important);
    return taskob
  }

  function newFolder(leastName, id, position = "", dueDate = "") {
    let taskob = $(`
      <li data-id="${id}">
				<i class="fa-regular fa-folder"></i>
			  <p>${leastName}</p>
			</li>
    `)

    taskob.click(folder);
    //taskob.find(".checkbox").click(checkBox);
    return taskob
  }

  $(".detailsbtn").click(closedetails)

  //Function to expand and collaps details section on the right
  function details(event) {
    //console.log(this.children[0].children[0])
    let tick = this.children[0].children[0]
    //console.log(this.children[1].children[1])
    let important = this.children[1].children[1]
    if (event.target == tick || event.target == important) {
      return
    }

    let open = Number($(".details").css("width").split("px")[0]);
    if (open) {
      //closedetails();
    } else {
      opendetails();
    }
  }

  async function waitFor(s) {
    await new Promise(resolve => setTimeout(resolve, s));
  }

  //Function to be called when checkbox is clicked
  async function checkBox() {

    $(this).toggleClass('checked');//////////////////////////////////////
    if (this.classList[0] == "tick") {
      ///////////////////////////////////////////
      await waitFor(250);
      let item

      if ($(this).parents().is('#unchecked')) {
        item = $(this.parentElement.parentElement).detach();
        let item_id = item.data('id');
        let taskName = item.data('task');
        let upTask = { "is_checked": 1, "task_name": taskName }
        //console.log(upTask);
        //The selected element is a child of the parent element.
        updateTask(upTask, item_id)
        $('#checked').prepend(item);
        updateDone();
      } else if ($(this).parents().is('#checked')) {
        item = $(this.parentElement.parentElement).detach();
        let item_id = item.data('id');
        let taskName = item.data('task');
        let upTask = { "is_checked": 0, "task_name": taskName }
        //console.log(upTask);
        //The selected element is a child of the parent element.
        updateTask(upTask, item_id)
        $('#unchecked').prepend(item);
        updateDone();
      }
    }

  }

  //Function to be called when Important is clicked
  async function important() {
    $(this).toggleClass('fa-regular fa-solid');//////////////////////////////////////
    if (this.classList[0] == "important") {
      ///////////////////////////////////////////
      await waitFor(250);
      let item = $(this.parentElement.parentElement)

      if ($(this).hasClass('fa-regular')) {
        console.log(item.data('id'))
        let item_id = item.data('id');
        let taskName = item.data('task');
        let upTask = { "is_important": 0, "task_name": taskName }
        //console.log(upTask);
        //The selected element is a child of the parent element.
        updateTask(upTask, item_id)
      } else if ($(this).hasClass('fa-solid')) {
        let item_id = item.data('id');
        let taskName = item.data('task');
        let upTask = { "is_important": 1, "task_name": taskName }
        //console.log(upTask);
        //The selected element is a child of the parent element.
        updateTask(upTask, item_id)
      }

    }
  }

  function folder(event) {
    let folderId = $(this).data("id")
    // If the clicked li already has active class, do nothing
    console.log(`folder: ${folderId}`)
    if ($(this).hasClass('active')) return;

    // Otherwise remove active class from all li tags and add it to the clicked one
    $('.folders li.active').removeClass('active');
    $(this).addClass('active');
    //console.log($(this).text());
    let data = getFolderTask(folderId);
    updateFolderNameAndId(folderId, $(this).text());
    renderTasks(data);
    updateDone();
  }

  function updateTask(jsonData, task_id) {
    let link = baseUrl + `/task/${task_id}`;
    $.ajax({
      url: link,
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      dataType: 'json',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(jsonData),
      success: function (response) {
        //handle success response
        //console.log(response);
        return response;
      },
      error: function (xhr, textStatus, errorThrown) {
        //handle error response
        //alert(xhr.responseJSON);
      }
    });
  }

  $(".task").click(details)

  $('.checkbox').click(checkBox);


  function sendTask(jsonData) {
    let link = baseUrl + "/task";
    let res = []

    $.ajax({
      url: link,
      async: false,
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      dataType: 'json',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(jsonData),
      success: function (response) {
        // handle success response
        res = response;
      },
      error: function (xhr, textStatus, errorThrown) {
        // handle error response
        console.log(xhr.responseJSON + " err");
      }
    });

    return res
  }

  function sendFolder(jsonData) {
    let link = baseUrl + "/folder";
    let res = []

    $.ajax({
      url: link,
      async: false,
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      dataType: 'json',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(jsonData),
      success: function (response) {
        // handle success response
        res = response;
        //console.log(response);
      },
      error: function (xhr, textStatus, errorThrown) {
        // handle error response
        console.log(xhr.responseJSON + " err");
      }
    });

    return res
  }

  function getFolderTask(folder_id) {
    let link = baseUrl + `/folder/${folder_id}/all_task`;
    var res;

    $.ajax({
      url: link,
      async: false,
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      dataType: 'json',
      type: 'GET',
      contentType: 'application/json',
      success: function (response) {
        // handle success response
        res = response;
      },
      error: function (xhr, textStatus, errorThrown) {
        // handle error response
        alert(xhr.responseJSON);
      }
    });

    return res
  }

  function renderTasks(data) {
    if (data !== []) {
      $('#unchecked').empty();
      $('#checked').empty();
      data.forEach(element => {
        let item = newTask(element.task_name, element.id, element.position);

        if (element.is_important) { 
          item.find(".important").toggleClass('fa-regular fa-solid');
        }

        if (element.is_checked) {
          item.find(".tick").addClass('checked');
          $('#checked').prepend(item);
        } else {
          $('#unchecked').prepend(item);
        }
      });
    } else {
      $('#unchecked').empty();
      $('#checked').empty();
    }

  }

  function updateFolderNameAndId(folderId, folderName) {
    console.log(`updateFolderNameAndId: ${folderId}`)
    $(".foldername").text(folderName);
    $(".foldername").data("folderid", folderId);
  }

  $("#addTask").on("keydown", function (event) {
    if (event.which === 13) {
      let valueJson = {};
      valueJson.task_name = $("#addTask").val();
      valueJson.folder_id = $(".foldername").data("folderid");
      console.log(`#addTask: ${valueJson.folder_id}`)
      $("#addTask").val("");
      //console.log(task.find(".task").prevObject[0]);
      console.log(valueJson)
      let res = sendTask(valueJson);
      console.log(res)
      let task = newTask(res.task_name, res.id, res.position);
      //task.click(details);
      //task.find(".checkbox").click(checkBox);
      // Enter key pressed
      $('#unchecked').prepend(task);
      valueJson.task_name = "";
      valueJson.folder_id = "";
      // Do something here, such as submit the form or trigger a button click event
    }
  });

  function check() {
    var res;

    $.ajax({
      url: baseUrl + "/status",
      async: false,
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      type: 'GET',
      success: function (response) {
        res = response.status;
        if (res != "OK") {
          window.location = window.location.origin + "/login"
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        // handle error response
        window.location = window.location.origin + "/login"
        //alert(xhr.responseJSON);
      }
    });

    console.log(res);
    return res
  }

  $("#addList").on("keydown", function (event) {
    if (event.which === 13) {
      let valueJson = {};
      valueJson.folder_name = $("#addList").val();
      $("#addList").val("");
      //console.log(task.find(".task").prevObject[0]);
      let res = sendFolder(valueJson);
      let list = newFolder(res.folder_name, res.id, res.position);
      //task.click(details);
      //task.find(".checkbox").click(checkBox);
      // Enter key pressed
      //console.log(list[0])
      $('.lists .folders').prepend(list);
      //console.log(value)
      // Do something here, such as submit the form or trigger a button click event
    }
  });

  $("#unchecked").sortable({
    stop: function (event, ui) {
      //console.clear();
      var positions = [];
      let ln = $("#unchecked .task").length
      $("#unchecked .task").each(function (i) {
        $(this).attr("data-position", (ln - i));
        let position = $(this).data("position");
        let taskname = $(this).data("task");
        let taskid = $(this).data("id");
        let data = { "position": position, "task_name": taskname };
        //console.log(data)
        updateTask(data, taskid)
        positions.push($(this).index());
      });
      //console.log(positions)
    }
  });

  $("#checked").sortable({
    stop: function (event, ui) {
      //console.clear();
      var positions = [];
      let ln = $("#checked .task").length
      $("#checked .task").each(function (i) {
        $(this).attr("data-position", (ln - i));
        let position = $(this).data("position");
        let taskname = $(this).data("task");
        let taskid = $(this).data("id");
        let data = { "position": position, "task_name": taskname };
        //console.log(data)
        updateTask(data, taskid)
        positions.push($(this).index());
      });
      //console.log(positions);
    }
  });

  $("#unchecked").disableSelection();
  $("#checked").disableSelection();

  $('.folders li').click(folder);

  $('.fol>li:first').click();
});
