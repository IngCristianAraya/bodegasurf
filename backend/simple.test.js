const { describe, it, expect } = require('@jest/globals');

// Simple test file to verify Jest is working
const sum = (a, b) => a + b;

describe('Sum function', () => {
  it('should add 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
