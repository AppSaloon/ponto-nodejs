# ponto-nodejs

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[Ponto](https://myponto.com/en) API Nodejs client

Based on their [REST API](https://documentation.myponto.com/api)

## Features

- Authentication and accessToken management
- Accounts
- Synchronisation of account details

## Install

```bash
npm install ponto
```

## Usage

### Initialize

```js
const Ponto = require('ponto')
const sandboxMode = true
const ponto = new Ponto()('<ponto_client_id>', '<ponto_client_secret>', sandboxMode)
```

_Notes_:

- Ponto can be initialised in sandbox mode for testing purpose.

#### `ponto.listFinancialInstitutions` (*production* & *sandbox*)

```js
const pagingParameters = {
  limit: 2, // Defaults :100
  before: '<financialInstitutionId>', // cursor for pagination
  after: '<financialInstitutionId>', // cursor for pagination
} 
const response = await ponto.listFinancialInstitutions(pagingParameters)
const { meta, data, links, next, previous } = response

if (response.next) {
  const nextPageResponse = await response.next()
}
```

_Notes_ :

- `pagingParameters.before` & `pagingParameters.after` cannot be used together
- All list functions return a paging result. If they have a next or previous page a next or previous async function will be present.

more [info](https://documentation.myponto.com/api#list-financial-institutions)

#### `ponto.getFinancialInstitution` (*production* & *sandbox*)

```js
const response = await ponto.getFinancialInstitution('<financialInstitutionId>')
const { data } = response
```

more [info](https://documentation.myponto.com/api#get-financial-institution)

#### `ponto.listFinancialInstitutionAccounts` (*sandbox only*)

```js
const pagingParameters = {
  limit: 2, // Defaults :100
  before: '<financialInstitutionId>', // cursor for pagination
  after: '<financialInstitutionId>', // cursor for pagination
} 
const response = await ponto.listFinancialInstitutionAccounts('<financialInstitutionId>', pagingParameters)
const { meta, data, links, next, previous } = response

if (response.next) {
  const nextPageResponse = await response.next()
}
```

_Notes_ :

- `pagingParameters.before` & `pagingParameters.after` cannot be used together
- All list functions return a paging result. If they have a next or previous page a next or previous async function will be present.

more [info](https://documentation.myponto.com/api#list-financial-institution-accounts)

#### `ponto.getFinancialInstitutionAccount` (*sandbox only*)

```js
const response = await ponto.getFinancialInstitutionAccount('<financialInstitutionId>', '<financialInstitutionAccountId>')
const { data } = response
```

more [info](https://documentation.myponto.com/api#get-financial-institution-account)

#### `ponto.listFinancialInstitutionTransactions` (*sandbox only*)

```js
const pagingParameters = {
  limit: 2, // Defaults :100
  before: '<financialInstitutionId>', // cursor for pagination
  after: '<financialInstitutionId>', // cursor for pagination
} 
const response = await ponto.listFinancialInstitutionTransactions('<financialInstitutionId>', '<financialInstitutionAccountId>', pagingParameters)
const { meta, data, links, next, previous } = response

if (response.next) {
  const nextPageResponse = await response.next()
}
```

_Notes_ :

- `pagingParameters.before` & `pagingParameters.after` cannot be used together
- All list functions return a paging result. If they have a next or previous page a next or previous async function will be present.

more [info](https://documentation.myponto.com/api#list-financial-institution-transactions)

#### `ponto.getFinancialInstitutionTransaction` (*sandbox only*)

```js
const response = await ponto.getFinancialInstitutionTransaction('<financialInstitutionId>', '<financialInstitutionAccountId>', '<financialInstitutionTransactionId>')
const { data } = response
```

more [info](https://documentation.myponto.com/api#get-financial-institution-transaction)

#### `ponto.listAccounts` (*production only*)

```js
const pagingParameters = {
  limit: 2, // Defaults :100
  before: '<accountId>', // cursor for pagination
  after: '<accountId>', // cursor for pagination
} 
const response = await ponto.listAccounts(pagingParameters)
const { meta, data, links, next, previous } = response

if (response.next) {
  const nextPageResponse = await response.next()
}
```

_Notes_ :

- `pagingParameters.before` & `pagingParameters.after` cannot be used together
- All list functions return a paging result. If they have a next or previous page a next or previous async function will be present.

more [info](https://documentation.myponto.com/api#list-accounts)

#### `ponto.getAccount` (*production only*)

```js
const response = await ponto.getAccount('<accountId>')
const { data } = response
```

more [info](https://documentation.myponto.com/api#get-account)

#### `ponto.syncAccount` (*production only*)

```js
const response = await ponto.syncAccount('<accountId>')
const { data } = response
```

more [info](https://documentation.myponto.com/api#create-synchronization)

#### `ponto.getSynchronization` (*production only*)

```js
const response = await ponto.getSynchronization('<synchronizationId>')
const { data } = response
```

more [info](https://documentation.myponto.com/api#get-synchronization)

#### `ponto.listTransactions` (*production only*)

```js
const pagingParameters = {
  limit: 2, // Defaults :100
  before: '<accountId>', // cursor for pagination
  after: '<accountId>', // cursor for pagination
} 
const response = await ponto.listAccounts('<accountId>', pagingParameters)
const { meta, data, links, next, previous } = response

if (response.next) {
  const nextPageResponse = await response.next()
}
```

_Notes_ :

- `pagingParameters.before` & `pagingParameters.after` cannot be used together
- All list functions return a paging result. If they have a next or previous page a next or previous async function will be present.

more [info](https://documentation.myponto.com/api#list-transactions)

#### `ponto.getTransaction` (*production only*)

```js
const response = await ponto.getTransaction('<accountId>', t'<ransactionId>')
const { data } = response
```

more [info](https://documentation.myponto.com/api#get-synchronization)