require('dotenv').config({ path: './.env.test' })
const test = require('tape')

const Ponto = require('../index')
const pontoSandbox = new Ponto(process.env.PONTO_SANDBOX_CLIENT_ID, process.env.PONTO_SANDBOX_CLIENT_SECRET, true)
let financialInstitutionId,
  financialInstitutionAccountId,
  financialInstitutionTransactionId

test('Test Sandbox Financial Institutions', async (t) => {
  try {
    const { meta, data, next } = await pontoSandbox.listFinancialInstitutions({ limit: 2 })

    if (Array.isArray(data)) {
      t.ok(data, 'listFinancialInstitutions has an array with Financial Institutions')
    }

    t.equal(meta.paging.limit, 2, 'Got an expected meta.paging.limit message')

    financialInstitutionId = data[0].id

    if (next) {
      const { meta, previous } = await next()
      t.equal(meta.paging.limit, 2, 'Got an expected meta.paging.limit message for the next page')

      if (previous) {
        const { meta } = await next()
        t.equal(meta.paging.limit, 2, 'Got an expected meta.paging.limit message for the previous page')
      }
    }

    const { data: financialInstitution } = await pontoSandbox.getFinancialInstitution(financialInstitutionId)

    t.equal(financialInstitution.type, 'financialInstitution')
  } catch (error) {
    console.log(error?.response?.body)
    t.fail(error)
  }
  t.end()
})
test('Test Sandbox Financial Institution Accounts', async (t) => {
  try {
    const { meta, data } = await pontoSandbox.listFinancialInstitutionAccounts(financialInstitutionId, { limit: 10 })

    if (Array.isArray(data)) {
      t.ok(data, 'listFinancialInstitutions has an array with Financial Institutions')
    }

    t.equal(meta.paging.limit, 10)

    financialInstitutionAccountId = data[0].id

    const { data: financialInstitutionAccount } = await pontoSandbox.getFinancialInstitutionAccount(financialInstitutionId, financialInstitutionAccountId)

    t.equal(financialInstitutionAccount.type, 'financialInstitutionAccount')
  } catch (error) {
    console.log(error?.response?.body)
    t.fail(error)
  }
  t.end()
})

test('Test Sandbox Financial Institution Transactions', async (t) => {
  try {
    const { meta, data } = await pontoSandbox.listFinancialInstitutionTransactions(financialInstitutionId, financialInstitutionAccountId, { limit: 10 })

    if (Array.isArray(data)) {
      t.ok(data, 'listFinancialInstitutions has an array with Financial Institution Transactions')
    }

    t.equal(meta.paging.limit, 10)

    financialInstitutionTransactionId = data[0].id

    const { data: financialInstitutionTransaction } = await pontoSandbox.getFinancialInstitutionTransaction(financialInstitutionId, financialInstitutionAccountId, financialInstitutionTransactionId)

    t.equal(financialInstitutionTransaction.type, 'financialInstitutionTransaction')
  } catch (error) {
    console.log(error?.response?.body)
    t.fail(error)
  }
  t.end()
})
