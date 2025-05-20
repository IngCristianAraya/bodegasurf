import { X, Save, Building2, User, Phone, Mail, MapPin, CreditCard, Calendar, Package, Check, XCircle, FileText } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const ProveedorForm = ({ proveedor, onClose, onSave }) => {
  // Departamentos y provincias del Perú
  const departamentosPeru = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 
    'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 
    'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 
    'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
  ];

  // Tipos de documento según SUNAT
  const tiposDocumento = [
    { value: 'RUC', label: 'RUC - Registro Único de Contribuyentes' },
    { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
    { value: 'CE', label: 'CE - Carné de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'OTRO', label: 'Otro documento' }
  ];

  // Tipos de cuenta bancaria
  const tiposCuenta = [
    'Ahorros Soles',
    'Corriente Soles',
    'Ahorros Dólares',
    'Corriente Dólares',
    'Cuenta Interbancaria (CCI)'
  ];

  // Bancos en Perú
  const bancosPeru = [
    'BCP - Banco de Crédito del Perú',
    'BBVA Perú',
    'Interbank',
    'Scotiabank Perú',
    'Banco de la Nación',
    'Banco Pichincha',
    'Banco Interamericano de Finanzas',
    'Banco GNB Perú',
    'Banco Falabella',
    'Banco Ripley',
    'MiBanco',
    'Banco Azteca',
    'Banco Santander Perú',
    'Banco Cencosud',
    'Banco de Comercio',
    'Banco Financiero',
    'Banco Internacional del Perú',
    'Banco de la Microempresa',
    'Banco Pyme Mibanco',
    'Otro banco'
  ];

  // Estado inicial con valores por defecto
  const estadoInicial = {
    // Información básica
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    razonSocial: '',
    nombreComercial: '',
    
    // Ubicación
    direccion: '',
    departamento: '',
    provincia: '',
    distrito: '',
    pais: 'Perú',
    
    // Contacto
    contacto: '',
    cargo: '',
    telefono: '',
    celular: '',
    email: '',
    
    // Información comercial
    condicionPago: 'CRÉDITO',
    diasCredito: 30,
    limiteCredito: 0,
    moneda: 'SOLES',
    
    // Datos bancarios
    banco: '',
    tipoCuenta: 'Ahorros Soles',
    numeroCuenta: '',
    cci: '',
    
    // Información adicional
    estado: 'ACTIVO',
    observaciones: '',
    
    // Campos para validación SUNAT
    estadoContribuyente: '',
    condicionDomicilio: '',
    
    // Adjuntos
    documentos: [],
    
    // Productos
    productos: []
  };

  const [formData, setFormData] = useState(estadoInicial);

  const [nuevoProducto, setNuevoProducto] = useState('');
  const [errores, setErrores] = useState({});
  const [errorProducto, setErrorProducto] = useState('');

  useEffect(() => {
    if (proveedor) {
      // Asegurarse de que todos los campos tengan un valor, usando los valores por defecto si es necesario
      setFormData({
        ...estadoInicial,  // Primero establece todos los valores por defecto
        ...proveedor,    // Luego aplica los valores del proveedor
        productos: Array.isArray(proveedor.productos) ? [...proveedor.productos] : []
      });
    } else {
      // Para un nuevo proveedor, usar el estado inicial completo
      setFormData(estadoInicial);
    }
  }, [proveedor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarProducto = useCallback(() => {
    const producto = nuevoProducto.trim();
    
    // Validaciones
    if (!producto) {
      setErrorProducto('El nombre del producto no puede estar vacío');
      return;
    }
    
    if (producto.length > 100) {
      setErrorProducto('El nombre del producto no puede tener más de 100 caracteres');
      return;
    }
    
    const productosActuales = Array.isArray(formData.productos) ? formData.productos : [];
    
    if (productosActuales.some(p => p.toLowerCase() === producto.toLowerCase())) {
      setErrorProducto('Este producto ya ha sido agregado');
      return;
    }
    
    // Si pasa todas las validaciones, agregar el producto
    setFormData(prev => ({
      ...prev,
      productos: [...productosActuales, producto]
    }));
    
    // Limpiar y resetear estados
    setNuevoProducto('');
    setErrorProducto('');
    
    // Enfocar el input para facilitar la adición de más productos
    document.getElementById('nuevo-producto-input')?.focus();
  }, [nuevoProducto, formData.productos]);

  const quitarProducto = useCallback((producto) => {
    setFormData(prev => ({
      ...prev,
      productos: Array.isArray(prev.productos) 
        ? prev.productos.filter(p => p !== producto) 
        : []
    }));
  }, []);

  // Función para validar RUC peruano
  const validarRUC = (ruc) => {
    if (!ruc) return false;
    
    // El RUC debe tener 11 dígitos
    if (ruc.length !== 11) return false;
    
    // Validar que solo contenga números
    if (!/^[0-9]+$/.test(ruc)) return false;
    
    // Validar los primeros 2 dígitos (código de departamento)
    const codigoDepartamento = parseInt(ruc.substring(0, 2));
    if (codigoDepartamento < 1 || codigoDepartamento > 26) return false;
    
    // Validar dígito verificador
    const digitos = ruc.split('').map(Number);
    const digitoVerificador = digitos.pop();
    
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    
    for (let i = 0; i < factores.length; i++) {
      suma += digitos[i] * factores[i];
    }
    
    const resto = suma % 11;
    const resultado = 11 - resto;
    
    // Si el resultado es 10, el dígito verificador debe ser 0
    // Si el resultado es 11, el dígito verificador debe ser 1
    // De lo contrario, el resultado debe ser igual al dígito verificador
    const digitoEsperado = resultado === 10 ? 0 : resultado === 11 ? 1 : resultado;
    
    return digitoVerificador === digitoEsperado;
  };

  // Función para validar DNI peruano
  const validarDNI = (dni) => {
    if (!dni) return false;
    
    // El DNI debe tener 8 dígitos
    if (dni.length !== 8) return false;
    
    // Validar que solo contenga números
    return /^[0-9]+$/.test(dni);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    // Validación de documento
    if (!formData.numeroDocumento.trim()) {
      nuevosErrores.numeroDocumento = 'El número de documento es requerido';
    } else {
      if (formData.tipoDocumento === 'RUC' && !validarRUC(formData.numeroDocumento)) {
        nuevosErrores.numeroDocumento = 'El RUC no es válido';
      } else if (formData.tipoDocumento === 'DNI' && !validarDNI(formData.numeroDocumento)) {
        nuevosErrores.numeroDocumento = 'El DNI debe tener 8 dígitos numéricos';
      }
    }
    
    // Validación de razón social
    if (!formData.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es requerida';
    }
    
    // Validación de contacto
    if (!formData.contacto.trim()) {
      nuevosErrores.contacto = 'El nombre de contacto es requerido';
    }
    
    // Validación de teléfono
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es requerido';
    }
    
    // Validación de email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'El correo electrónico no es válido';
    }
    
    // Validación de cuenta bancaria si se proporciona
    if (formData.numeroCuenta && !/^[0-9-]+$/.test(formData.numeroCuenta)) {
      nuevosErrores.numeroCuenta = 'El número de cuenta solo puede contener números y guiones';
    }
    
    // Validación de CCI si se proporciona
    if (formData.cci && !/^[0-9]{20}$/.test(formData.cci)) {
      nuevosErrores.cci = 'El CCI debe tener 20 dígitos numéricos';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSave(formData);
    }
  };

  // Función para manejar el cambio de departamento
  const handleDepartamentoChange = (e) => {
    const nuevoDepartamento = e.target.value;
    setFormData(prev => ({
      ...prev,
      departamento: nuevoDepartamento,
      provincia: '', // Resetear provincia al cambiar de departamento
      distrito: ''   // Resetear distrito al cambiar de departamento
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">
            {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Contenido principal con scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              {/* Sección de Información Básica */}
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-yellow-600" />
                  Información del Documento
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700">
                        Tipo de Documento *
                      </label>
                      <select
                        id="tipoDocumento"
                        name="tipoDocumento"
                        value={formData.tipoDocumento}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      >
                        {tiposDocumento.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="numeroDocumento" className="block text-sm font-medium text-gray-700">
                        Número de Documento *
                      </label>
                      <input
                        type="text"
                        id="numeroDocumento"
                  name="numeroDocumento"
                  value={formData.numeroDocumento}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                    errores.numeroDocumento ? 'border-red-500' : ''
                  }`}
                  placeholder={formData.tipoDocumento === 'RUC' ? 'Ej: 20123456781' : 'Ej: 12345678'}
                />
                {errores.numeroDocumento && (
                  <p className="mt-1 text-sm text-red-600">{errores.numeroDocumento}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda - Información de la Empresa */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-yellow-600" />
                  Información de la Empresa
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="razonSocial" className="block text-sm font-medium text-gray-700">
                      Razón Social *
                    </label>
                    <input
                      type="text"
                      id="razonSocial"
                      name="razonSocial"
                      value={formData.razonSocial}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                        errores.razonSocial ? 'border-red-500' : ''
                      }`}
                      placeholder="Ej: COMERCIALIZADORA PERUANA S.A.C."
                    />
                    {errores.razonSocial && (
                      <p className="mt-1 text-sm text-red-600">{errores.razonSocial}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="nombreComercial" className="block text-sm font-medium text-gray-700">
                      Nombre Comercial (Opcional)
                    </label>
                    <input
                      type="text"
                      id="nombreComercial"
                      name="nombreComercial"
                      value={formData.nombreComercial}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      placeholder="Ej: COMERCIALIZADORA PERU"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                      Dirección del Domicilio Fiscal
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      placeholder="Ej: Av. Arequipa 1234, Int. 201"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
                        Departamento *
                      </label>
                      <select
                        id="departamento"
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleDepartamentoChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      >
                        <option value="">Seleccione...</option>
                        {departamentosPeru.map((depto) => (
                          <option key={depto} value={depto}>
                            {depto}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="provincia" className="block text-sm font-medium text-gray-700">
                        Provincia *
                      </label>
                      <select
                        id="provincia"
                        name="provincia"
                        value={formData.provincia}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                        disabled={!formData.departamento}
                      >
                        <option value="">Seleccione...</option>
                        {formData.departamento && (
                          // En una aplicación real, aquí cargarías las provincias según el departamento seleccionado
                          // Esto es un ejemplo simplificado
                          <option value={formData.departamento + ' Metropolitana'}>
                            {formData.departamento} Metropolitana
                          </option>
                        )}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="distrito" className="block text-sm font-medium text-gray-700">
                        Distrito *
                      </label>
                      <select
                        id="distrito"
                        name="distrito"
                        value={formData.distrito}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                        disabled={!formData.provincia}
                      >
                        <option value="">Seleccione...</option>
                        {formData.provincia && (
                          // En una aplicación real, aquí cargarías los distritos según la provincia seleccionada
                          // Esto es un ejemplo simplificado
                          <option value={formData.provincia.replace(' Metropolitana', ' Centro')}>
                            {formData.provincia.replace(' Metropolitana', ' Centro')}
                          </option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-yellow-600" />
                  Productos que Suministra
                </h4>
                
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        id="nuevo-producto-input"
                        type="text"
                        value={nuevoProducto}
                        onChange={(e) => {
                          setNuevoProducto(e.target.value);
                          if (errorProducto) setErrorProducto('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            agregarProducto();
                          }
                        }}
                        className={`w-full rounded-md ${errorProducto ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm`}
                        placeholder="Escriba el nombre del producto y presione Enter"
                        aria-label="Agregar nuevo producto"
                        aria-describedby="producto-help"
                        maxLength={100}
                      />
                      <p id="producto-help" className="mt-1 text-xs text-gray-500">
                        Presione Enter o el botón para agregar
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={agregarProducto}
                      disabled={!nuevoProducto.trim()}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${nuevoProducto.trim() ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
                      aria-label="Agregar producto"
                    >
                      Agregar
                    </button>
                  </div>
                  
                  {errorProducto && (
                    <p className="text-sm text-red-600" role="alert">
                      {errorProducto}
                    </p>
                  )}
                  
                  {Array.isArray(formData.productos) && formData.productos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Productos agregados ({formData.productos.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.productos.map((producto, index) => (
                          <span 
                            key={`${producto}-${index}`}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            {producto}
                            <button
                              type="button"
                              onClick={() => quitarProducto(producto)}
                              className="ml-1.5 inline-flex items-center justify-center flex-shrink-0 h-4 w-4 text-yellow-600 hover:text-yellow-800 focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded"
                              aria-label={`Eliminar ${producto}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Columna Derecha */}
            <div className="space-y-4">
              {/* Sección de Información de Contacto */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-yellow-600" />
                  Información de Contacto
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contacto" className="block text-sm font-medium text-gray-700">
                      Nombre del Contacto *
                    </label>
                    <input
                      type="text"
                      id="contacto"
                      name="contacto"
                      value={formData.contacto}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                        errores.contacto ? 'border-red-500' : ''
                      }`}
                      placeholder="Ej: Juan Pérez"
                    />
                    {errores.contacto && (
                      <p className="mt-1 text-sm text-red-600">{errores.contacto}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                      Cargo
                    </label>
                    <input
                      type="text"
                      id="cargo"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      placeholder="Ej: Gerente de Ventas"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                        Teléfono Fijo *
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center">
                          <select
                            id="codigoPais"
                            name="codigoPais"
                            className="h-full rounded-l-md border-transparent bg-transparent py-0 pl-3 pr-1 text-gray-500 focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                            disabled
                          >
                            <option>+51</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          name="telefono"
                          id="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className={`block w-full rounded-md border-gray-300 pl-16 focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                            errores.telefono ? 'border-red-500' : ''
                          }`}
                          placeholder="01 234 5678"
                        />
                      </div>
                      {errores.telefono && (
                        <p className="mt-1 text-sm text-red-600">{errores.telefono}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="celular" className="block text-sm font-medium text-gray-700">
                        Celular (WhatsApp) *
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center">
                          <select
                            id="codigoPaisCelular"
                            name="codigoPaisCelular"
                            className="h-full rounded-l-md border-transparent bg-transparent py-0 pl-3 pr-1 text-gray-500 focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                            disabled
                          >
                            <option>+51</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          name="celular"
                          id="celular"
                          value={formData.celular}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 pl-16 focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                          placeholder="987 654 321"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                        errores.email ? 'border-red-500' : ''
                      }`}
                      placeholder="contacto@empresa.com"
                    />
                    {errores.email && (
                      <p className="mt-1 text-sm text-red-600">{errores.email}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sección de Información Comercial */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-yellow-600" />
                  Información Comercial
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="condicionPago" className="block text-sm font-medium text-gray-700">
                        Condición de Pago
                      </label>
                      <select
                        id="condicionPago"
                        name="condicionPago"
                        value={formData.condicionPago}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      >
                        <option value="CONTADO">CONTADO</option>
                        <option value="CRÉDITO">CRÉDITO</option>
                      </select>
                    </div>
                    
                    {formData.condicionPago === 'CRÉDITO' && (
                      <div>
                        <label htmlFor="diasCredito" className="block text-sm font-medium text-gray-700">
                          Días de Crédito
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            name="diasCredito"
                            id="diasCredito"
                            min="0"
                            value={formData.diasCredito}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                            placeholder="30"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">días</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="limiteCredito" className="block text-sm font-medium text-gray-700">
                      Límite de Crédito
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">S/</span>
                      </div>
                      <input
                        type="number"
                        name="limiteCredito"
                        id="limiteCredito"
                        min="0"
                        step="0.01"
                        value={formData.limiteCredito}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 pl-12 focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">
                      Moneda Principal
                    </label>
                    <select
                      id="moneda"
                      name="moneda"
                      value={formData.moneda}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                    >
                      <option value="SOLES">SOLES (S/)</option>
                      <option value="DÓLARES">DÓLARES (US$)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="limiteCredito" className="block text-sm font-medium text-gray-700">
                      Límite de Crédito
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="limiteCredito"
                        name="limiteCredito"
                        value={formData.limiteCredito}
                        onChange={handleChange}
                        min="0"
                        step="100000"
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="diasEntrega" className="block text-sm font-medium text-gray-700">
                      Días de Entrega
                    </label>
                    <input
                      type="text"
                      id="diasEntrega"
                      name="diasEntrega"
                      value={formData.diasEntrega}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      placeholder="Ej: Lunes a Viernes"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                      Estado del Proveedor
                    </label>
                    <div className="mt-2 space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="estado"
                          value="activo"
                          checked={formData.estado === 'activo'}
                          onChange={handleChange}
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Activo</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="estado"
                          value="inactivo"
                          checked={formData.estado === 'inactivo'}
                          onChange={handleChange}
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Inactivo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
                  Notas Adicionales
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  rows="3"
                  value={formData.notas}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                  placeholder="Información adicional sobre el proveedor"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              {proveedor ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  );
};

export default ProveedorForm;