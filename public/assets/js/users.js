var dataSet = [];
var userDataSet = [];
var channelsDataSet = [];

var userImportModal = new bootstrap.Modal(
  document.getElementById("userImportModal")
);

document
  .getElementById("privateChannels")
  .addEventListener("click", async function () {
    let isChecked = $("#privateChannels").is(":checked");
    $("#channel-join").empty();
    $("#channel-join").append(`<option selected>Choose...</option>`);

    await getChannels(isChecked);
  });

async function getChannels(type) {
  let types = "";

  if (type === true) {
    types = `types[]=c&types[]=p`;
  } else {
    types = `types[]=c`;
  }

  $("#loading").show();
  let response = await fetch(`${url}/api/v1/rooms.adminRooms?${types}`, {
    method: "get",
    headers: {
      "X-Auth-Token": authToken,
      "X-User-Id": userId,
    },
  });
  let data = await response.json();
  if (data.rooms.length > 0) {
    for (let i = 0; i < data.rooms.length; i++) {
      const element = data.rooms[i];
      $("#channel-join").append(
        `<option value="${element._id}">id: ${element._id} - name: ${element.fname}</option>`
      );
    }
  }
  $("#loading").hide();
  sendInformation(`Fetched ${data.rooms.length} rooms :)`, "success");
}

//create row popup contents
var rowPopupFormatter = function (e, row, onRendered) {
  var data = row.getData(),
    container = document.createElement("div"),
    contents =
      "<strong style='font-size:1.2em;'>User Details</strong><br/><ul style='padding:0;  margin-top:10px; margin-bottom:0;'>";
  contents += "<li><strong>Name:</strong> " + data.name + "</li>";
  contents += "<li><strong>Username:</strong> " + data.username + "</li>";
  contents += "<li><strong>Active:</strong> " + data.active + "</li>";
  contents += "<li><strong>Last Login:</strong> " + data.daysIdle + "</li>";
  contents += "<li><strong>Email:</strong> " + data.emails + "</li>";
  contents += `<li><strong>Status:</strong> <span class='user-status-${data.status}'> <i class="fa-solid fa-circle-user"></i> ${data.status} </span></li>`;
  contents += "</ul>";

  console.log(data);

  container.innerHTML = contents;

  return container;
};

//create header popup contents
var headerPopupFormatter = function (e, column, onRendered) {
  var container = document.createElement("div");

  var label = document.createElement("label");
  label.innerHTML = "Filter Column:";
  label.style.display = "block";
  label.style.fontSize = ".7em";

  var input = document.createElement("input");
  input.placeholder = "Filter Column...";
  input.value = column.getHeaderFilterValue() || "";

  input.addEventListener("keyup", (e) => {
    column.setHeaderFilterValue(input.value);
  });

  container.appendChild(label);
  container.appendChild(input);

  return container;
};

//create dummy header filter to allow popup to filter
var emptyHeaderFilter = function () {
  return document.createElement("div");
};

async function getData(status) {
  $("#loading").show();
  let response = await fetch(`${url}/api/v1/users.list`, {
    method: "get",
    headers: {
      "X-Auth-Token": authToken,
      "X-User-Id": userId,
    },
  });
  let data = await response.json();
  if (data.users.length > 0) {
    for (let i = 0; i < data.users.length; i++) {
      const element = data.users[i];
      let emails = data.users[i].emails;
      if (data.users[i].emails === undefined) {
        emails = "undefined";
      }
      if (emails != "undefined") {
        emails = data.users[i].emails[0]["address"];
      }

      let roles = data.users[i].roles;

      let found = roles.includes("app"); // returns true
      let daysIdle = "";

      if (!found) {
        let dateNow = moment();
        let lastLogin = moment(element.lastLogin);

        var duration = moment.duration(dateNow.diff(lastLogin));
        var time = Math.floor(duration.asMinutes());

        //minutes to hour (and days) converter
        function ConvertMinutes(num) {
          d = Math.floor(num / 1440); // 60*24
          h = Math.floor((num - d * 1440) / 60);
          m = Math.round(num % 60);

          if (d > 0) {
            return d + " days, " + h + " hours, " + m + " minutes";
          } else {
            return h + " hours, " + m + " minutes";
          }
        }

        daysIdle = ConvertMinutes(time);
      }

      if (status === "all" && !found) {
        dataSet.push({
          id: element._id,
          daysIdle: daysIdle,
          active: element.active,
          username: element.username,
          name: element.name,
          emails: emails,
          lastLogin: moment(element.lastLogin).format("DD/MM/YYYY - HH:mm:ss"),
          status: element.status,
        });
      }
      if (status === "enabled" && element.active === true && !found) {
        dataSet.push({
          id: element._id,
          daysIdle: daysIdle,
          active: element.active,
          username: element.username,
          name: element.name,
          emails: emails,
          lastLogin: moment(element.lastLogin).format("DD/MM/YYYY - HH:mm:ss"),
          status: element.status,
        });
      }
      if (status === "disabled" && element.active === false && !found) {
        dataSet.push({
          id: element._id,
          daysIdle: daysIdle,
          active: element.active,
          username: element.username,
          name: element.name,
          emails: emails,
          lastLogin: moment(element.lastLogin).format("DD/MM/YYYY - HH:mm:ss"),
          status: element.status,
        });
      }
    }
  }
  sendInformation(`Fetched ${dataSet.length} registers :)`, "success");

  $("#loading").hide();
}

