const axios = require('axios');
require('axios-debug-log')({
  request: function (debug, config) {
    debug('Request with ' + config.headers['content-type'])
  },
  response: function (debug, response) {
    debug(
      'Response with ' + response.headers['content-type'],
      'from ' + response.config.url
    )
  },
  error: function (debug, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug('Boom', error)
  }
})

const querystring = require('querystring');
const setCookie = require('set-cookie-parser');

axios.defaults.maxRedirects = 0
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

axios.interceptors.request.use(request => {
  console.log('Starting Request', request)
  return request
})


module.exports = function() {
  const oauth_token_url = 'https://auth.kaustik.com/oauth/token'

  const url = (host, endpoint) => host + endpoint

  const connect = function(host, client_id, client_secret) {
    var data = querystring.stringify({
      client_id,
      client_secret,
      audience: host,
      grant_type: "client_credentials"
    })

    return new Promise((resolve, reject) => {
      axios.post(oauth_token_url, data)
        .then(response => {
          const access_token=response.data.access_token
          const authentication = { bearer: access_token }
          resolve(authentication)
        })
        .catch(error => {
          console.log("error: %o", error);
          reject(error)
        })
    })
  }

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

          const authentication = { session: cookies[0].value }

          resolve(authentication)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  function getConfig(authentication) {

    console.log("config authentication: %o", authentication)

    return {
      headers: authentication.bearer ? {
        "Authorization": "Bearer " + authentication.bearer
      } : {
        "Cookie": "PHPSESSID=" + authentication.session
      },
      validateStatus: status => status >= 200 && status < 500
    }
  }

  function create_user(host, authentication, username, firstname, lastname, email) {
    var data = {
      username,
      firstname,
      lastname,
      email
    }

    var config = getConfig(authentication)

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

  function create_decisions(host, authentication, decisions) {
    var data = decisions

    var config = getConfig(authentication)

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

  function make_employee(host, authentication, id) {
    var data = {
      "id": Number(id)
    }

    console.log("make_employee: %o", data)

    var config = getConfig(authentication)

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

  function get_employee(host, authentication, id) {
    return new Promise((resolve, reject) => {

      const employeeUrl = url(host, '/api/employees/' + id)

      console.log(employeeUrl)
      console.log(authentication)
    // http://aiai.local.kaustik.tech/api/employees/{id}

      var config = getConfig(authentication)

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

  function get_users(host, authentication) {
    return new Promise((resolve, reject) => {

      const usersUrl = url(host, '/api/users')

      console.log(usersUrl)
      console.log(authentication)
    // http://aiai.local.kaustik.tech/api/employees/{id}

      var config = getConfig(authentication)

      axios.get(usersUrl, config)
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
    connect,
    create_user,
    make_employee,
    create_decisions,
    get_users,
    get_employee
  }
}
