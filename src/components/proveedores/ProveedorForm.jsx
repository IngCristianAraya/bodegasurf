import { 
  X, 
  Save, 
  Building2, 
  User, 
  MapPin, 
  Package, 
  Phone, 
  Mail, 
  CreditCard, 
  FileText, 
  Plus
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

// Componente de campo de formulario reutilizable
const FormField = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options = [],
  disabled = false,
  className = ''
}) => {
  const inputClass = `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
    error ? 'border-red-500' : ''
  } ${disabled ? 'bg-gray-100' : ''}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'select' ? (
        <select
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={inputClass}
        >
          <option value="">Seleccione una opción</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClass}
          rows={3}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClass}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Componente de sección del formulario
const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-5 rounded-lg border border-gray-200">
    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
      <Icon className="h-5 w-5 mr-2 text-yellow-600" />
      {title}
    </h4>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// Constantes para opciones del formulario
const TIPOS_DOCUMENTO = [
  { value: 'RUC', label: 'RUC' },
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' }
];

const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
  'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco',
  'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
];

const BANCOS_PERU = [
  'Banco de Crédito del Perú',
  'BBVA Perú',
  'Scotiabank Perú',
  'Interbank',
  'BCP'
];

const TIPOS_CUENTA = [
  'Ahorros',
  'Corriente',
  'Ahorro Soles',
  'Corriente Soles',
  'Ahorro Dólares',
  'Corriente Dólares'
];

const ProveedorForm = ({ proveedor, onClose, onSave }) => {
  // Estado inicial del formulario
  const estadoInicial = {
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    razonSocial: '',
    nombreComercial: '',
    direccion: '',
    departamento: '',
    provincia: '',
    distrito: '',
    contacto: '',
    cargo: '',
    telefono: '',
    celular: '',
    email: '',
    condicionPago: 'CONTADO',
    diasCredito: 0,
    limiteCredito: 0,
    moneda: 'SOLES',
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    cci: '',
    productos: [],
    observaciones: ''
  };

  const [formData, setFormData] = useState(estadoInicial);
  const [nuevoProducto, setNuevoProducto] = useState('');
  const [errores, setErrores] = useState({});
  const [errorProducto, setErrorProducto] = useState('');

  // Efecto para cargar los datos del proveedor si existe
  useEffect(() => {
    if (proveedor) {
      setFormData({
        ...estadoInicial,
        ...proveedor,
        productos: Array.isArray(proveedor.productos) ? [...proveedor.productos] : []
      });
    } else {
      setFormData(estadoInicial);
    }
  }, [proveedor]);

  // Manejador de cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para agregar un nuevo producto
  const agregarProducto = useCallback(() => {
    const producto = nuevoProducto.trim();
    
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
    
    setFormData(prev => ({
      ...prev,
      productos: [...productosActuales, producto]
    }));
    
    setNuevoProducto('');
    setErrorProducto('');
    document.getElementById('nuevo-producto-input')?.focus();
  }, [nuevoProducto, formData.productos]);

  // Función para quitar un producto
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

  // Función para validar el formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    // Validar tipo de documento y número
    if (!formData.tipoDocumento) {
      nuevosErrores.tipoDocumento = 'Seleccione un tipo de documento';
    }
    
    if (!formData.numeroDocumento) {
      nuevosErrores.numeroDocumento = 'El número de documento es requerido';
    } else {
      if (formData.tipoDocumento === 'RUC' && !validarRUC(formData.numeroDocumento)) {
        nuevosErrores.numeroDocumento = 'El RUC ingresado no es válido';
      } else if (formData.tipoDocumento === 'DNI' && !validarDNI(formData.numeroDocumento)) {
        nuevosErrores.numeroDocumento = 'El DNI debe tener 8 dígitos';
      } else if (formData.tipoDocumento === 'CE' && formData.numeroDocumento.length < 8) {
        nuevosErrores.numeroDocumento = 'El Carné de Extranjería debe tener al menos 8 caracteres';
      } else if (formData.tipoDocumento === 'PASAPORTE' && formData.numeroDocumento.length < 6) {
        nuevosErrores.numeroDocumento = 'El número de pasaporte debe tener al menos 6 caracteres';
      }
    }
    
    // Validar campos obligatorios
    const camposRequeridos = [
      'razonSocial', 'direccion', 'departamento', 'provincia', 'distrito',
      'contacto', 'celular', 'email'
    ];
    
    camposRequeridos.forEach(campo => {
      if (!formData[campo]) {
        nuevosErrores[campo] = 'Este campo es requerido';
      }
    });
    
    // Validar formato de email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Ingrese un correo electrónico válido';
    }
    
    // Validar días de crédito si la condición es crédito
    if (formData.condicionPago === 'CREDITO' && !formData.diasCredito) {
      nuevosErrores.diasCredito = 'Debe especificar los días de crédito';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejador de envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      onSave(formData);
    } else {
      toast.error('Por favor, corrija los errores en el formulario');
    }
  };

  // Manejador de cambio de departamento
  const handleDepartamentoChange = (e) => {
    const departamento = e.target.value;
    setFormData(prev => ({
      ...prev,
      departamento,
      provincia: '',
      distrito: ''
    }));
  };

  // Renderizado del componente
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8 mx-auto flex flex-col">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">
            {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cuerpo del formulario */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primera columna */}
            <div className="space-y-6 flex flex-col">
              {/* Sección de Información Básica */}
              <div className="bg-white rounded-lg shadow p-6 flex-1">
                <div className="flex items-center mb-4">
                  <Building2 className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
                </div>
                <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Tipo de Documento"
                    id="tipoDocumento"
                    name="tipoDocumento"
                    type="select"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    options={TIPOS_DOCUMENTO}
                    required
                    error={errores.tipoDocumento}
                  />
                  <FormField
                    label={formData.tipoDocumento === 'RUC' ? 'RUC' : 'Número de Documento'}
                    id="numeroDocumento"
                    name="numeroDocumento"
                    type="text"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    placeholder={formData.tipoDocumento === 'RUC' ? '12345678901' : '87654321'}
                    required
                    error={errores.numeroDocumento}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    label="Razón Social"
                    id="razonSocial"
                    name="razonSocial"
                    type="text"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    placeholder="Ingrese la razón social"
                    required
                    error={errores.razonSocial}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    label="Nombre Comercial (Opcional)"
                    id="nombreComercial"
                    name="nombreComercial"
                    type="text"
                    value={formData.nombreComercial}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre comercial"
                  />
                </div>
                </div>
              </div>

              {/* Sección de Información de Contacto */}
              <div className="bg-white rounded-lg shadow p-6 flex-1">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Información de Contacto</h3>
                </div>
                <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Persona de Contacto"
                    id="contacto"
                    name="contacto"
                    type="text"
                    value={formData.contacto}
                    onChange={handleChange}
                    placeholder="Nombre completo del contacto"
                    required
                    error={errores.contacto}
                  />
                  <FormField
                    label="Cargo"
                    id="cargo"
                    name="cargo"
                    type="text"
                    value={formData.cargo}
                    onChange={handleChange}
                    placeholder="Cargo del contacto"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    label="Teléfono Fijo"
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 012345678"
                  />
                  <FormField
                    label="Celular"
                    id="celular"
                    name="celular"
                    type="tel"
                    value={formData.celular}
                    onChange={handleChange}
                    placeholder="Ej: 987654321"
                    required
                    error={errores.celular}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    label="Correo Electrónico"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@proveedor.com"
                    required
                    error={errores.email}
                  />
                </div>
                </div>
              </div>
            </div>

            {/* Segunda columna */}
            <div className="space-y-6 flex flex-col">
              {/* Sección de Ubicación */}
              <div className="bg-white rounded-lg shadow p-6 flex-1">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Ubicación</h3>
                </div>
                <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    label="Dirección"
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ingrese la dirección completa"
                    required
                    error={errores.direccion}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    label="Departamento"
                    id="departamento"
                    name="departamento"
                    type="select"
                    value={formData.departamento}
                    onChange={handleDepartamentoChange}
                    options={DEPARTAMENTOS_PERU.map(d => ({ value: d, label: d }))}
                    required
                    error={errores.departamento}
                  />
                  <FormField
                    label="Provincia"
                    id="provincia"
                    name="provincia"
                    type="text"
                    value={formData.provincia}
                    onChange={handleChange}
                    placeholder="Ingrese la provincia"
                    required
                    error={errores.provincia}
                  />
                  <FormField
                    label="Distrito"
                    id="distrito"
                    name="distrito"
                    type="text"
                    value={formData.distrito}
                    onChange={handleChange}
                    placeholder="Ingrese el distrito"
                    required
                    error={errores.distrito}
                  />
                </div>
                </div>
              </div>

              {/* Sección de Información Comercial */}
              <div className="bg-white rounded-lg shadow p-6 flex-1">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Información Comercial</h3>
                </div>
                <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Condición de Pago"
                    id="condicionPago"
                    name="condicionPago"
                    type="select"
                    value={formData.condicionPago}
                    onChange={handleChange}
                    options={[
                      { value: 'CONTADO', label: 'Contado' },
                      { value: 'CREDITO', label: 'Crédito' }
                    ]}
                    required
                    error={errores.condicionPago}
                  />
                  {formData.condicionPago === 'CREDITO' && (
                    <FormField
                      label="Días de Crédito"
                      id="diasCredito"
                      name="diasCredito"
                      type="number"
                      value={formData.diasCredito}
                      onChange={handleChange}
                      placeholder="Ej: 30"
                      min="0"
                      required
                      error={errores.diasCredito}
                    />
                  )}
                  <FormField
                    label="Límite de Crédito"
                    id="limiteCredito"
                    name="limiteCredito"
                    type="number"
                    value={formData.limiteCredito}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <FormField
                    label="Moneda"
                    id="moneda"
                    name="moneda"
                    type="select"
                    value={formData.moneda}
                    onChange={handleChange}
                    options={[
                      { value: 'SOLES', label: 'Soles (S/.)' },
                      { value: 'DOLARES', label: 'Dólares (US$)' }
                    ]}
                    required
                    error={errores.moneda}
                  />
                </div>
                </div>
              </div>

              {/* Sección de Observaciones */}
              <div className="bg-white rounded-lg shadow p-6 flex-1">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Observaciones</h3>
                </div>
                <div className="space-y-4">
                <FormField
                  label="Notas adicionales"
                  id="observaciones"
                  name="observaciones"
                  type="textarea"
                  value={formData.observaciones}
                  onChange={handleChange}
                  placeholder="Ingrese cualquier información adicional relevante"
                  className="col-span-full"
                />
                </div>
              </div>

              {/* Sección de Productos que Suministra */}
              <div className="bg-white rounded-lg shadow p-6 flex-1">
                <div className="flex items-center mb-4">
                  <Package className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Productos que Suministra</h3>
                </div>
                <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        id="nuevo-producto-input"
                        value={nuevoProducto}
                        onChange={(e) => {
                          setNuevoProducto(e.target.value);
                          if (errorProducto) setErrorProducto('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarProducto())}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
                          errorProducto ? 'border-red-500' : ''
                        }`}
                        placeholder="Escriba el nombre del producto y presione Enter"
                      />
                      {errorProducto && (
                        <p className="mt-1 text-sm text-red-600">{errorProducto}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={agregarProducto}
                      disabled={!nuevoProducto.trim()}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        nuevoProducto.trim() ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-400 cursor-not-allowed'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </button>
                  </div>
                  
                  {formData.productos && formData.productos.length > 0 ? (
                    <div className="border rounded-md divide-y divide-gray-200">
                      {formData.productos.map((producto, index) => (
                        <div key={`${producto}-${index}`} className="px-4 py-2 flex justify-between items-center">
                          <span>{producto}</span>
                          <button
                            type="button"
                            onClick={() => quitarProducto(producto)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Eliminar ${producto}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No se han agregado productos</p>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de página con botones de acción */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Save className="h-4 w-4 mr-2" />
              {proveedor ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProveedorForm;
