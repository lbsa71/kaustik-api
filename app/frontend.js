var session
var tabs

function to(promise) {
  return promise.then(data => {
      return [null, data];
    })
    .catch(err => [err]);
}

function post(url, data) {
  return to($.ajax({
    type: 'POST',
    url: url,
    data: data,
    dataType: 'json',
    contentType: "application/json"
  }))
}

async function connect() {
  const data = JSON.stringify({
    host: url.value,
    username: login.value,
    password: pwd.value
  })

  let err, response

  [err, response] = await post("connect", data)

  session = err ? null : response.session

  $(".tab").toggleClass("disabled", !session)

  if (session) {
    $('.tabs').tabs('select', 'createuser');
  } else {
    $("#connect").removeClass("disabled")
  }
}

function getError(err)
{
  if (err && Array.isArray(err) && err.length > 0) {
    return err[0].detail // Just return the first one
  }

  return err
}

async function getEmployee() {
  const data = JSON.stringify({
    host: url.value,
    session: session,
    user_id: user_id.value
  })

  let err, response

  [err, response] = await post("get-employee", data)

  var message = getError(err || response.err)

  const employee = response.employee
  if (employee) {
    message = employee.username + ":" + employee.email
  } else {
    message = message || "No error, but no content either?"
  }

  $("#messages").text(message)
}

async function makeUserEmployee() {
  const data = JSON.stringify({
    host: url.value,
    session: session,
    user_id: role_user_id.value
  })

  let err, response

  [err, response] = await post("make-employee", data)

  var message = getError(err || response.err)

  const user = response.user
  if (user) {
    message = "Made " + user.username + ":" + user.email + " into an employee."

    $('.tabs').tabs('select', 'getuser');

  } else {
    message = message || "No error, but no content either?"
  }

  $("#messages").text(message)
}

async function createUser() {
  const data = JSON.stringify({
    host: url.value,
    session: session,
    username: username.value,
    email: email.value,
    firstname: firstname.value,
    lastname: lastname.value,
  })

  let err, response

  [err, response] = await post("create-user", data)

  var message = getError(err || response.err)

  const user = response.user
  if (user) {
    message = "Created user " + user.id + ": " + user.username

    user_id.value = user.id
    role_user_id.value = user.id

    $('.tabs').tabs('select', 'assignrole');

  } else {
    message = message || "No error, but no content either?"
  }

  $("#messages").text(message)
}
