import { baseUrl } from './apilnk.js';
var token = localStorage.getItem("user");

if (!token) {
  // Redirect to login page if token is not present
  window.location.href = "/login";
}

$(() => {
  /*var baseUrl = window.location.origin + "/api/v1";
  const port = "5001";
  baseUrl = baseUrl.replace("5000", port)*/

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

  //Function Gets task data
  function getask(task_id) {
    let link = baseUrl + `/task/${task_id}`;
    let res

    $.ajax({
      url: link,
      async: false,
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      type: 'GET',
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

  function taskselect(obj, clss) {
    // If the clicked li already has active class, do nothing
    //console.log(`folder: ${folderId}`)
    if ($(obj).hasClass(clss)) return;
    // Otherwise remove active class from all li tags and add it to the clicked one
    $('.allTask .task').removeClass(clss);
    $(obj).addClass(clss);
  }

  //Function to expand and collaps details section on the right
  function details(event) {
    //console.log(this.children[0].children[0])
    let tick = this.children[0].children[0]
    //console.log(this.children[1].children[1])
    let important = this.children[1].children[1]
    if (event.target == tick || event.target == important) {
      return
    }

    taskselect(this, "taskselected");

    let task_id = $(this).data("id");
    let task = getask(task_id);
    let task_name = $(this).find('.taskName').text();
    let detaisname = $('#task_name');
    //console.log(getask(task_id))

    function conv(dateString) {
      const date = new Date(dateString);

      // Format the date as "yyyy-MM-dd"
      if (dateString) {
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

        // Output the formatted date
        return formattedDate
      } else {
        return 'yyyy-MM-dd'
      }
    }

    $('#reminder').val(conv(task.reminder));

    $('#due_date').val(conv(task.due_date));

    $('#myTextarea').val(task.task_description);

    let open = Number($(".details").css("width").split("px")[0]);
    if (open && $(this).data("id") == $('#task_name').attr("task_id")) {
      closedetails();
    } else {
      opendetails();
    }
    let folderid = $(".foldername").data("folderid");
    //set id for delete(task)
    $('.namddelete .delete').data("id", task_id);
    detaisname.attr("task_id", task_id);
    detaisname.data("folder_id", folderid);
    detaisname.text(task_name);
  }

  $('.taskdetails').on('change input', function () {
    let detaisid = $('#task_name').attr("task_id");
    let detaisname = $('#task_name').text();
    let folderid = $('#task_name').data("folder_id");
    let value

    //console.log($(this))

    if ($(this).is("div")) {
      value = $(this).text();
    } else {
      value = $(this).val();
    }

    //console.log(value)
    let name = $(this).attr('name');
    let data = JSON.parse(`{"${name}": "${value.replace(/\n/g, '\\n')}", "task_name": "${detaisname}", "details": "True", "folder_id": "${folderid}"}`);
    //console.log(folderid);
    let newvals = updateTask(data, detaisid);
    //console.log(newvals);
    if (name == "task_name") {
      $(`[data-id="${detaisid}"]`).find('.taskName').text(detaisname/*newvals.task_name*/)
    }
  });

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
        let upTask = { "is_checked": 1, "task_name": taskName, "from": 1 }
        //console.log(upTask);
        //The selected element is a child of the parent element.
        updateTask(upTask, item_id)
        $('#checked').prepend(item);
        updateDone();
      } else if ($(this).parents().is('#checked')) {
        item = $(this.parentElement.parentElement).detach();
        let item_id = item.data('id');
        let taskName = item.data('task');
        let upTask = { "is_checked": 0, "task_name": taskName, "from": 1 }
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
        //console.log(item.data('id'))
        let item_id = item.data('id');
        let taskName = item.data('task');
        let upTask = { "is_important": 0, "task_name": taskName, "from": 1 }
        //console.log(upTask);
        //The selected element is a child of the parent element.
        updateTask(upTask, item_id)
      } else if ($(this).hasClass('fa-solid')) {
        let item_id = item.data('id');
        let taskName = item.data('task');
        let upTask = { "is_important": 1, "task_name": taskName, "from": 1 }
        //console.log(upTask);
        //The selected element is a child of the parent element.
        updateTask(upTask, item_id)
      }

    }
  }

  function folder(event) {
    let folderId = $(this).data("id")
    // If the clicked li already has active class, do nothing
    //console.log(`folder: ${folderId}`)
    if ($(this).hasClass('active')) return;

    //$('.folders li.active .selfol').css('translate', '-32px');
    //await waitFor(60);
    // Otherwise remove active class from all li tags and add it to the clicked one
    //$('.folders li.active .selfol').remove();
    $('.folders li.active').removeClass('active');

    //let newDiv = $('<div>');
    // Set the div's class and text
    //newDiv.addClass('selfol');
    
    $(this).addClass('active');
    dot(this)
    // Append the div to an element with class "my-container"
    //$('.folders li.active').prepend(newDiv);

    //await waitFor(60);
    //$('.folders li.active .selfol').css('translate', '0px');

    //console.log($(this).text());
    updateFolderNameAndId(folderId, $(this).text());
    $('#unchecked').empty();
    $('#checked').empty();
    updateDone();
    getFolderTask(folderId, renderTasks);
    //renderTasks(data);
  }

  async function dot(thi) {
    if ($(thi).hasClass('.active')) return;
   // console.log($(thi))

    $(".folders li.active .selfol").css('translate', '-32px');
    await waitFor(80);
    $('.selfol').remove();
    
    let newDiv = $('<div>');
    // Set the div's class and text
    newDiv.addClass('selfol');

    // Append the div to an element with class "my-container"
    $('.folders li.active').prepend(newDiv);
    await waitFor(80);
    $('.folders li.active .selfol').css('translate', '0px');

  }

  function updateTask(jsonData, task_id) {
    let link = baseUrl + `/task/${task_id}`;
    let resp
    $.ajax({
      url: link,
      //async: false,
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
        resp = response;
      },
      error: function (xhr, textStatus, errorThrown) {
        //handle error response
        //alert(xhr.responseJSON);
      }
    });
    return resp
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

  function getFolderTask(folder_id, next) {
    let link = baseUrl + `/folder/${folder_id}/all_task`;
    var res;

    $.ajax({
      url: link,
      //async: false,
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      dataType: 'json',
      type: 'GET',
      contentType: 'application/json',
      success: function (response) {
        // handle success response
        next(response);
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
      updateDone();
    } else {
      $('#unchecked').empty();
      $('#checked').empty();
    }

  }

  function updateFolderNameAndId(folderId, folderName) {
    //console.log(`updateFolderNameAndId: ${folderId}`)
    const ignore = ["Important", "All", "Completed", "Task"]
    //console.log(ignore, folderName.replace(/\s/g, ''), ignore.indexOf(folderName.replace(/\s/g, '')))
    if (ignore.indexOf(folderName.replace(/\s/g, '')) !== -1) {
      $(".folderdelete .delete").css("display", "none")
    } else {
      $(".folderdelete .delete").css("display", "block")
    }

    $(".foldername").text(folderName.replace(/\s/g, ''));
    $(".foldername").data("folderid", folderId);
    //set id for delete(folder)
    $(".folderdelete .delete").data("id", folderId);
  }

  $("#addTask").on("keydown", function (event) {
    if (event.which === 13) {
      let valueJson = {};
      valueJson.task_name = $("#addTask").val();
      valueJson.folder_id = $(".foldername").data("folderid");
      //console.log(`#addTask: ${valueJson.folder_id}`)
      $("#addTask").val("");
      //console.log(task.find(".task").prevObject[0]);
      //console.log(valueJson)
      let res = sendTask(valueJson);
      //console.log(res)
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

  $(".delete").on("click", function (event) {
    const ignore = ["Important", "All", "Completed", "Task"]
    let id = $(this).data("id");
    let which = $(this).parent().attr("class");
    let name
    const deleten = {
      namddelete: "task",
      folderdelete: "least"
    }
    if (which == "namddelete") {
      name = $(`[data-id="${id}"]`).text();
    } else if (which == "folderdelete") {
      name = $(this).parent().text();
    }

    let whichdel = `deleten.${which}`
    Swal.fire({
      title: 'Are you sure?',
      text: `You will not be able to recover ${eval(whichdel)}: ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle the delete operation here
        // You can use AJAX or any other method to delete the folder
        // Once the delete operation is complete, show a success message using Sweet Alert 2
        if (ignore.indexOf(name.replace(/\s/g, '')) !== -1) {
          Swal.close()
          return
        }
        if (del(which, id)) {
          Swal.fire(
            'Deleted!',
            `Your ${eval(whichdel)} has been deleted.`,
            'success'
          );
        } else {
          Swal.fire(
            'Error',
            `Your ${eval(whichdel)} was not deleted`,
            'error'
          );
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          `Your ${eval(whichdel)} is safe :)`,
          'error'
        );
      }
    });
  });

  function del(which, id) {
    let uri, res;

    if (which == "namddelete") {
      closedetails();
      uri = baseUrl + `/task/${id}`;
    } else if (which == "folderdelete") {
      $('.fol>li:nth-child(4)').click();
      uri = baseUrl + `/folder/${id}`;
    }

    $.ajax({
      url: uri,
      async: false,
      headers: {
        'Authorization': 'Bearer ' + jwt
      },
      type: 'DELETE',
      success: function (response) {
        res = 1
        $(`[data-id="${id}"]`).remove();
      },
      error: function (xhr, textStatus, errorThrown) {
        res = 0
      }
    });
    return res
  }

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

    //console.log(res);
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
        let data = { "position": position, "task_name": taskname, "from": 1 };
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
        let data = { "position": position, "task_name": taskname, "from": 1 };
        //console.log(data)
        updateTask(data, taskid)
        positions.push($(this).index());
      });
      //console.log(positions);
    }
  });
  const logoutButton = $('.logout');

  logoutButton.on('click', () => {
    localStorage.removeItem('user');
    // Redirect the user to the login page or other unauthenticated route
    window.location.href = "/login";
  });

  $("#unchecked").disableSelection();
  $("#checked").disableSelection();

  $('.folders li').click(folder);

  $('.fol>li:nth-child(4)').click();
});
