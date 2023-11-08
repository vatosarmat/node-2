const { Client } = require('pg')
const Bull = require('bull')

const { numericRange } = require('@users-store/common/utils')

/**
 * @typedef {Object} JobData
 * @property {number} userId
 * @property {'created'|'updated'} kind
 * @property {any} fields
 */

/**
 * @typedef {Object} EventsFilter
 * @property {number[]} userIds
 * @property {number} page
 * @property {number} perPage
 */

class Service {
  /**
   * @type Client
   */
  client

  constructor(client) {
    this.client = client
    this.queue = new Bull(process.env.QUEUE_NAME)
    this.queue.on('failed', function (job, err) {
      console.log(job.data)
      console.log(err)
    })
  }

  async end() {
    await this.queue.close()
  }

  async listen() {
    return this.queue.process(async job => {
      return this.recordEvent(job.data)
    })
  }

  async recordEvent({ kind, userId, fields }) {
    return (
      await this.client.query(
        { text: 'insert into events_history(kind,user_id,fields) values($1,$2,$3)' },
        [kind, userId, fields]
      )
    ).rows[0]
  }

  /**
   * @param {EventsFilter}
   */
  async getManyEvents({ userIds, page, perPage = 10 }) {
    let text = 'select * from events_history'
    const params = []

    if (userIds && userIds.length > 0) {
      text += ` where user_id in (${numericRange(userIds.length, params.length + 1)
        .map(num => '$' + num.toString())
        .join(',')})`
      params.push(...userIds)
    }

    params.push(perPage)
    text += ` limit $${params.length}`

    if (page && page > 1) {
      params.push((page - 1) * perPage)
      text += ` offset $${params.length}`
    }

    // console.log(text)
    return (await this.client.query({ text }, params)).rows
  }
}

module.exports = Service
