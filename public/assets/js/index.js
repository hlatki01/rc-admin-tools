
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-form-submit");
  const loginErrorMsg = document.getElementById("login-error-msg");

  function isValidURL(string) {
    var res = string.match(/(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_\/0-9\-#.]*)\??([a-z_\/0-9\-#=&]*)/g);
    console.log(res);
    return (res !== null)
  };

  loginButton.addEventListener("click", (e) => {
    e.preventDefault();

    if (isValidURL(loginForm.serverUrl.value)) {
      if (!loginForm.username.value || !loginForm.password.value || !loginForm.serverUrl.value) {
        sendInformation(`Error: User, Password and Server URL are required`, "error");
      } else {
        login(loginForm.serverUrl.value, loginForm.username.value, loginForm.password.value)
      }

    }
    else {
      sendInformation(`The URL doesn't seems to be a valid Rocket.Chat server`, "error");
    }

  })

  checkConfig()
  function checkConfig() {
    configs = JSON.parse(localStorage.getItem('configs'))

    if (configs) {
      window.location.href = "/tools"
    }
  }


  async function login(url, username, password) {
    $('#loading').show();

    try {
      let response = await fetch(`${url}/api/v1/login`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: username,
          password: password

        })
      })

      let data = await response.json()
      let error = ''

      if (data.status === 'success') {
        $('#loading').hide();

        let isAdmin = data.data.me.roles.includes("admin");
        if (isAdmin) {
          setConfigs(url, username, data.data.authToken, data.data.userId)
          window.location.href = "/tools"
        }
        else {
          sendInformation(`You need to use an admin account in order to perform actions.`, "error");
        }
      }

      if (data.status === 'error') {
        console.log(data);
        $('#loading').hide();
        sendInformation(`Error: ${data.message}`, "error");
      }


    } catch (error) {
      $('#loading').hide();
      sendInformation(`The URL doesn't seems to be a valid Rocket.Chat server`, "error");
    }
  }

  function setConfigs(serverUrl, username, authToken, userId) {
    const configs = {
      serverUrl: serverUrl,
      username: username,
      authToken: authToken,
      userId: userId
    }

    localStorage.setItem('configs', JSON.stringify(configs));

  }
