const chai = require('chai')
const expect = chai.expect
const accountsService = require('../api/accounts/accounts.service')

describe('Authentication', () => {
  it('generates a valid token', () => {
    const size = 6
    const token = accountsService.generateToken(size)
    expect(token.length).to.equal(size, 'Token length should be 6')
    expect(/^\d+$/.test(token)).to.equal(true, 'Token should be numeric')
  })

  it('hash password', (done) => {
    const password = 'plaintext'
    accountsService.hashPassword(password)
      .then((hash) => {
        return accountsService.comparePassword(password, hash)
          .then((equals) => {
            return expect(equals).to.be.true
          })
          .catch(done)
      })
      .then(() => done())
  })
})
