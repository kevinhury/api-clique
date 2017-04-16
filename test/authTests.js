const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
const should = chai.should
const controller = require('../controllers/auth')

describe('Authentication', () => {
  it('generates a valid token', () => {
    const size = 6
    const token = controller.generateToken(size)
    expect(token.length).to.equal(size, 'Token length should be 6')
    expect(/^\d+$/.test(token)).to.equal(true, 'Token should be numeric')
  })

  it('hash password', (done) => {
    const password = 'plaintext'
    controller.hashPassword(password)
      .then((hash) => {
        return controller.comparePassword(password, hash)
          .then((equals) => {
            return expect(equals).to.be.true
          })
          .catch(done)
      })
      .then(() => done())
  })
})
