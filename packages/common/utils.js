/**
 * @param {number} count
 * @param {number} from
 */
const numericRange = (count, from = 0) => {
  return Object.keys(Array(count).fill(0)).map(n => parseInt(n) + from)
}

/**
 * @param {object} obj
 */
const isObjectEmpty = obj => {
  return Object.values(obj).length === 0
}

/**
 * @param {object} obj
 * @param {string[]} keys
 */
const pick = (obj, keys) => {
  const ret = {}
  for (const [key, value] of Object.entries(obj)) {
    if (keys.includes(key)) {
      ret[key] = value
    }
  }

  return ret
}

/**
 * @param {object} obj
 * @param {string[]} keys
 */
const omit = (obj, keys) => {
  const ret = {}
  for (const [key, value] of Object.entries(obj)) {
    if (!keys.includes(key)) {
      ret[key] = value
    }
  }

  return ret
}

const hasValue = (obj, key) => {
  return key in obj && obj[key] !== null && obj[key] !== undefined
}

const waitForSeconds = seconds =>
  new Promise(resolve => {
    setTimeout(resolve, seconds * 1000)
  })

const killProcess = async proc => {
  const closePromise = new Promise(resolve => {
    // proc.on('exit', () => {
    //   // resolve()
    //   console.log('exit')
    // })
    proc.on('close', () => {
      resolve()
      // console.log('closed')
    })
  })
  proc.kill()

  return closePromise
}

exports.numericRange = numericRange
exports.isObjectEmpty = isObjectEmpty
exports.pick = pick
exports.omit = omit
exports.waitForSeconds = waitForSeconds
exports.killProcess = killProcess
exports.hasValue = hasValue
