const got = require('got')

const validateSearchParameters = (pagingParameters) => {
  const searchParams = {}
  const { limit = 100, before, after } = pagingParameters || {}

  if (typeof limit !== 'number') throw new TypeError('limit should be a number')
  if (limit < 0 && limit > 100) throw new RangeError('limit should be more than 0 or no more than 100')
  searchParams.limit = limit

  if (before) {
    if (typeof before !== 'string') throw new TypeError('before should be a uuid of type string')
    searchParams.before = before
  } else if (after) {
    if (typeof after !== 'string') throw new TypeError('after should be a uuid of type string')
    searchParams.after = after
  }
  return searchParams
}

/** Class representing a Ponto client. */
class Ponto {
  #hostName = 'api.myponto.com'
  #url
  #auth
  #accessToken
  #acccessTokenExpirationTimestamp

  /**
   * Create a Ponto client.
   *
   * @param {string} clientId - The ponto client id.
   * @param {string} clientSecret - The ponto client secret.
   * @param {boolean} [sandboxMode=false] - Use sandbox mode.
   */
  constructor (clientId, clientSecret, sandboxMode = false) {
    this.#url = (sandboxMode) ? `https://${this.#hostName}/sandbox/` : `https://${this.#hostName}/`
    this.sandboxMode = sandboxMode
    this.#auth = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    this.#accessToken = undefined
    this.#acccessTokenExpirationTimestamp = 0
  }

