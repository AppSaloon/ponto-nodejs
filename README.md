# ponto-nodejs

[Ponto](https://myponto.com/en) API Nodejs client

Based on their [REST API](https://documentation.myponto.com/api)

## Features

- Authentication and accessToken management


## Install

```bash
npm install ponto
```

## Usage

### Initialize

```js
const Ponto = require('ponto')
const ponto = new Ponto()('ponto_client_id', 'ponto_client_secret')
```

#### `ponto.getAccounts`

```js
const accounts = await ponto.getAccounts()
```

more info <https://documentation.myponto.com/api#list-accounts>

#### `ponto.syncAccount`

```js
const accounts = await ponto.syncAccount(accountId)
```

more info <https://documentation.myponto.com/api#create-synchronization>
