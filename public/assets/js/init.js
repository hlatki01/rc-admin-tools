let configs = ''
let maxActiveUsers = 0
let activeUsers = 0

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

    maxActiveUsers = configs.maxUsers.maxActiveUsers
    activeUsers = configs.maxUsers.activeUsers

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
