const got = require('got')

class Ponto {
  constructor (clientId, clientSecret) {
    this.url = 'https://api.myponto.com/'
    this.auth = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    this.accessToken = undefined
    this.expirationTimestamp = 0
    this.listOfAccountIDs = new Set()
  }

  // eslint-disable-next-line
  async getAccessToken () { 
    const { body } = await got.post(this.url + 'oauth2/token', {
      searchParams: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: this.auth
      },
      responseType: 'json'
    })
    return body
  }

  // eslint-disable-next-line
  async checkAccessToken () {
    if (!this.accessToken || this.expirationTimestamp < Date.now()) {
      const token = await this.getAccessToken()
      this.accessToken = token.access_token
      this.expirationTimestamp = Date.now() + ((token.expires_in - 20) * 1000) // expires_in = Amount of time the access token is valid, in seconds
    }
  }

  async accountIDs (forceFetch) {
    if (this.listOfAccountIDs.size === 0 || forceFetch) {
      await this.getAccounts()
    }
    return [...this.listOfAccountIDs.values()]
  }

  async getAccounts (limit = 100) {
    await this.checkAccessToken()

    const searchParams = {
      limit
    }

    const { body } = await got.get(this.url + 'accounts', {
      searchParams,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.accessToken}`
      },
      responseType: 'json'
    })

    const { data } = body
    for (const account of data) {
      this.listOfAccountIDs.add(account.i)
    }

    return body
  }

  async syncAccount (accountId) {
    await this.checkAccessToken()

    const { body } = await got.post(this.url + 'synchronizations', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      responseType: 'json',
      json: {
        data: {
          type: 'synchronization',
          attributes: {
            resourceType: 'account',
            resourceId: accountId,
            subtype: 'accountDetails'
          }
        }
      }
    })
    return body
  }
}

module.exports = Ponto
