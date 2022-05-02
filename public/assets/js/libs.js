
async function sendNotification(title, text, icon) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: 'ok'
      })

}