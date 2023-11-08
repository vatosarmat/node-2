const { BaseApp, catchErrors } = require('@users-store/common/app')
const { coerceToIntegerArray, coerceToInteger } = require('@users-store/common/validate-coerce')
const { hasValue } = require('@users-store/common/utils')

const Service = require('./service')

class App extends BaseApp {
  /** @type {Service} */
  service

  constructor(...args) {
    super(...args)
    this.service = new Service(this.client)
  }

  setupRoutes() {
    this.express.get(
      '/',
      catchErrors(async (req, res) => {
        const validated = {}
        if (hasValue(req.query, 'userIds')) {
          validated.userIds = coerceToIntegerArray(req.query.userIds)
        }
        if (hasValue(req.query, 'page')) {
          validated.page = coerceToInteger(req.query.page)
        }
        if (hasValue(req.query, 'perPage')) {
          validated.perPage = coerceToInteger(req.query.perPage)
        }

        res.json(await this.service.getManyEvents(validated))
      })
    )
  }

  listen() {
    this.service.listen()
    super.listen()
  }

  async end() {
    await this.service.end()
    await super.end()
  }
}

module.exports = App
