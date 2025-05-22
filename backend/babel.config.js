// Configuración de Babel para el proyecto (ES Modules)
module.exports = function(api) {
  api.cache(true);
  
  const isTest = api.env('test');
  const isDevelopment = api.env('development');
  
  return {
    presets: [
      ['@babel/preset-env', {
        targets: {
          node: 'current',
        },
        // Usar 'commonjs' para pruebas y falso para ES modules
        modules: isTest ? 'commonjs' : false,
        useBuiltIns: 'usage',
        corejs: 3,
        shippedProposals: true,
        debug: isDevelopment
      }],
      '@babel/preset-typescript'
    ],
    plugins: [
      // Soporte para async/await
      '@babel/plugin-transform-runtime',
      // Soporte para propiedades de clase
      '@babel/plugin-proposal-class-properties',
      // Soporte para encadenamiento opcional
      '@babel/plugin-proposal-optional-chaining',
      // Soporte para operadores de fusión nula
      '@babel/plugin-proposal-nullish-coalescing-operator',
      // Soporte para parámetros opcionales en catch
      '@babel/plugin-proposal-optional-catch-binding',
      // Soporte para exportaciones de espacio de nombres
      '@babel/plugin-proposal-export-namespace-from',
      // Soporte para exportaciones por defecto desde módulos con sintaxis de espacio de nombres
      '@babel/plugin-proposal-export-default-from',
      // Soporte para funciones de enlace dinámico de importación
      '@babel/plugin-syntax-dynamic-import',
      // Soporte para módulos de importación
      ['@babel/plugin-transform-modules-commonjs', {
        allowTopLevelThis: true,
        strictMode: false,
        loose: true
      }]
    ]
  };
};;
