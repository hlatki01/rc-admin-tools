var dataSet = [];

async function getDepartments(status) {
  $("#loading").show();
  let response = await fetch(`${url}/api/v1/livechat/department`, {
    method: "get",
    headers: {
      "X-Auth-Token": authToken,
      "X-User-Id": userId,
    },
  });
  let data = await response.json();
  if (data.departments.length > 0) {
    data.departments.forEach((element) => {
      if (status === "all") {
        $("#loading").show();
        dataSet.push({
          id: element._id,
          enabled: element.enabled,
          name: element.name,
          email: element.email,
          _updatedAt: element._updatedAt,
          showOnRegistration: element.showOnRegistration,
          showOnOfflineForm: element.showOnOfflineForm,
        });
        $("#loading").hide();
      }
      if (status === "enabled" && element.enabled === true) {
        $("#loading").show();
        dataSet.push({
          id: element._id,
          enabled: element.enabled,
          name: element.name,
          email: element.email,
          _updatedAt: element._updatedAt,
          showOnRegistration: element.showOnRegistration,
          showOnOfflineForm: element.showOnOfflineForm,
        });
        $("#loading").hide();
      }
      if (status === "disabled" && element.enabled === false) {
        $("#loading").show();
        dataSet.push({
          id: element._id,
          enabled: element.enabled,
          name: element.name,
          email: element.email,
          _updatedAt: element._updatedAt,
          showOnRegistration: element.showOnRegistration,
          showOnOfflineForm: element.showOnOfflineForm,
        });
        $("#loading").hide();
      }
    });
  }
  $("#loading").hide();
  sendInformation(`Fetched ${dataSet.length} registers :)`, "success");
}

createNewTable();

async function createNewTable() {
  await getDepartments("all");

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
      {
        title: "enabled",
        field: "enabled",
        editor: true,
        hozAlign: "center",
        formatter: "tickCross",
        cellEdited: async function (cell) {
          let row = cell._cell.row.data;
          await updateFunction(row);
        },
      },
      {
        title: "showOnRegistration",
        field: "showOnRegistration",
        editor: true,
        hozAlign: "center",
        formatter: "tickCross",
        cellEdited: async function (cell) {
          let row = cell._cell.row.data;
          await updateFunction(row);
        },
      },
      {
        title: "showOnOfflineForm",
        field: "showOnOfflineForm",
        editor: true,
        hozAlign: "center",
        formatter: "tickCross",
        cellEdited: async function (cell) {
          let row = cell._cell.row.data;
          await updateFunction(row);
        },
      },
      {
        title: "name",
        field: "name",
        headerFilter: "input",
        editor: true,
        hozAlign: "center",
        formatter: "input",
        cellEdited: async function (cell) {
          let row = cell._cell.row.data;
          await updateFunction(row);
        },
      },
      {
        title: "email",
        field: "email",
        headerFilter: "input",
        editor: true,
        hozAlign: "center",
        formatter: "input",
        cellEdited: async function (cell) {
          let row = cell._cell.row.data;
          await updateFunction(row);
        },
      },
      { title: "_updatedAt", field: "_updatedAt" },
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
    .addEventListener("click", function () {
      table.download("html", "data.html", { style: true });
    });

  document
    .getElementById("disable-rows")
    .addEventListener("click", async function () {
      var selectedRows = table.getSelectedData(); //get array of currently selected row components.
      let btn = await sendConfirmation(
        `Do you want to really want to modify these ${selectedRows.length} registers?`
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
        `Do you want to really want to modify these ${selectedRows.length} registers?`
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
        `Do you want to really want to modify these ${selectedRows.length} registers?`
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
      await getDepartments("disabled");
      table.replaceData(dataSet);
    });

  document
    .getElementById("show-enabled")
    .addEventListener("click", async function () {
      dataSet = [];
      await getDepartments("enabled");
      table.replaceData(dataSet);
    });

  document
    .getElementById("show-all")
    .addEventListener("click", async function () {
      dataSet = [];
      await getDepartments("all");
      table.replaceData(dataSet);
    });

  document
    .getElementById("delete-disabled-rows")
    .addEventListener("click", async function () {
      dataSet = [];
      await getDepartments("disabled");
      table.replaceData(dataSet);
      var disabledRows = table.getData();

      let btn = await sendConfirmation(
        `Do you want to really want to delete these ${disabledRows.length} registers?`
      );
      if (btn.isConfirmed) {
        await deleteFunction(disabledRows);
        dataSet = [];
        await getDepartments("all");
        table.replaceData(dataSet);
      } else if (btn.isDenied) {
        Swal.fire("Nothing was changed", "", "info");
      }
    });

  async function deleteFunction(data) {
    var i = 0;
    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      console.log("Deleted: ", element.id, ". Total: ", i);
      await fetch(`${url}/api/v1/livechat/department/${element.id}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
      });
    }

    dataSet = [];
    await getDepartments("all");
    table.replaceData(dataSet);
    console.log("Done Deleting: ", i, " registers.");
    sendNotification("Success!", `Done deleting ${i} registers!`, "success");
    $("#loading").hide();
  }

  async function updateFunction(data) {
    console.log(data);

    var i = 0;
    $("#loading").show();
    console.log("Updated: ", data.id, ". Total: ", i);
    let request = await fetch(`${url}/api/v1/livechat/department/${data.id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": authToken,
        "X-User-Id": userId,
      },
      body: JSON.stringify({
        department: {
          enabled: data.enabled,
          email: data.email,
          showOnRegistration: data.showOnRegistration,
          showOnOfflineForm: data.showOnOfflineForm,
          name: data.name,
        },
      }),
    });

    let response = await request.json();

    console.log(response);

    if (response.success) {
      sendInformation(
        `Success! ${response.department.name} was updated.`,
        "success"
      );
    }
    $("#loading").hide();
  }

  async function enableFunction(data) {
    var i = 0;
    $("#loading").show();
    for (i = 0; i < data.length; i++) {
      const element = data[i];
      console.log("Enabled: ", element.id, ". Total: ", i);
      await fetch(`${url}/api/v1/livechat/department/${element.id}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          department: {
            name: element.name,
            enabled: true,
            showOnRegistration: element.showOnRegistration,
            email: element.email,
            showOnOfflineForm: element.showOnOfflineForm,
          },
        }),
      });
    }

    dataSet = [];
    await getDepartments("all");
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
      console.log("Disabled: ", element.id, ". Total: ", i);
      await fetch(`${url}/api/v1/livechat/department/${element.id}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": authToken,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          department: {
            name: element.name,
            enabled: false,
            showOnRegistration: element.showOnRegistration,
            email: element.email,
            showOnOfflineForm: element.showOnOfflineForm,
          },
        }),
      });
    }

    dataSet = [];
    await getDepartments("all");
    table.replaceData(dataSet);
    sendNotification("Success!", `Done disabling ${i} registers!`, "success");
    console.log("Done disabling: ", i, " registers.");
    $("#loading").hide();
  }
}
