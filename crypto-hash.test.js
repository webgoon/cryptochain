const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
  // 2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae
  // 8ee9938e4b960a50540f1ca9299facc5a5f342d0848b402c322fd14592e4bc32
  it('generates a SHA-256 hashed output', () => {
    expect(cryptoHash('foo'))
    .toEqual('2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae');
  });

  it('produces the same has with the same input arguments in any order', () => {
    expect(cryptoHash('one', 'two', 'three'))
    .toEqual(cryptoHash('three', 'one', 'two'));
  });

});
