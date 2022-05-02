
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