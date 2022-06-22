var dataSet = [];

async function getVisitorData(visitor) {
  let response = await fetch(`${url}/api/v1/livechat/visitor/${visitor}`, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
  });

  let result = await response.json();

  if (result.success) {
    return result;
  }
}

async function getData(status) {
  $("#loading").show();
  let response = await fetch(`${url}/api/v1/livechat/rooms`, {
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

      console.log(element);

      let agentName = "";
      let isOpen = false;

      if (element.open) {
        isOpen = true;
      } else {
        isOpen = false;
      }

      let visitorData = [];

     
      if (!data.rooms[i].servedBy) {
        agentName = "undefined";
      } else {
        agentName = data.rooms[i].servedBy.username;
      }

      if (status === "all") {
        dataSet.push({
          id: element._id,
          msgs: element.msgs,
          departmentId: element.departmentId,
          isOpen: isOpen,
          guestname: element.fname,
          servedBy: agentName,
          lastMessage: moment(element.lm).format("DD/MM/YYYY - HH:mm:ss"),
          token: element.v.token
        });
      }
      if (status === "open" && isOpen === true) {
        dataSet.push({
          id: element._id,
          msgs: element.msgs,
          departmentId: element.departmentId,
          isOpen: isOpen,
          guestname: element.fname,
          servedBy: agentName,
          lastMessage: moment(element.lm).format("DD/MM/YYYY - HH:mm:ss"),
          token: element.v.token
        });
      }
      if (status === "closed" && isOpen === false) {
        dataSet.push({
          id: element._id,
          msgs: element.msgs,
          departmentId: element.departmentId,
          isOpen: isOpen,
          guestname: element.fname,
          servedBy: agentName,
          lastMessage: moment(element.lm).format("DD/MM/YYYY - HH:mm:ss"),
          token: element.v.token
        });
      }
    }
  }
  $("#loading").hide();
  sendInformation(`Fetched ${dataSet.length} registers :)`, "success");
}

createNewTable();