createNewTable();

async function createNewTable() {
  await getData("all");
  await getChannels(false);
  var table = new Tabulator("#table", {
    height: "500px", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    data: dataSet, //assign data to table
    layout: "fitColumns", //fit columns to width of table (optional)
    pagination: "local",
    paginationSize:50,
    paginationSizeSelector: [25, 50, 100, 500, 1000, 2000],
    rowClickPopup: rowPopupFormatter, //add click popup to row
    columns: [
      //Define Table Columns
      {
        formatter: "rowSelection",
        titleFormatter: "rowSelection",
        hozAlign: "center",
        headerSort: false,
        cellClick: function (e, cell) {
          cell.getRow().toggleSelect();
        },
      },
      { title: "id", field: "id" },
      { title: "daysIdle", field: "daysIdle" },
      { title: "active", field: "active" },
      { title: "username", field: "username", headerFilter: "input" },
      { title: "name", field: "name", headerFilter: "input" },
      { title: "emails", field: "emails", headerFilter: "input" },
      { title: "lastLogin", field: "lastLogin" },
      {
        title: "Last Login",
        width: 300,
        field: "lastLogin",
        sorter: "date",
        headerFilter: dateFilterEditor,
        headerFilterFunc: dateFilterFunction,
      },

      { title: "status", field: "status" },
    ],
    footerElement:
      '<span class="tabulator-counter float-left">' +
      'Showing <span id="search_count"></span> results out of <span id="total_count"></span> ' +
      "</span>",
  });

  document
    .getElementById("import-users")
    .addEventListener("click", async function () {
      userImportModal.show();
    });

  function capitalize(string) {
    return string.replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  }

  $(function () {
    $("#upload").bind("click", function () {
      var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
      if (regex.test($("#fileUpload").val().toLowerCase())) {
        if (typeof FileReader != "undefined") {
          var reader = new FileReader();
          reader.onload = async function (e) {
            var rows = e.target.result.split("\n");
            for (var i = 1; i < rows.length - 1; i++) {
              var cells = rows[i].split(",");
              for (var j = 0; j < cells.length; j++) {
                let username = cells[j].split(";")[0];
                let name = cells[j].split(";")[1];
                let email = cells[j].split(";")[2];
                let password = cells[j].split(";")[3];
                let role = cells[j].split(";")[4];

                role = role.substring(0, role.length - 1);

                role = role.split(" ")

                userDataSet.push({
                  username: username.toLowerCase(),
                  name: name.toLowerCase(),
                  email: email.toLowerCase(),
                  password: password,
                  role: role,
                });
              }
            }

           
            if (rows.length - 2 > maxActiveUsers) {
              sendInformation(
                `Warning! You are trying to add more users than available seats (You have: ${maxActiveUsers} and want to add: ${rows.length - 2}), aborting.`,
                "warning"
              );
            } else {
              let btn = await sendConfirmation(
                `Do you want to really want to add ${
                  rows.length - 2
                } registers?`
              );
              if (btn.isConfirmed) {
                userImportModal.hide();
                await createUser(userDataSet);
              } else if (btn.isDenied) {
                Swal.fire("Nothing was changed", "", "info");
              }
            }
          };
          reader.readAsText($("#fileUpload")[0].files[0]);
        } else {
          alert("This browser does not support HTML5.");
        }
      } else {
        alert("Please upload a valid CSV file.");
      }
    });
  });

  async function createUser(data) {
    let error = 0;
    var i = 0;
    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];

      console.log(data[i])
      console.log("Created: ", element.username, ". Total: ", i);
      let request = await fetch(`${url}/api/v1/users.create`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          email: element.email,
          name: capitalize(element.name),
          password: element.password,
          username: element.username,
          active: true,
          joinDefaultChannels: false,
          verified: true,
          sendWelcomeEmail: false,
          requirePasswordChange: false,
          roles: element.role
        }),
      });

      let response = await request.json();

      console.log(response);

      if (!response.success) {
        error += 1;
        sendInformation(`Warning ${response.error}`, "warning");
      }
    }

    dataSet = [];
    await getData("all");
    table.replaceData(dataSet);
    if (error > 0) {
      sendNotification(
        "Warning!",
        `Done creating ${i} registers! With ${error} problems`,
        "warning"
      );
    } else {
      sendNotification("Success!", `Done creating ${i} registers!`, "success");
    }
    console.log("Done creating: ", i, " registers.");
    $("#loading").hide();
  }

  document
    .getElementById("clear-filters")
    .addEventListener("click", async function () {
      $("#loading").show();
      table.clearHeaderFilter();
      setTimeout(async function () {
        $("#loading").hide();
        setTimeout(async function () {
          sendInformation(`Done :)`, "success");
        }, 50);
      }, 250);
    });

  table.on("dataLoaded", function (data) {
    $("#total_count").text(data.length);
  });

  table.on("dataFiltered", function (filters, rows) {
    $("#search_count").text(rows.length);
  });

  document
    .getElementById("download-csv")
    .addEventListener("click", function () {
      table.download("csv", "data.csv");
    });

  //trigger download of data.json file
  document
    .getElementById("download-json")
    .addEventListener("click", function () {
      table.download("json", "data.json");
    });

  //trigger download of data.xlsx file
  document
    .getElementById("download-xlsx")
    .addEventListener("click", function () {
      table.download("xlsx", "data.xlsx", { sheetName: "My Data" });
    });

  //trigger download of data.pdf file
  document
    .getElementById("download-pdf")
    .addEventListener("click", function () {
      table.download("pdf", "data.pdf", {
        orientation: "portrait", //set page orientation to portrait
        title: "Example Report", //add title to report
      });
    });

  //trigger download of data.html file
  document
    .getElementById("download-html")
    .addEventListener("click", function () {
      table.download("html", "data.html", { style: true });
    });

  document
    .getElementById("join-selected-to-a-channel")
    .addEventListener("click", async function () {
      let channel = $("#channel-join option:selected").val();
      var selectedRows = table.getSelectedData();

      if (channel === "Choose...") {
        sendNotification("Error!", "You must select a channel.", "error");
      } else {
        let btn = await sendConfirmation(
          `Do you want to really want to modify these ${selectedRows.length} registers?`
        );
        if (btn.isConfirmed) {
          await joinToChannelFunction(selectedRows, channel);
        } else if (btn.isDenied) {
          Swal.fire("Nothing was changed", "", "info");
        }
      }
    });

  document
    .getElementById("disable-rows")
    .addEventListener("click", async function () {
      var selectedRows = table.getSelectedData(); //get array of currently selected row components.
      let btn = await sendConfirmation(
        `Do you want to really want to disable these ${selectedRows.length} registers?`
      );
      if (btn.isConfirmed) {
        await disableFunction(selectedRows);
      } else if (btn.isDenied) {
        Swal.fire("Nothing was changed", "", "info");
      }
    });

  document
    .getElementById("enable-rows")
    .addEventListener("click", async function () {
      var selectedRows = table.getSelectedData(); //get array of currently selected row components.

      let btn = await sendConfirmation(
        `Do you want to really want to enable these ${selectedRows.length} registers?`
      );
      if (btn.isConfirmed) {
        await enableFunction(selectedRows);
      } else if (btn.isDenied) {
        Swal.fire("Nothing was changed", "", "info");
      }
    });

  document
    .getElementById("delete-rows")
    .addEventListener("click", async function () {
      var selectedRows = table.getSelectedData(); //get array of currently selected row components.
      let btn = await sendConfirmation(
        `Do you want to really want to delete these ${selectedRows.length} registers?`
      );
      if (btn.isConfirmed) {
        await deleteFunction(selectedRows);
      } else if (btn.isDenied) {
        Swal.fire("Nothing was changed", "", "info");
      }
    });

  document
    .getElementById("show-disabled")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData("disabled");
      table.replaceData(dataSet);
    });

  document
    .getElementById("show-enabled")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData("enabled");
      table.replaceData(dataSet);
    });

  document
    .getElementById("show-all")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData("all");
      table.replaceData(dataSet);
    });

  document
    .getElementById("delete-disabled-rows")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData("disabled");
      table.replaceData(dataSet);
      var disabledRows = table.getData();

      let btn = await sendConfirmation(
        `Do you want to really want to delete these ${disabledRows.length} registers?`
      );
      if (btn.isConfirmed) {
        await deleteFunction(disabledRows);
        await getData("all");
        table.replaceData(dataSet);
      } else if (btn.isDenied) {
        Swal.fire("Nothing was changed", "", "info");
      }
    });

  async function joinToChannelFunction(data, channel) {
    var i = 0;
    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      let response = await fetch(`${url}/api/v1/method.call/addUsersToRoom`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          message: `{\"msg\":\"method\",\"id\":\"113\",\"method\":\"addUsersToRoom\",\"params\":[{\"rid\":\"${channel}\",\"users\":[\"${element.username}\"]}]}`,
        }),
      });
      console.log(
        "Joined: ",
        element.id,
        " to the channel: ",
        channel,
        " .Total: ",
        i
      );
    }
    dataSet = [];
    await getData("all");
    table.replaceData(dataSet);
    sendNotification(
      "Success!",
      `Done working with ${i} registers!`,
      "success"
    );
    console.log("Done working with ", i, " registers.");
    $("#loading").hide();
  }

  async function deleteFunction(data) {
    var i = 0;
    let error = false;

    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      console.log("Deleted: ", element.id, ". Total: ", i);
      let response = await fetch(`${url}/api/v1/users.delete`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          userId: element.id,
          confirmRelinquish: true,
        }),
      });

      let result = await response.json();

      error = result.success;
      if (result.success === false) {
        await sendInformation(`Error! ${result.error}`, "error");
      }
    }

    dataSet = [];
    await getData("all");

    table.replaceData(dataSet);
    if (error) {
      await sendNotification(
        "Success!",
        `Done deleting ${i} registers!`,
        "success"
      );
    }
    console.log("Done Deleting: ", i, " registers.");

    $("#loading").hide();
  }

  async function enableFunction(data) {
    var i = 0;
    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      console.log("Enabled: ", element.id, ". Total: ", i);
      await fetch(`${url}/api/v1/users.setActiveStatus`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          userId: element.id,
          activeStatus: true,
          confirmRelinquish: true,
        }),
      });
    }

    dataSet = [];
    await getData("all");
    table.replaceData(dataSet);
    sendNotification("Success!", `Done enabling ${i} registers!`, "success");
    console.log("Done enabling: ", i, " registers.");
    $("#loading").hide();
  }

  async function disableFunction(data) {
    var i = 0;
    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.username != currentUser) {
        console.log("Disabled: ", element.id, ". Total: ", i);
        await fetch(`${url}/api/v1/users.setActiveStatus`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": authToken,
            "X-User-Id": userId,
          },
          body: JSON.stringify({
            userId: element.id,
            activeStatus: false,
            confirmRelinquish: true,
          }),
        });
      }
    }

    dataSet = [];
    await getData("all");
    table.replaceData(dataSet);
    sendNotification("Success!", `Done disabling ${i} registers!`, "success");
    console.log("Done disabling: ", i, " registers.");
    $("#loading").hide();
  }
}
