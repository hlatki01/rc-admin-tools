async function sendNotification(title, text, icon) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: 'ok'
      })

}

async function sendInformation(text, icon){
  Swal.fire({
    position: 'top-end',
    icon: icon,
    title: text,
    showConfirmButton: false,
    timer: 1300,
    toast: true
  })
}

async function sendConfirmation(text, icon){
  return Swal.fire({
    title: text,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Yes',
    denyButtonText: 'No',
  }).then((result) => {
    return result
  })
}

var dateFilterEditor = function(cell, onRendered, success, cancel, editorParams){

	var container = $("<span></span>")
	//create and style input
	var start = $("<input type='date' placeholder='Start'/>");
	var end = $("<input type='date' placeholder='End'/>");

	container.append(start).append(end);

	var inputs = $("input", container);


	inputs.css({
		"padding":"4px",
		"width":"50%",
		"box-sizing":"border-box",
	})
	.val(cell.getValue());

	function buildDateString(){
		return {
			start:start.val(),
			end:end.val(),
		};
	}

	//submit new value on blur
	inputs.on("change blur", function(e){
		success(buildDateString());
	});

	//submit new value on enter
	inputs.on("keydown", function(e){
		if(e.keyCode == 13){
			success(buildDateString());
		}

		if(e.keyCode == 27){
			cancel();
		}
	});

	return container[0];
}


function dateFilterFunction(headerValue, rowValue, rowData, filterParams){
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

   	var format = filterParams.format || "DD/MM/YYYY - HH:mm:ss";
   	var start = moment(headerValue.start);
   	var end = moment(headerValue.end);
   	var value = moment(rowValue, format)
       
   	if(rowValue){
   		if(start.isValid()){
   			if(end.isValid()){
   				return value >= start && value <= end;
   			}else{
   				return value >= start;
   			}
   		}else{
   			if(end.isValid()){
   				return value <= end;
   			}
   		}
   	}

    return false; //must return a boolean, true if it passes the filter.
}
