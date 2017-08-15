const assert = require('chai').assert
const dde_generator = require('../lib/dde_generator')

const _ = require('lodash')

const expected = dde_generator(1, 100)

describe('DdeGenerator', () => {
    it('should return an object with 3 Argument objects given an iteration and chunk value', () => {
        assert.equal(5, _.keysIn(expected).length)
    })
    it('should provide correct range given a particular iterator and chunk value', () => {
        assert.equal(101, expected.start)
        assert.equal(200, expected.end)
    })
    it('should return objects with appropriate fake data', () => {
        assert.equal(101, expected.npid[0]._id)
        assert.equal(31, dde_generator(6, 5).npid[0]._id)
    });
});