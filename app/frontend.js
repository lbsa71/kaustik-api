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
    $('#main').removeAttr("style");
    $('#connect-modal').modal("close");
    $('.tabs').tabs('select', 'createuser');
  }
  else {

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

  $("#messages").show().text(message)
}

async function uploadDecision() {
  var file = decisionfile.files[0]

  var reader = new FileReader();

  reader.onload = async function (evt) {

    var table = ""
    var messages = ""

    var decision_csv = evt.target.result

    decision_lines=decision_csv.replace(/\r\n|\n\r|\n|\r/g,"\n").split("\n");

    for(var i=0;i<decision_lines.length;i++)
    {
      var decision_line=decision_lines[i]
      var decision_columns=decision_line.split('\t')

      if(decision_columns.length === 5)
      {
        var client_id=parseInt(decision_columns[0])
        var cost_center=decision_columns[1]
        var name=decision_columns[2]
        var start_date=decision_columns[3]
        var end_date=decision_columns[4]

        decision = {
          clientId:client_id,
          costCenter:cost_center,
          title:name,
          decisionPeriod: {
            start:start_date,
            end:end_date
          },
          useFKTemplate: true
        }

        const data = JSON.stringify({
          host: url.value,
          session: session,
          decision
        })

        let err, response

        [err, response] = await post("create-decision", data)

        var message = getError(err || response.err)

        const response_decision = response.decision
        if (response_decision) {
          message = 'Uploaded decision "' + name + '"'
        } else {
          message = message || "No error for  decision " + (i+1) +", but no content either?"
        }

        messages += message + "</br>"

        $("#messages").show().html(messages)

        table += "<tr><td>"+name+"</td><td>"+start_date+"</td><td>"+end_date+"</td></tr>"
      }

      $("#decisionrows").html(table)
    }
  }

  reader.onerror = function (evt) {
      $("#messages").show().text("error reading file")
  }

  reader.readAsText(file, "UTF-8");
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

  $("#messages").show().text(message)
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

  $("#messages").show().text(message)
}
