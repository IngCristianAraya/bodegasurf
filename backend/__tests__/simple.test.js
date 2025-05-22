// @ts-check

// Prueba simple para verificar que Jest está funcionando
test('1 + 1 debe ser igual a 2', () => {
  // Arrange
  const a = 1;
  const b = 1;
  
  // Act
  const resultado = a + b;
  
  // Assert
  expect(resultado).toBe(2);
});

// Suite de pruebas de ejemplo
describe('Suite de pruebas de ejemplo', () => {
  // Prueba de ejemplo con múltiples aserciones
  test('debe realizar operaciones matemáticas básicas', () => {
    // Suma
    expect(2 + 2).toBe(4);
    
    // Resta
    expect(5 - 3).toBe(2);
    
    // Multiplicación
    expect(3 * 4).toBe(12);
    
    // División
    expect(10 / 2).toBe(5);
  });
  
  // Prueba de ejemplo con manejo de objetos
  test('debe manejar correctamente los objetos', () => {
    const obj = { a: 1, b: 2 };
    
    // Verificar propiedades
    expect(obj).toHaveProperty('a');
    expect(obj).toHaveProperty('b', 2);
    
    // Verificar igualdad de objetos
    expect(obj).toEqual({ a: 1, b: 2 });
  });
  
  // Prueba de ejemplo con manejo de arrays
  test('debe manejar correctamente los arrays', () => {
    const arr = [1, 2, 3];
    
    // Verificar longitud
    expect(arr).toHaveLength(3);
    
    // Verificar contenido
    expect(arr).toContain(2);
    expect(arr).toEqual(expect.arrayContaining([1, 3]));
  });
});
