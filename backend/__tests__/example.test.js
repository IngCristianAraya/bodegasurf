// Prueba de ejemplo para verificar la configuración de Jest
describe('Example Test Suite', () => {
  it('should pass this test', () => {
    expect(true).toBe(true);
  });

  it('should calculate 2 + 2 correctly', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle async code', async () => {
    const result = await Promise.resolve('async code');
    expect(result).toBe('async code');
  });
});
