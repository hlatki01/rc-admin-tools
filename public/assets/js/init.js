let configs = ''

checkConfig()
function checkConfig() {
  configs = JSON.parse(localStorage.getItem('configs'))

  if (!configs.authToken) {
    window.location.href = "/"
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