async function createNewTable() {
  await getData("all");

  let tableColumns = [
    //Define Table Columns
    {
      title: "Select All",
      formatter: "rowSelection",
      titleFormatter: "rowSelection",
      hozAlign: "center",
      headerSort: false,
      cellClick: function (e, cell) {
        cell.getRow().toggleSelect();
      },
      width: 50,
    },
    { title: "Room Id", field: "id" },
    { title: "Message Count", field: "msgs", width: 100 },
    { title: "Department", field: "departmentId", headerFilter: "input" },
    { title: "Is Open", field: "isOpen", width: 100 },
    { title: "Guest Name", field: "guestname", headerFilter: "input" },
    { title: "Agent Name", field: "servedBy", headerFilter: "input" },
    {
      title: "Date",
      width: 300,
      field: "lastMessage",
      sorter: "date",
      headerFilter: dateFilterEditor,
      headerFilterFunc: dateFilterFunction,
    },
    { title: "Token", field: "token" },
  ];

  var table = new Tabulator("#table", {
    height: 500, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    data: dataSet, //assign data to table
    layout: "fitColumns", //fit columns to width of table (optional)
    pagination: "local",
    paginationSize: 50,
    paginationSizeSelector: [25, 50, 100, 500, 1000, 2000],
    columns: tableColumns,
    footerElement:
      '<span class="tabulator-counter float-left">' +
      'Showing <span id="search_count"></span> results out of <span id="total_count"></span> ' +
      "</span>",
  });

  table.on("dataLoaded", function (data) {
    $("#total_count").text(data.length);
  });

  table.on("dataFiltered", function (filters, rows) {
    $("#search_count").text(rows.length);
  });

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
    .getElementById("disable-rows")
    .addEventListener("click", async function () {
      var selectedRows = table.getSelectedData(); //get array of currently selected row components.
      let btn = await sendConfirmation(
        `Do you want to really want to delete these ${selectedRows.length} registers?`
      );
      if (btn.isConfirmed) {
        await disableFunction(selectedRows);
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
    .getElementById("show-closed")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData("closed");
      table.replaceData(dataSet);
    });

  document
    .getElementById("show-open")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData("open");
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
    .getElementById("delete-closed-rooms")
    .addEventListener("click", async function () {
      dataSet = [];

      await getData("all");
      table.replaceData(dataSet);

      let btn = await sendConfirmation(
        `Do you want to really want to delete these all closed rooms?`
      );
      if (btn.isConfirmed) {
        await deleteClosedRooms();
        dataSet = [];

        await getData("all");
        table.replaceData(dataSet);
      } else if (btn.isDenied) {
        Swal.fire("Nothing was changed", "", "info");
      }
    });

  async function deleteFunction(data) {
    var i = 0;
    let error = false;

    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.isOpen === true) {
        let response = await fetch(
          `${url}/api/v1/method.call/livechat:removeAllClosedRooms`,
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              "X-Auth-Token": authToken,
              "X-User-Id": userId,
            },
            body: JSON.stringify({
              message: `{\"msg\":\"method\",\"id\":\"41\",\"method\":\"livechat:closeRoom\",\"params\":[\"${element.id}\",\"\",{\"clientAction\":false,\"tags\":[]}]}`,
            }),
          }
        );
      }
      let response = await fetch(`${url}/api/v1/method.call/eraseRoom`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          message: `{\"msg\":\"method\",\"id\":\"19\",\"method\":\"livechat:removeRoom\",\"params\":[\"${element.id}\"]}`,
        }),
      });

      let result = await response.json();

      error = result.success;
      if (result.success === false) {
        await sendNotification("Error!", `${result.error}`, "error");
      }
    }

    dataSet = [];
    await getData("all");
    table.replaceData(dataSet);
    console.log("Done Deleting: ", i, " registers.");

    if (error) {
      await sendNotification(
        "Success!",
        `Done working with ${i} registers!`,
        "success"
      );
    }
    $("#loading").hide();
  }

  async function deleteClosedRooms() {
    var i = 0;
    let error = false;

    $("#loading").show();
    let response = await fetch(
      `${url}/api/v1/method.call/livechat:removeAllClosedRooms`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          message:
            '{"msg":"method","id":"26","method":"livechat:removeAllClosedRooms","params":[]}',
        }),
      }
    );

    let result = await response.json();

    error = result.success;
    if (result.success === false) {
      await sendNotification("Error!", `${result.error}`, "error");
    }

    dataSet = [];
    await getData("all");
    table.replaceData(dataSet);
    console.log("Done Deleting: ", i, " registers.");
    if (error) {
      await sendNotification(
        "Success!",
        `Done working with ${i} registers!`,
        "success"
      );
    }
    $("#loading").hide();
  }

  async function disableFunction(data) {
    let error = false;
    var i = 0;
    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      console.log("Disabled: ", element.id, ". Total: ", i);
      let response = await fetch(
        `${url}/api/v1/method.call/livechat:removeAllClosedRooms`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": authToken,
            "X-User-Id": userId,
          },
          body: JSON.stringify({
            message: `{\"msg\":\"method\",\"id\":\"41\",\"method\":\"livechat:closeRoom\",\"params\":[\"${element.id}\",\"\",{\"clientAction\":false,\"tags\":[]}]}`,
          }),
        }
      );

      let result = await response.json();

      error = result.success;
      if (result.success === false) {
        await sendNotification("Error!", `${result.error}`, "error");
      }
    }

    dataSet = [];
    await getData("all");
    table.replaceData(dataSet);
    console.log("Done disabling: ", i, " registers.");
    if (error) {
      await sendNotification(
        "Success!",
        `Done working with ${i} registers!`,
        "success"
      );
    }
    $("#loading").hide();
  }
}
