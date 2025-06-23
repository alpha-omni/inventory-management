// Basic test to verify Jest setup is working
describe('Basic test setup', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const testString = 'Hello World';
    expect(testString).toContain('World');
    expect(testString.length).toBe(11);
  });

  it('should test array operations', () => {
    const testArray = [1, 2, 3, 4, 5];
    expect(testArray).toHaveLength(5);
    expect(testArray).toContain(3);
  });

  it('should test async operations', async () => {
    const asyncFunction = async () => {
      return Promise.resolve('async result');
    };

    const result = await asyncFunction();
    expect(result).toBe('async result');
  });
});