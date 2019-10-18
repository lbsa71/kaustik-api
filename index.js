'use strict';

const customer = 'C018nxoqz'

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
  const username=req.body.username
  const password=req.body.password

  console.log("api: %o", apiClient);

  let err, session
  [err, session] = await to(apiClient.login(host, username, password))

  console.log("session: %o", session);

  res
    .status(200)
    .send({ session })
    .end();
});

app.post('/get-employee', async (req, res) => {
  const host=req.body.host
  const session=req.body.session
  const id=req.body.user_id

  let err, employee
  [err, employee] = await to(apiClient.get_employee(host, session, id))

  console.log("err: %o", err);
  console.log("employee: %o", employee);

  res
    .status(200)
    .send({ err, employee })
    .end();
});

// Start the server
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`_ App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.')
})
