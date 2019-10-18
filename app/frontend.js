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
    $('.tabs').tabs('select', 'getuser');
  } else {
    $("#connect").removeClass("disabled")
  }
}

async function getUser() {
  const data = JSON.stringify({
    host: url.value,
    session: session,
    user_id: user_id.value
  })

  let err, response

  [err, response] = await post("get-employee", data)

  var message

  if (err) {
    message = err
  } else {
    if (Array.isArray(response.err) && response.err.length > 0) {
      message = response.err[0].detail // Just show the first one
    } else {
      const employee = response.employee
      if (employee) {
        message = employee.username + ":" + employee.email
      } else {
        message = "No error, but no content either?"
      }
    }
  }


  $("#messages").text(message)
}
