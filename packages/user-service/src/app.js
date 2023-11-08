const { BaseApp, catchErrors } = require('@users-store/common/app')
const { coerceToNonEmptyString, coerceToInteger } = require('@users-store/common/validate-coerce')

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
        res.json(await this.service.getManyUsers())
      })
    )

    this.express.post(
      '/',
      catchErrors(async (req, res) => {
        const validated = {
          name: coerceToNonEmptyString(req.body.name),
        }
        res.json(await this.service.addUser(validated))
      })
    )

    this.express.put(
      '/:id',
      catchErrors(async (req, res) => {
        const id = coerceToInteger(req.params.id)
        const validated = {
          name: coerceToNonEmptyString(req.body.name),
        }
        res.json(await this.service.updateUser(id, validated))
      })
    )
  }

  async end() {
    await this.service.end()
    await super.end()
  }
}

module.exports = App
