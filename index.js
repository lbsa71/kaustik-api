'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const kaustikApi = require('./kaustik-api');

const apiClient = kaustikApi();

const app = express();
app.use('/', express.static('app/index.html'))
app.use(express.static('app'))

app.use(bodyParser.json());

function to(promise) {
  return promise.then(data => {
      return [null, data];
    })
    .catch(err => [err]);
}

app.post('/connect', async (req, res) => {
  const host=req.body.host
  const oauth_token_url=req.body.oauth_token_url
  const client_id=req.body.client_id
  const client_secret=req.body.client_secret

  console.log("authentication: %o %o %o %o", host, oauth_token_url, client_id, client_secret);

  let err, authentication
  [err, authentication] = await to(apiClient.connect(host, oauth_token_url, client_id, client_secret))

  console.log("authentication: %o", authentication);

  res
    .status(200)
    .send({ authentication })
    .end();
});

app.post('/login', async (req, res) => {
  const host=req.body.host
  const username=req.body.username
  const password=req.body.password

  console.log("api: %o", apiClient);

  let err, authentication
  [err, authentication] = await to(apiClient.login(host, username, password))

  console.log("authentication: %o", authentication);

  res
    .status(200)
    .send({ authentication })
    .end();
});

app.post('/get-employee', async (req, res) => {
  const host=req.body.host
  const authentication=req.body.authentication
  const id=req.body.user_id

  let err, employee
  [err, employee] = await to(apiClient.get_employee(host, authentication, id))

  console.log("err: %o", err);
  console.log("employee: %o", employee);

  res
    .status(200)
    .send({ err, employee })
    .end();
});

app.post('/create-user', async (req, res) => {
  const host=req.body.host
  const authentication=req.body.authentication
  const username=req.body.username
  const firstname=req.body.firstname
  const lastname=req.body.lastname
  const email=req.body.email

  let err, response
  [err, response] = await to(apiClient.create_user(host, authentication, username, firstname, lastname, email))

  err = err ? err : response.errors
  const user = err ? null : response

  res
    .status(200)
    .send({ err, user })
    .end();
});

app.post('/make-employee', async (req, res) => {
  const host=req.body.host
  const authentication=req.body.authentication
  const id=req.body.user_id

  let err, response
  [err, response] = await to(apiClient.make_employee(host, authentication, id))

  err = err ? err : response.errors
  const user = err ? null : response

  res
    .status(200)
    .send({ err, user })
    .end();
});


app.post('/create-decision', async (req, res) => {
  const host=req.body.host
  const authentication=req.body.authentication
  var decision=req.body.decision

  let err, response
  [err, response] = await to(apiClient.create_decisions(host, authentication, decision))

  err = err ? err : response.errors
  decision = err ? null : response

  res
    .status(200)
    .send({ err, decision })
    .end();
});

// Start the server
const PORT = process.env.PORT || 8080

// apiClient.connect(
//   'https://test.aiai.se',
//   'https://dev-2fg8ddtm.eu.auth0.com/oauth/token',
//   '93USQT945l2HKcMBQh7EvkTNotPSMJRi',
//   'jITDsSsDZVPfr_bOVM0G2RiJNwrBxx-0koB7fPMqAfNK7VydARA5Qm_jXk1ryHvB'
// ).then(authentication => {
//     console.log("authentication: %o", authentication);
// })


app.listen(PORT, () => {
  console.log(`_ App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.')
})
