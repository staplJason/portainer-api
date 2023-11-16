/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const main = require('../src/main')
require('dotenv').config()

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
// const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets the inputs', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'portainer-url':
          return process.env.PORTAINER_URL
        case 'portainer-username':
          return process.env.PORTAINER_USERNAME
        case 'portainer-password':
          return process.env.PORTAINER_PASSWORD
        case 'portainer-endpoint':
          return 'local'
        case 'stack-file':
          return 'stack-test.yaml'
        case 'stack-name':
          return 'teststack'
        case 'stack-env':
          return JSON.stringify({ appID: 'test', appSecret: 'mysecret' })
        case 'delete':
          return ''
        case 'prune':
          return ''
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(1, 'Inputs Retrieved')
  })

  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'portainer-url':
          throw new Error('Input required and not supplied: portainer-url')
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: portainer-url'
    )
  })
})
