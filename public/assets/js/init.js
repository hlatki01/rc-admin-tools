let configs = ''

checkConfig()
function checkConfig() {
  configs = JSON.parse(localStorage.getItem('configs'))

  if (!configs) {
    sendInformation(`You need to login to perform actions!`, "error");

    setTimeout( function() {
      window.location.href = "/"
    }, 1200);
  }
  else {
    $('#serverUrl').text(configs.serverUrl)
    $('#username').text(configs.username)

  }
}

function destroySession() {
  localStorage.clear()
  window.location.href = "/"
}

const url = configs.serverUrl;
const authToken = configs.authToken;
const userId = configs.userId;
const currentUser = configs.username;
