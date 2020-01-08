const axios = require('axios');
require('axios-debug-log')

const querystring = require('querystring');
const setCookie = require('set-cookie-parser');

axios.defaults.maxRedirects = 0
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

axios.interceptors.request.use(request => {
  console.log('Starting Request', request)
  return request
})

module.exports = function() {
  const url = (host, endpoint) => host + endpoint

  var session = null;

  const login = function(host, username, password) {
    var data = querystring.stringify({
      "login_username": username,
      "login_pwd": password,
      "original_target_url": ''
    })

    var config = {
      validateStatus: status => status == 302
    }

    return new Promise((resolve, reject) => {

      // http://aiai.local.kaustik.tech/login/login-check
      axios.post(url(host, '/login/login-check'), data, config)
        .then(response => {
          var cookies = setCookie.parse(response);

          session = cookies[0].value

          resolve(session)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  function getConfig(session) {
    return {
      headers: {
        "Cookie": "PHPSESSID=" + session
      },
      validateStatus: status => status >= 200 && status < 500
    }
  }

  function create_user(host, session, username, firstname, lastname, email) {
    var data = {
      username,
      firstname,
      lastname,
      email
    }

    var config = getConfig(session)

    return new Promise((resolve, reject) => {
      // http://aiai.local.kaustik.tech/api/user-accounts

      axios.post(url(host, '/api/user-accounts'), data, config)
        .then(response => {

          console.log("user: %o", response.data)

          resolve(response.data);
        })
        .catch(error => {
          reject(error.response.data.errors)
        });
    })
  }

  function create_decisions(host, session, decisions) {
    var data = decisions

    var config = getConfig(session)

    return new Promise((resolve, reject) => {
      // http://aiai.local.kaustik.tech/api/user-accounts

      axios.post(url(host, '/api/decisions'), data, config)
        .then(response => {

          console.log("decisions: %o", response.data)

          resolve(response.data);
        })
        .catch(error => {
          reject(error.response.data.errors)
        });
    })
  }

  function make_employee(host, session, id) {
    var data = {
      "id": Number(id)
    }

    console.log("make_employee: %o", data)

    var config = getConfig(session)

    return new Promise((resolve, reject) => {
      // http://aiai.local.kaustik.tech/api/user-accounts

      axios.post(url(host, '/api/employees'), data, config)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error.response.data.errors)
        });
    })
  }

  function get_employee(host, session, id) {
    return new Promise((resolve, reject) => {

      const employeeUrl = url(host, '/api/employees/' + id)

      console.log(employeeUrl)
      console.log(session)
    // http://aiai.local.kaustik.tech/api/employees/{id}

    var config = getConfig(session)

      axios.get(employeeUrl, config)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {

          const errors = error.response.data.errors

          reject(errors)
        });
    })
  }

  return {
    login,
    create_user,
    make_employee,
    create_decisions,
    get_employee
  }
}
