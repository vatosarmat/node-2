const express = require('express')
const compression = require('compression')

const { Client } = require('pg')

const { toAppError } = require('./error')

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  const appError = toAppError(err)
  res.status(appError.code).json(appError.toObject())
}

const notFoundHandler = (req, res) => {
  res.status(404).json({ code: 404, message: 'No such resource' })
}

const catchErrors = handler => (req, res, next) => {
  handler(req, res, next).catch(error => {
    return next(error)
  })
}

class BaseApp {
  /** @type {Client} */
  client

  constructor(port) {
    this.port = port
    this.express = express()
    this.client = new Client({
      user: process.env.PGUSER.toString(),
      password: process.env.PGPASSWORD.toString(),
      database: process.env.PGDATABASE.toString(),
    })
  }

  async setup() {
    await this.client.connect()

    if (process.env.NODE_ENV !== 'test') {
      this.express.use(compression())
    }

    this.express.use(express.json())

    this.setupRoutes()

    this.express.use(notFoundHandler)
    this.express.use(errorHandler)
  }

  setupRoutes() {}

  listen() {
    this.express.listen(this.port, () => {
      console.log(`listening ${this.port}`)
    })
  }

  async end() {
    await this.client.end()
  }
}

exports.BaseApp = BaseApp
exports.catchErrors = catchErrors
