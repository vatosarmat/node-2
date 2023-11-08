const { Client } = require('pg')
const Bull = require('bull')

const { pick } = require('@users-store/common/utils')

class Service {
  /**
   * @type Client
   */
  client

  constructor(client) {
    this.client = client
    this.queue = new Bull(process.env.QUEUE_NAME)
  }

  async end() {
    await this.queue.close()
  }

  async addUser(data) {
    const ret = (
      await this.client.query({ text: 'insert into users(name) values($1) returning *' }, [
        data.name,
      ])
    ).rows[0]

    await this.queue.add({ userId: ret.id, kind: 'created', fields: pick(ret, ['name']) })

    return ret
  }

  async updateUser(id, data) {
    const ret = (
      await this.client.query({ text: `update users set name=$1 where id=$2 returning *` }, [
        data.name,
        id,
      ])
    ).rows[0]

    await this.queue.add({ userId: ret.id, kind: 'updated', fields: pick(ret, ['name']) })

    return ret
  }

  async getManyUsers() {
    return (await this.client.query({ text: 'select * from users order by id' })).rows
  }
}

module.exports = Service
