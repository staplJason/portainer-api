const core = require('@actions/core')
const { APIError, PortainerAPI } = require('../src/portainer-api')
const dotconfig = require('dotenv').config()

if (dotconfig.error) {
  throw new Error('Failed to load .env file!')
}

// Fetch environment variables

const PORTAINER_URL = process.env.PORTAINER_URL
const PORTAINER_USERNAME = process.env.PORTAINER_USERNAME
const PORTAINER_PASSWORD = process.env.PORTAINER_PASSWORD

const commonStackName = 'jesttest-service'
const stackCompose = `
version: "3"
services:
  jesttest-test-appi:
    image: "traefik/whoami"
    container_name: "jesttest-test-appi"
    environment:
      - WHOAMI_PORT_NUMBER=8080
      - WHOAMI_NAME=jesttest-test-api
    restart: unless-stopped
    networks:
     - deploystack_default

networks:
  deploystack_default:
    external: true
`

const stackConfig_A = {
  env: [
    {
      name: 'MYENV_VAR',
      value: 'STACKA'
    }
  ],
  fromAppTemplate: false,
  name: commonStackName,
  stackFileContent: stackCompose
}

const stackConfig_B = {
  env: [
    {
      name: 'MYENV_VAR',
      value: 'STACKB'
    }
  ],
  fromAppTemplate: false,
  name: commonStackName,
  stackFileContent: stackCompose
}

let api
let endpointId

describe('Portainer API bad data tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should create an APIError', () => {
    expect(new APIError(1)).toBeInstanceOf(APIError)
  })

  it('should handle bad url', async () => {
    const localAPI = new PortainerAPI(
      'https://abad.url.localhost:8443',
      PORTAINER_USERNAME,
      PORTAINER_PASSWORD,
      true
    )

    await expect(async () => {
      await localAPI.authenticate()
    }).rejects.toThrow(new APIError('getaddrinfo ENOTFOUND abad.url.localhost'))
  })

  it('should handle authentication failure', async () => {
    const localAPI = new PortainerAPI(
      PORTAINER_URL,
      PORTAINER_USERNAME,
      'invalidpass',
      true
    )

    await expect(async () => {
      await localAPI.authenticate()
    }).rejects.toThrow(
      new APIError('Authentication failed: Invalid credentials')
    )
  })
})

describe('Portainer API Functions before auth', () => {
  const localAPI = new PortainerAPI(
    PORTAINER_URL,
    PORTAINER_USERNAME,
    PORTAINER_PASSWORD,
    true
  )
  it('Should fail noauthtoken calling getEndpointId', async () => {
    await expect(async () => {
      const localEndpointid = await localAPI.getEndpointId('local')
    }).rejects.toThrow(
      new APIError(
        'Failed to get endpointId: A valid authorisation token is missing'
      )
    )
  })
  it('Should fail noauthtoken calling getStacks', async () => {
    await expect(async () => {
      const localStacks = await localAPI.getStacks(0)
    }).rejects.toThrow(
      new APIError(
        'Failed to get stacks: A valid authorisation token is missing'
      )
    )
  })

  it('Should fail noauthtoken calling createStack', async () => {
    await expect(async () => {
      const localStacks = await localAPI.createNewStack('nostack', 0)
    }).rejects.toThrow(
      new APIError(
        'Failed to create stack: A valid authorisation token is missing'
      )
    )
  })

  it('Should fail noauthtoken calling getStackByName', async () => {
    await expect(async () => {
      const localStacks = await localAPI.getStackByName('nostack')
    }).rejects.toThrow(
      //cant get stacks to search by name if not authorized
      new APIError(
        'Failed to get stacks: A valid authorisation token is missing'
      )
    )
  })

  it('Should fail noauthtoken calling deleteStack', async () => {
    await expect(async () => {
      const result = await localAPI.deleteStack(0, 0)
    }).rejects.toThrow(
      new APIError(
        'Failed to delete stack: A valid authorisation token is missing'
      )
    )
  })

  //
})

describe('Portainer API Functions after auth', () => {
  const localAPI = new PortainerAPI(
    PORTAINER_URL,
    PORTAINER_USERNAME,
    PORTAINER_PASSWORD,
    true
  )
  localAPI.authenticate()

  it('Should get auth status', async () => {
    expect(localAPI.isAuthenticated).toBe(true)
  })

  it('Should get null endpointId', async () => {
    const localEndpointid = await localAPI.getEndpointId('???')
    expect(localEndpointid).toEqual(null)
  })

  //used in further tests
  let commonEndpointId
  it('Should get local endpointId', async () => {
    commonEndpointId = await localAPI.getEndpointId('local')
    expect(commonEndpointId).toBeGreaterThan(-1)
  })

  it('Should create a stack', async () => {
    const result = await localAPI.createNewStack(
      commonStackName,
      stackConfig_A,
      commonEndpointId
    )
    expect(result.Name).toBe(commonStackName)
    expect(result.Env[0].value).toBe('STACKA')
  })

  it('Should get stacks', async () => {
    const stacks = await localAPI.getStacks(commonEndpointId)
    expect(Array.isArray(stacks)).toBe(true)
    expect(stacks.length > 0).toBe(true)
  })

  it('Should create a stackb', async () => {
    const result = await localAPI.createOrReplaceStack(
      commonStackName,
      stackConfig_B,
      commonEndpointId
    )
    expect(result.Name).toBe(commonStackName)
    expect(result.Env[0].value).toBe('STACKB')
  })

  it('Should get stack by name if exists', async () => {
    const stack = await localAPI.getStackByName(commonStackName)
    expect(stack.Name).toBe(commonStackName)
    expect(stack.Env[0].value).toBe('STACKB')
  })

  it('Should delete a stack by name', async () => {
    const result = await localAPI.deleteStackByName(
      commonStackName,
      commonEndpointId
    )
    expect(result).toBe(true)
  })
  it('Should fail delete nonexistent stack', async () => {
    await expect(async () => {
      const result = await localAPI.deleteStackByName('???', commonEndpointId)
    }).rejects.toThrow(new APIError("A stack with the name '???' not found."))
  })

  //
})
