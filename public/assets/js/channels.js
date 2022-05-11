var dataSet = [];
let isChecked = false;

async function getData(allTypes, archivedStatus) {
  let types = "";

  if (allTypes === true) {
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
      if (element.u) {
        roomOwner = element.u.username;
      } else {
        roomOwner = "undefined";
      }

      if (element.archived) {
        archived = true;
      } else {
        archived = false;
      }

      if (archivedStatus === "archived" && element.archived) {
        dataSet.push({
          id: element._id,
          fname: element.fname,
          owner: roomOwner,
          archived: archived,
          usersCount: element.usersCount,
        });
      }

      if (archivedStatus === "unarchived" && !element.archived) {
        dataSet.push({
          id: element._id,
          fname: element.fname,
          owner: roomOwner,
          archived: archived,
          usersCount: element.usersCount,
        });
      }

      if (archivedStatus === "all") {
        dataSet.push({
          id: element._id,
          fname: element.fname,
          owner: roomOwner,
          archived: archived,
          usersCount: element.usersCount,
        });
      }
    }
  }
  $("#loading").hide();

  sendInformation(`Fetched ${dataSet.length} registers :)`, "success");
}

createNewTable();

async function getDepartmentMembers(department) {
  let response = await fetch(
    `${url}/api/v1/channels.members?roomId=${department.id}`,
    {
      method: "get",
      headers: {
        "X-Auth-Token": authToken,
        "X-User-Id": userId,
      },
    }
  );
  let data = await response.json();
  return data;
}

async function createNewTable() {
  await getData(isChecked, "all");

  var table = new Tabulator("#table", {
    height: 500, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    data: dataSet, //assign data to table
    layout: "fitColumns", //fit columns to width of table (optional)
    pagination: "local",
    paginationSize: 50,
    paginationSizeSelector: [25, 50, 100, 500, 1000, 2000],
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
      { title: "fname", field: "fname", headerFilter: "input" },
      { title: "owner", field: "owner", headerFilter: "input" },
      { title: "archived", field: "archived" },
      { title: "usersCount", field: "usersCount" },
    ],
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
    .addEventListener("click", async function () {
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
    .getElementById("enable-rows")
    .addEventListener("click", async function () {
      var selectedRows = table.getSelectedData(); //get array of currently selected row components.

      let btn = await sendConfirmation(
        `Do you want to really want to delete these ${selectedRows.length} registers?`
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
    .getElementById("privateChannels")
    .addEventListener("click", async function () {
      dataSet = [];
      isChecked = $("#privateChannels").is(":checked");
      await getData(isChecked, "all");
      table.replaceData(dataSet);
    });

  document
    .getElementById("show-disabled")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData(isChecked, "archived");
      table.replaceData(dataSet);
    });

  document
    .getElementById("show-enabled")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData(isChecked, "unarchived");
      table.replaceData(dataSet);
    });

  document
    .getElementById("show-all")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData(isChecked, "all");
      table.replaceData(dataSet);
    });

  document
    .getElementById("delete-disabled-rows")
    .addEventListener("click", async function () {
      dataSet = [];
      await getData(isChecked, "archived");
      table.replaceData(dataSet);
      var disabledRows = table.getData();

      let btn = await sendConfirmation(
        `Do you want to really want to delete these ${disabledRows.length} registers?`
      );
      if (btn.isConfirmed) {
        await deleteFunction(disabledRows);
        dataSet = [];

        await getData(isChecked, "all");
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
      console.log("Deleted: ", element.id, ". Total: ", i);
      let response = await fetch(`${url}/api/v1/channels.delete`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          roomId: element.id,
        }),
      });

      let result = await response.json();

      error = result.success;
      if (result.success === false) {
        sendNotification("Error!", `${result.error}`, "error");
      }
    }

    dataSet = [];
    await getData(isChecked, "all");
    table.replaceData(dataSet);

    if (error) {
      sendNotification("Success!", `Done deleting ${i} registers!`, "success");
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
      await fetch(`${url}/api/v1/channels.unarchive`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          roomId: element.id,
        }),
      });
    }

    dataSet = [];
    await getData(isChecked, "all");
    table.replaceData(dataSet);
    sendNotification("Success!", `Done enabling ${i} registers!`, "success");
    console.log("Done enabling: ", i, " registers.");
    $("#loading").hide();
  }

  async function disableFunction(data) {
    var i = 0;
    let error = false;

    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      console.log("Disabled: ", element.id, ". Total: ", i);
      let response = await fetch(`${url}/api/v1/channels.archive`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          roomId: element.id,
        }),
      });

      let result = await response.json();
      error = result.success;
      if (result.success === false) {
        sendNotification("Error!", `${result.error}`, "error");
      }
    }

    dataSet = [];
    await getData(isChecked, "all");
    table.replaceData(dataSet);
    if (error) {
      sendNotification("Success!", `Done archiving ${i} registers!`, "success");
    }
    console.log("Done archiving: ", i, " registers.");
    $("#loading").hide();
  }
}
