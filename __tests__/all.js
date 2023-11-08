const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const {} = require('jest')
const request = require('supertest')

const child_process = require('node:child_process')

const UserApp = require('../packages/user-service/src/app')
const HistoryApp = require('../packages/history-service/src/app')
const { killProcess, waitForSeconds } = require('../packages/common/utils')

let historyServiceProcess
/** @type UserApp */
let userApp
let historyApp

beforeAll(async () => {
  //spawn history service and wait for print 'listening PORT'
  await new Promise((resolve, reject) => {
    historyServiceProcess = child_process.spawn(
      'node',
      [path.join(__dirname, '..', 'packages', 'history-service', 'src', 'index.js')],
      {
        env: { ...process.env, PORT: process.env.HISTORY_PORT },
      }
    )

    historyServiceProcess.on('error', err => {
      console.log(err)
    })

    historyServiceProcess.stdout.setEncoding('utf8')
    historyServiceProcess.stdout.on('error', err => {
      console.log(err)
    })
    historyServiceProcess.stdout.on('data', chunk => {
      if (chunk.includes(`listening ${process.env.HISTORY_PORT}`)) {
        resolve()
      }
    })
  })
})

test('all in one', async () => {
  userApp = new UserApp(process.env.USER_PORT)
  await userApp.setup()

  let R = request(userApp.express)

  const expectedEvents = []
  let ivanId

  //test post
  let response = await R.post('/').send({ name: 'Vanya' })
  expect(response.statusCode).toBe(200)
  expect(response.body).toMatchObject({ name: 'Vanya' })
  expectedEvents.push({ kind: 'created', fields: { name: 'Vanya' } })

  //test put
  response = await R.put(`/${response.body.id}`).send({ name: 'Ivan' })
  expect(response.statusCode).toBe(200)
  expect(response.body).toMatchObject({ id: response.body.id, name: 'Ivan' })
  expectedEvents.push({ kind: 'updated', fields: { name: 'Ivan' } })
  ivanId = response.body.id

  // //add some more
  for (const name of ['Pit', 'Vasya', 'Greg']) {
    await R.post('/').send({ name })
    expectedEvents.push({ kind: 'created', fields: { name } })
  }

  // //test getMany
  response = await R.get(`/`)
  expect(response.statusCode).toBe(200)
  expect(response.body).toMatchObject([
    { name: 'Ivan' },
    { name: 'Pit' },
    { name: 'Vasya' },
    { name: 'Greg' },
  ])

  await killProcess(historyServiceProcess)
  historyServiceProcess = null

  //test history getManyEvents
  historyApp = new HistoryApp(process.env.HISTORY_PORT)
  await historyApp.setup()
  R = request(historyApp.express)

  response = await R.get(`/`)
  expect(response.statusCode).toBe(200)
  expect(response.body).toMatchObject(expectedEvents)

  response = await R.get(`/?perPage=2&page=1`)
  expect(response.statusCode).toBe(200)
  expect(response.body).toMatchObject(expectedEvents.slice(0, 2))

  response = await R.get(`/?perPage=3&page=2`)
  console.log(response)
  expect(response.statusCode).toBe(200)
  expect(response.body).toMatchObject(expectedEvents.slice(3, 6))

  response = await R.get(`/?userIds=${ivanId}`)
  expect(response.statusCode).toBe(200)
  expect(response.body).toMatchObject([
    { kind: 'created', fields: { name: 'Vanya' } },
    { kind: 'updated', fields: { name: 'Ivan' } },
  ])
})

afterAll(async () => {
  if (historyServiceProcess) {
    await killProcess(historyServiceProcess)
  }

  if (userApp) {
    await userApp.end()
  }

  if (historyApp) {
    await historyApp.end()
  }
})
