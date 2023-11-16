const core = require('@actions/core')
const { PortainerAPI } = require('./portainer-api')
const getInputs = require('./inputHandler')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const input = getInputs()
    core.debug('Inputs Retrieved')
    // core.startGroup('Authentication')
    const api = new PortainerAPI(
      input.portainer.url,
      input.portainer.username,
      input.portainer.password,
      true
    )
    await api.authenticate()
    core.info('Retrieved authentication token from Portainer')
    const endpointId = await api.getEndpointId(input.portainer.endpoint)
    // core.endGroup()

    core.startGroup('Create Stack')
    const stack = await api.createOrReplaceStack(
      input.stack.name,
      {
        env: input.stack.env,
        fromAppTemplate: false,
        name: input.stack.name,
        stackFileContent: input.stack.file
      },
      endpointId
    )
    core.info('The Stack', stack)
    core.endGroup()
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
