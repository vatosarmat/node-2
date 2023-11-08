const { isObjectEmpty, pick } = require('./utils')

class ValidateCoerceError extends Error {
  constructor(funcName, input, params) {
    super('Invalid input')
    this.funcName = funcName
    this.input = input
    if (params) {
      this.params = params
    }
  }

  toObject() {
    const ret = pick(this, ['message', 'funcName', 'input'])

    if (this.params) {
      ret.params = this.params
    }

    return ret
  }
}

/**
 * @param {unknown} v
 * @param {number} min
 * @param {number} max
 */
const coerceToInteger = (input, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) => {
  let ret
  if (typeof input === 'string') {
    ret = Number.parseInt(input.trim())
  } else {
    ret = Number.parseInt(input)
  }

  if (Number.isInteger(ret) && ret >= min && ret <= max) {
    return ret
  }

  const params = {}
  if (Number.isFinite(min)) {
    params.min = min
  }

  if (Number.isFinite(max)) {
    params.max = max
  }

  throw new ValidateCoerceError(
    'coerceToInteger',
    input,
    isObjectEmpty(params) ? undefined : params
  )
}

/**
 * @param {unknown} input
 */
const coerceToIntegerArray = input => {
  return [input].flat().map(item => coerceToInteger(item))
}

/**
 * @param {unknown} input
 */
const coerceToNonEmptyString = input => {
  if (input && typeof input !== 'object') {
    const ret = input.toString().trim()
    if (ret) {
      return ret
    }
  }

  throw new ValidateCoerceError('coerceToNonEmptyString', input)
}

exports.ValidateCoerceError = ValidateCoerceError
exports.coerceToInteger = coerceToInteger
exports.coerceToIntegerArray = coerceToIntegerArray
exports.coerceToNonEmptyString = coerceToNonEmptyString
