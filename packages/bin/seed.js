require('dotenv').config()

const fetch = require('node-fetch').default
const { waitForSeconds } = require('@users-store/common/utils')

const baseUrl = `http://localhost:${process.env.USER_PORT}`

async function createUser(fields) {
  return fetch(baseUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(fields),
  })
}

async function updateUser(id, fields) {
  return fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(fields),
  })
}

async function main() {
  const users = [
    { name: 'Vasya', newName: 'Vasiliy' },
    { name: 'Petya', newName: 'Peter' },
    { name: 'Vanya', newName: 'Ivan' },
  ]

  for (let i = 0; i < users.length; i++) {
    await waitForSeconds(2 * Math.random())
    const resp = await createUser({ name: users[i].name })
    const data = await resp.json()
    console.log(data)
    users[i].id = data.id
  }

  for (const user of users) {
    await waitForSeconds(2 * Math.random())
    const resp = await updateUser(user.id, { name: user.newName })
    const data = await resp.json()
    console.log(data)
  }
}

main()
