const expect = require('expect');
const {isRealString} = require('./validations');

describe('isRealString', () => {
  it('should reject non-string values', () => {
    var res = isRealString(98);
    expect(res).toBe(false);
  });
});

describe('isRealString', () => {
  it('should reject string with only spaces', () => {
    var res = isRealString("      ");
    expect(res).toBe(false);
  });
});

describe('isRealString', () => {
  it('should allow string with non-space characters', () => {
    var res = isRealString("   Sachin   ");
    expect(res).toBe(true);
  });
});