const axios = require('axios')
const https = require('https')

class APIError extends Error {
  constructor(error) {
    if (typeof error === 'string') {
      super(error)
    } else if (error instanceof Error) {
      super(error.message)
    } else {
      super('An unexpected API Error occurred')
    }

    // Store original error
    this.originalError = error
    this.name = 'APIError'
  }
}

class PortainerAPI {
  #apiEndpoint
  #username
  #password
  #token = null
  #apiAgent

  constructor(apiEndpoint, username = null, password = null, insecure = false) {
    const url = new URL(apiEndpoint)
    url.pathname = '/api/'
    this.#apiEndpoint = url.href
    this.#username = username
    this.#password = password
    this.#apiAgent = axios.create({
      baseURL: this.#apiEndpoint,
      headers: { 'Content-Type': 'application/json' },
      httpsAgent: insecure
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined
    })
    this.#apiAgent.defaults.validateStatus = false
  }

  get isAuthenticated() {
    return Boolean(this.#token)
  }

  async authenticate() {
    const authEndpoint = '/auth'
    const authData = {
      username: this.#username,
      password: this.#password
    }
    let response
    try {
      response = await this.#apiAgent.post(authEndpoint, authData)
    } catch (error) {
      throw new APIError(error)
    }
    if (response.status === 200 && response.data && response.data.jwt) {
      this.#token = response.data.jwt
      // Add token to the Axios instance header for future requests
      this.#apiAgent.defaults.headers['Authorization'] = `Bearer ${this.#token}`
    } else {
      throw new APIError(`Authentication failed: ${response.data.message}`)
    }
  }

  async getEndpointId(name) {
    try {
      const response = await this.#apiAgent.get('/endpoints')
      if (response.status === 200 && response.data) {
        const localEndpoint = response.data.find(
          endpoint => endpoint.Name === name
        )

        if (localEndpoint) {
          return localEndpoint.Id
        } else {
          return null
        }
      } else {
        throw new APIError(`Failed to get endpointId: ${response.data.message}`)
      }
    } catch (error) {
      throw new APIError(error)
    }
  }

  async getStacks(endpointId = null) {
    try {
      const response = await this.#apiAgent.get(
        `/stacks?filters=${
          endpointId ? JSON.stringify({ EndpointId: endpointId }) : null
        }`
      )

      if (response.status === 200) {
        return response.data
      } else {
        throw new APIError(`Failed to get stacks: ${response.data.message}`)
      }
    } catch (error) {
      throw new APIError(error)
    }
  }

  async getStackByName(stackName, endpointId = null) {
    try {
      const stacks = await this.getStacks(endpointId)
      if (stacks && Array.isArray(stacks)) {
        return stacks.find(
          stack =>
            stack.Name === stackName &&
            (!endpointId || stack.EndpointId === endpointId)
        )
      }
    } catch (error) {
      throw new APIError(error)
    }
  }

  async createOrReplaceStack(stackName, stackConfig, endpointId) {
    // First, check if a stack with the same name already exists
    const existingStack = await this.getStackByName(stackName, endpointId)

    if (existingStack) {
      await this.deleteStack(existingStack.Id, endpointId)
    }
    return this.createNewStack(stackName, stackConfig, endpointId)
  }

  async createNewStack(stackName, stackConfig, endpointId) {
    try {
      const response = await this.#apiAgent.post(
        '/stacks/create/standalone/string',
        stackConfig, // This should match the expected schema
        {
          params: {
            endpointId
          }
        }
      )

      if (response.status === 200) {
        return response.data
      } else {
        throw new APIError(`Failed to create stack: ${response.data.message}`)
      }
    } catch (error) {
      throw new APIError(error)
    }
  }

  async deleteStackByName(stackName, endpointId) {
    const existingStack = await this.getStackByName(stackName, endpointId)
    if (existingStack) {
      return this.deleteStack(existingStack.Id, endpointId)
    }
    throw new APIError(`A stack with the name '${stackName}' not found.`)
  }

  async deleteStack(stackId, endpointId) {
    try {
      const response = await this.#apiAgent.delete(`/stacks/${stackId}`, {
        params: {
          endpointId
        }
      })

      if (response.status === 200 || response.status === 204) {
        return true
      } else {
        throw new APIError(`Failed to delete stack: ${response.data.message}`)
      }
    } catch (error) {
      throw new APIError(error)
    }
  }
}

module.exports = {
  APIError,
  PortainerAPI
}