  /**
   * Get's the AccessToken
   *
   * @private
   * @returns {Promise} Promise object represents the response with accessToken
   */
  async #getAccessToken () {
    return got.post(`https://${this.#hostName}/oauth2/token`, {
      searchParams: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: this.#auth
      },
      responseType: 'json',
      resolveBodyOnly: true
    })
  }

  /**
   * Check if we have an AccessToken and if it is not expired and get one if necessary
   *
   * @private
   * @returns {Promise} Promise
   */
  async #checkAccessToken () {
    if (!this.#accessToken || this.#acccessTokenExpirationTimestamp < Date.now()) {
      const token = await this.#getAccessToken()
      this.#accessToken = token.access_token
      this.#acccessTokenExpirationTimestamp = Date.now() + ((token.expires_in - 20) * 1000) // expires_in = Amount of time the access token is valid, in seconds
    }
  }

  /**
   * Get a list of Financial Institutions
   *
   * @param {object} pagingParameters - paging parameters object
   * @param {number} pagingParameters.limit - amount of Financial Institutions to return
   * @param {string} pagingParameters.before - cursor to get Financial Institutions before this Financial Institution
   * @param {string} pagingParameters.after cursor to get Financial Institutions after this Financial Institution
   * @returns {Promise} Promise object represents a list of Financial Institutions
   */
  async listFinancialInstitutions (pagingParameters) {
    const searchParams = validateSearchParameters(pagingParameters)

    await this.#checkAccessToken()

    const body = await got.get(`${this.#url}financial-institutions`, {
      searchParams,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })

    const { meta: { paging: { limit, before, after } } } = body
    if (before) {
      body.previous = () => {
        return this.listFinancialInstitutions({ limit, before })
      }
    }
    if (after) {
      body.next = () => {
        return this.listFinancialInstitutions({ limit, after })
      }
    }
    return body
  }

  /**
   * Get a Financial Institution
   *
   * @param {string} financialInstitutionId - id of a Financial Institution
   * @returns {Promise} Promise object represents a Financial Institution
   */
  async getFinancialInstitution (financialInstitutionId) {
    if (!financialInstitutionId) throw new Error('financialInstitutionId is required')
    if (typeof financialInstitutionId !== 'string') throw new TypeError('financialInstitutionId should be of type string')

    await this.#checkAccessToken()

    return got(`${this.#url}financial-institutions/${financialInstitutionId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })
  }

  /**
   * Get a list of Accounts for a Financial Institution
   *
   * @param {string} financialInstitutionId id of a Financial Institution
   * @param {object} pagingParameters - paging parameters object
   * @param {number} pagingParameters.limit - amount of Financial Institutions to return
   * @param {string} pagingParameters.before - cursor to get Financial Institutions before this Financial Institution
   * @param {string} pagingParameters.after cursor to get Financial Institutions after this Financial Institution
   * @returns {Promise} Promise object represents a list of your accounts
   */
  async listFinancialInstitutionAccounts (financialInstitutionId, pagingParameters) {
    if (!this.sandboxMode) throw new Error('listFinancialInstitutionAccounts is Sandbox only, use listAccounts instead')

    if (!financialInstitutionId) throw new Error('financialInstitutionId is required')
    if (typeof financialInstitutionId !== 'string') throw new TypeError('financialInstitutionId should be of type string')

    const searchParams = validateSearchParameters(pagingParameters)

    await this.#checkAccessToken()

    const body = await got.get(`${this.#url}financial-institutions/${financialInstitutionId}/financial-institution-accounts`, {
      searchParams,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })

    const { meta: { paging: { limit, before, after } } } = body
    if (before) {
      body.previous = () => {
        return this.listFinancialInstitutionAccounts(financialInstitutionId, { limit, before })
      }
    }
    if (after) {
      body.next = () => {
        return this.listFinancialInstitutionAccounts(financialInstitutionId, { limit, after })
      }
    }
    return body
  }

  /**
   * Get an Account for a Financial Institution
   *
   * @param {string} financialInstitutionId - id of a Financial Institution
   * @param {string} financialInstitutionAccountId - id of an Account
   * @returns {Promise} Promise object represents an Account
   */
  async getFinancialInstitutionAccount (financialInstitutionId, financialInstitutionAccountId) {
    if (!this.sandboxMode) throw new Error('getFinancialInstitutionAccount is Sandbox only, use getAccount instead')

    if (!financialInstitutionId) throw new Error('financialInstitutionId is required')
    if (typeof financialInstitutionId !== 'string') throw new TypeError('financialInstitutionId should be of type string')

    if (!financialInstitutionAccountId) throw new Error('financialInstitutionAccountId is required')
    if (typeof financialInstitutionAccountId !== 'string') throw new TypeError('financialInstitutionAccountId should be of type string')

    await this.#checkAccessToken()

    return got.get(`${this.#url}financial-institutions/${financialInstitutionId}/financial-institution-accounts/${financialInstitutionAccountId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })
  }

  /**
   * Get a list of Transactions for a Financial Institution
   *
   * @param {string} financialInstitutionId - id of a Financial Institution
   * @param {string} financialInstitutionAccountId - id of a Financial Institution Account
   * @param {object} pagingParameters - paging parameters object
   * @param {number} pagingParameters.limit - amount of Financial Institutions to return
   * @param {string} pagingParameters.before - cursor to get Financial Institutions before this Financial Institution
   * @param {string} pagingParameters.after cursor to get Financial Institutions after this Financial Institution
   * @returns {Promise} Promise object represents a list of your transactions
   */
  async listFinancialInstitutionTransactions (financialInstitutionId, financialInstitutionAccountId, pagingParameters) {
    if (!this.sandboxMode) throw new Error('listFinancialInstitutionTransactions is Sandbox only, use listAccounts instead')

    if (!financialInstitutionId) throw new Error('financialInstitutionId is required')
    if (typeof financialInstitutionId !== 'string') throw new TypeError('financialInstitutionId should be of type string')

    if (!financialInstitutionAccountId) throw new Error('financialInstitutionAccountId is required')
    if (typeof financialInstitutionAccountId !== 'string') throw new TypeError('financialInstitutionAccountId should be of type string')

    const searchParams = validateSearchParameters(pagingParameters)

    await this.#checkAccessToken()

    const body = await got.get(`${this.#url}financial-institutions/${financialInstitutionId}/financial-institution-accounts/${financialInstitutionAccountId}/financial-institution-transactions`, {
      searchParams,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })

    const { meta: { paging: { limit, before, after } } } = body
    if (before) {
      body.previous = () => {
        return this.listFinancialInstitutionTransactions(financialInstitutionId, financialInstitutionAccountId, { limit, before })
      }
    }
    if (after) {
      body.next = () => {
        return this.listFinancialInstitutionTransactions(financialInstitutionId, financialInstitutionAccountId, { limit, after })
      }
    }
    return body
  }

  /**
   * Get a Transaction  for a Financial Institution
   *
   * @param {string} financialInstitutionId - id of a Financial Institution
   * @param {string} financialInstitutionAccountId - id of a Financial Institution Account
   * @param {string}financialInstitutionTransactionId - id of a Financial Institution Account Transaction
   * @returns {Promise} Promise object represents a transaction
   */
  async getFinancialInstitutionTransaction (financialInstitutionId, financialInstitutionAccountId, financialInstitutionTransactionId) {
    if (!this.sandboxMode) throw new Error('getFinancialInstitutionAccount is Sandbox only, use getAccount instead')

    if (!financialInstitutionId) throw new Error('financialInstitutionId is required')
    if (typeof financialInstitutionId !== 'string') throw new TypeError('financialInstitutionId should be of type string')

    if (!financialInstitutionAccountId) throw new Error('financialInstitutionAccountId is required')
    if (typeof financialInstitutionAccountId !== 'string') throw new TypeError('financialInstitutionAccountId should be of type string')

    if (!financialInstitutionTransactionId) throw new Error('financialInstitutionTransactionId is required')
    if (typeof financialInstitutionTransactionId !== 'string') throw new TypeError('financialInstitutionTransactionId should be of type string')

    await this.#checkAccessToken()

    return got.get(`${this.#url}financial-institutions/${financialInstitutionId}/financial-institution-accounts/${financialInstitutionAccountId}/financial-institution-transactions/${financialInstitutionTransactionId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })
  }

  /**
   * Get a list of Accounts
   *
   * @param {object} pagingParameters - paging parameters object
   * @param {number} pagingParameters.limit - amount of Financial Institutions to return
   * @param {string} pagingParameters.before - cursor to get Financial Institutions before this Financial Institution
   * @param {string} pagingParameters.after cursor to get Financial Institutions after this Financial Institution
   * @returns {Promise} Promise object represents a list of your accounts
   */
  async listAccounts (pagingParameters) {
    if (this.sandboxMode) throw new Error('listAccounts has no sandbox, use listFinancialInstitutionAccounts instead')

    const searchParams = validateSearchParameters(pagingParameters)

    await this.#checkAccessToken()

    const body = await got.get(`${this.#url}accounts`, {
      searchParams,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })

    const { meta: { paging: { limit, before, after } } } = body
    if (before) {
      body.previous = () => {
        return this.listAccounts({ limit, before })
      }
    }
    if (after) {
      body.next = () => {
        return this.listAccounts({ limit, after })
      }
    }
    return body
  }

  /**
   * Get an Account
   *
   * @param {string} accountId id of an Account
   * @returns {Promise} Promise object represents an Account
   */
  async getAccount (accountId) {
    if (this.sandboxMode) throw new Error('getAccount has no Sandbox, use getFinancialInstitutionAccount instead')

    if (!accountId) throw new Error('accountId is required')
    if (typeof accountId !== 'string') throw new TypeError('accountId should be of type string')

    await this.#checkAccessToken()

    return got.get(`${this.#url}accounts/${accountId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })
  }

  /**
   * Sync accountDetails or accountTransactions for an Account
   *
   * @param {string} accountId id of an Account
   * @param {string} [subtype=accountDetails] - two options 'accountDetails' || 'accountTransactions'
   * @returns {Promise} Promise object represents a new sync object with id
   */
  async syncAccount (accountId, subtype = 'accountDetails') {
    if (this.sandboxMode) throw new Error('syncAccount has no sandbox')

    if (!accountId) throw new Error('accountId is required')
    if (typeof accountId !== 'string') throw new TypeError('accountId should be of type string')

    if (!['accountDetails', 'accountTransactions'].includes(subtype)) throw new Error('subType should: "accountDetails" or "accountTransactions"')

    await this.#checkAccessToken()

    const body = await got.post(`${this.#url}synchronizations`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`,
        'Content-Type': 'application/json'
      },
      responseType: 'json',
      resolveBodyOnly: true,
      json: {
        data: {
          type: 'synchronization',
          attributes: {
            resourceType: 'account',
            resourceId: accountId,
            subtype
          }
        }
      }
    })
    return body
  }

  /**
   * Get a synchronisation
   *
   * @param {string} synchronizationId
   * @returns {Promise} Promise object represents a sync object
   */
  async getSynchronization (synchronizationId) {
    if (this.sandboxMode) throw new Error('getSynchronization has no sandbox')

    if (!synchronizationId) throw new Error('synchronizationId is required')
    if (typeof synchronizationId !== 'string') throw new TypeError('synchronizationId should be of type string')

    await this.#checkAccessToken()

    return got.post(`${this.#url}synchronizations/'${synchronizationId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })
  }

  /**
   * Get a list of Transactions for an Account
   *
   * @param {string} accountId - Id of the account
   * @param {object} pagingParameters - paging parameters object
   * @param {number} pagingParameters.limit - amount of Transactions to return
   * @param {string} pagingParameters.before - cursor to get Transactions before this Transaction
   * @param {string} pagingParameters.after cursor to get Transactions after this Transaction
   * @returns {Promise} Promise object represents a list of your Transactions for the account
   */
  async listTransactions (accountId, pagingParameters) {
    if (this.sandboxMode) throw new Error('getSynchronization has no sandbox')

    if (!accountId) throw new Error('accountId is required')
    if (typeof accountId !== 'string') throw new TypeError('accountId should be of type string')

    const searchParams = validateSearchParameters(pagingParameters)

    await this.#checkAccessToken()

    const body = await got.get(`${this.#url}accounts/${accountId}/transactions`, {
      searchParams,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })

    const { meta: { paging: { limit, before, after } } } = body
    if (before) {
      body.previous = () => {
        return this.listTransactions(accountId, { limit, before })
      }
    }
    if (after) {
      body.next = () => {
        return this.listTransactions(accountId, { limit, after })
      }
    }
    return body
  }

  async getTransaction (accountId, transactionId) {
    if (this.sandboxMode) throw new Error('getSynchronization has no sandbox')

    if (!accountId) throw new Error('accountId is required')
    if (typeof accountId !== 'string') throw new TypeError('accountId should be of type string')

    if (!transactionId) throw new Error('transactionId is required')
    if (typeof transactionId !== 'string') throw new TypeError('transactionId should be of type string')

    await this.#checkAccessToken()

    return got.get(`${this.#url}accounts/${accountId}/transactions/${transactionId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.#accessToken}`
      },
      responseType: 'json',
      resolveBodyOnly: true
    })
  }
}

module.exports = Ponto
