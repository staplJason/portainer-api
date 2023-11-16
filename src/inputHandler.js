const core = require('@actions/core')
const fs = require('fs')

function getPortainerInputs() {
  try {
    return {
      url: core.getInput('portainer-url', { required: true }),
      username: core.getInput('portainer-username', { required: true }),
      password: core.getInput('portainer-password', { required: true }),
      endpoint: core.getInput('portainer-endpoint') || 'local'
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

function _stringToNameValuePairs(str) {
  const obj = JSON.parse(str)

  if (Object.keys(obj).length === 0) {
    return []
  }
  const pairs = []
  // eslint-disable-next-line prefer-const
  for (let key in obj) {
    pairs.push({
      name: key,
      value: obj[key]
    })
  }
  return pairs
}

function getStackInputs() {
  let stack = {}
  try {
    stack = {
      name: core.getInput('stack-name', { required: true }),
      filePath: core.getInput('stack-file', { required: true }),
      env: _stringToNameValuePairs(core.getInput('stack-env') || '{}'),
      delete: !!core.getInput('delete', { required: false }).length,
      prune: !!core.getInput('prune', { required: false }).length
    }
    stack.file = fs.readFileSync(stack.filePath, 'utf-8')
    return stack
  } catch (error) {
    core.setFailed(error.message)
    throw new Error(error.message)
  }
}

module.exports = function getInputs() {
  return {
    portainer: getPortainerInputs(),
    stack: getStackInputs()
  }
}
