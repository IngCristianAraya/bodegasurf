import { X, Save, Building2, User, MapPin, Package, Phone, Mail, CreditCard, Check, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// Reusable form field component
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
  options,
  disabled = false,
  className = ''
}) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' ? (
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
          error ? 'border-red-500' : ''
        }`}
      >
        <option value="">Seleccione...</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${
          error ? 'border-red-500' : ''
        }`}
      />
    )}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Form section component
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

const ProveedorForm = ({ proveedor, onClose, onSave }) => {
  // Constants for dropdowns
  const departamentosPeru = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 
    'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 
    'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 
    'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
  ];

  const tiposDocumento = [
    { value: 'RUC', label: 'RUC - Registro Único de Contribuyentes' },
    { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
    { value: 'CE', label: 'CE - Carné de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'OTRO', label: 'Otro documento' }
  ];

  const tiposCuenta = [
    'Ahorros Soles',
    'Corriente Soles',
    'Ahorros Dólares',
    'Corriente Dólares',
    'Cuenta Interbancaria (CCI)'
  ];

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
    'Banco Cencosud'
  ];

  // Form state
  const [formData, setFormData] = useState({
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    razonSocial: '',
    nombreComercial: '',
    direccion: '',
    departamento: '',
    provincia: '',
    distrito: '',
    pais: 'Perú',
    contacto: '',
    cargo: '',
    telefono: '',
    celular: '',
    email: '',
    condicionPago: 'CONTADO',
    plazoPago: 0,
    limiteCredito: 0,
    cuentaBancaria: '',
    tipoCuenta: '',
    banco: '',
    cci: '',
    productos: [],
    notas: ''
  });

  const [nuevoProducto, setNuevoProducto] = useState('');
  const [errorProducto, setErrorProducto] = useState('');
  const [errores, setErrores] = useState({});

  // Load supplier data if provided
  useEffect(() => {
    if (proveedor) {
      setFormData({
        ...proveedor,
        productos: [...(proveedor.productos || [])]
      });
    }
  }, [proveedor]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new product
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
  }, [nuevoProducto, formData.productos]);

  // Remove a product
  const eliminarProducto = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index)
    }));
  }, []);

  // Validate RUC (Peruvian tax ID)
  const validarRUC = (ruc) => {
    if (!ruc) return false;
    if (ruc.length !== 11) return false;
    if (!/^[0-9]+$/.test(ruc)) return false;
    
    const digitos = ruc.split('').map(Number);
    const digitoVerificador = digitos.pop();
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    
    for (let i = 0; i < factores.length; i++) {
      suma += digitos[i] * factores[i];
    }
    
    const resto = suma % 11;
    const resultado = 11 - resto;
    const digitoEsperado = resultado === 10 ? 0 : resultado === 11 ? 1 : resultado;
    
    return digitoVerificador === digitoEsperado;
  };

  // Validate DNI (Peruvian national ID)
  const validarDNI = (dni) => {
    if (!dni) return false;
    return dni.length === 8 && /^[0-9]+$/.test(dni);
  };

  // Validate the entire form
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    // Document validation
    if (!formData.numeroDocumento.trim()) {
      nuevosErrores.numeroDocumento = 'El número de documento es requerido';
    } else if (formData.tipoDocumento === 'RUC' && !validarRUC(formData.numeroDocumento)) {
      nuevosErrores.numeroDocumento = 'El RUC no es válido';
    } else if (formData.tipoDocumento === 'DNI' && !validarDNI(formData.numeroDocumento)) {
      nuevosErrores.numeroDocumento = 'El DNI debe tener 8 dígitos numéricos';
    }
    
    // Required fields
    if (!formData.razonSocial.trim()) {
      nuevosErrores.razonSocial = 'La razón social es requerida';
    }
    
    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es requerida';
    }
    
    if (!formData.departamento) {
      nuevosErrores.departamento = 'El departamento es requerido';
    }
    
    if (!formData.contacto.trim()) {
      nuevosErrores.contacto = 'El nombre del contacto es requerido';
    }
    
    if (!formData.celular.trim()) {
      nuevosErrores.celular = 'El número de celular es requerido';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'El correo electrónico no es válido';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSave(formData);
    }
  };

  // Handle department change (reset province and district)
  const handleDepartamentoChange = (e) => {
    const nuevoDepartamento = e.target.value;
    setFormData(prev => ({
      ...prev,
      departamento: nuevoDepartamento,
      provincia: '',
      distrito: ''
    }));
  };

  // Render basic information section
  const renderInformacionBasica = () => (
    <FormSection title="Información Básica" icon={Building2}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Tipo de Documento"
          id="tipoDocumento"
          name="tipoDocumento"
          type="select"
          value={formData.tipoDocumento}
          onChange={handleChange}
          options={tiposDocumento}
          required
        />
        
        <FormField
          label="Número de Documento"
          id="numeroDocumento"
          name="numeroDocumento"
          value={formData.numeroDocumento}
          onChange={handleChange}
          placeholder="Ingrese el RUC o DNI"
          required
          error={errores.numeroDocumento}
        />
        
        <div className="md:col-span-2">
          <FormField
            label="Razón Social"
            id="razonSocial"
            name="razonSocial"
            value={formData.razonSocial}
            onChange={handleChange}
            placeholder="Ingrese la razón social"
            required
            error={errores.razonSocial}
          />
        </div>
        
        <FormField
          label="Nombre Comercial"
          id="nombreComercial"
          name="nombreComercial"
          value={formData.nombreComercial}
          onChange={handleChange}
          placeholder="Ingrese el nombre comercial"
        />
      </div>
    </FormSection>
  );

  // Render location section
  const renderUbicacion = () => (
    <FormSection title="Ubicación" icon={MapPin}>
      <div className="space-y-4">
        <FormField
          label="Dirección"
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección completa"
          required
          error={errores.direccion}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Departamento"
            id="departamento"
            name="departamento"
            type="select"
            value={formData.departamento}
            onChange={handleDepartamentoChange}
            options={departamentosPeru}
            required
            error={errores.departamento}
          />
          
          <FormField
            label="Provincia"
            id="provincia"
            name="provincia"
            value={formData.provincia}
            onChange={handleChange}
            placeholder="Ingrese la provincia"
            required={!!formData.departamento}
            disabled={!formData.departamento}
          />
          
          <FormField
            label="Distrito"
            id="distrito"
            name="distrito"
            value={formData.distrito}
            onChange={handleChange}
            placeholder="Ingrese el distrito"
            required={!!formData.provincia}
            disabled={!formData.provincia}
          />
        </div>
        
        <FormField
          label="País"
          id="pais"
          name="pais"
          value={formData.pais}
          onChange={handleChange}
          disabled
        />
      </div>
    </FormSection>
  );

  // Render contact information section
  const renderContacto = () => (
    <FormSection title="Información de Contacto" icon={User}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Persona de Contacto"
          id="contacto"
          name="contacto"
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
          value={formData.cargo}
          onChange={handleChange}
          placeholder="Cargo o puesto"
        />
        
        <FormField
          label="Teléfono Fijo"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Número de teléfono fijo"
          type="tel"
        />
        
        <FormField
          label="Celular"
          id="celular"
          name="celular"
          value={formData.celular}
          onChange={handleChange}
          placeholder="Número de celular"
          type="tel"
          required
          error={errores.celular}
        />
        
        <div className="md:col-span-2">
          <FormField
            label="Correo Electrónico"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@empresa.com"
            type="email"
            required
            error={errores.email}
          />
        </div>
      </div>
    </FormSection>
  );

  // Render commercial information section
  const renderInformacionComercial = () => (
    <FormSection title="Información Comercial" icon={CreditCard}>
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
        />
        
        <FormField
          label="Plazo de Pago (días)"
          id="plazoPago"
          name="plazoPago"
          type="number"
          min="0"
          value={formData.plazoPago}
          onChange={handleChange}
          disabled={formData.condicionPago !== 'CREDITO'}
        />
        
        <div className="md:col-span-2">
          <FormField
            label="Límite de Crédito (S/)"
            id="limiteCredito"
            name="limiteCredito"
            type="number"
            min="0"
            step="0.01"
            value={formData.limiteCredito}
            onChange={handleChange}
            placeholder="0.00"
            disabled={formData.condicionPago !== 'CREDITO'}
          />
        </div>
      </div>
    </FormSection>
  );

  // Render bank information section
  const renderInformacionBancaria = () => (
    <FormSection title="Información Bancaria" icon={CreditCard}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Número de Cuenta"
          id="cuentaBancaria"
          name="cuentaBancaria"
          value={formData.cuentaBancaria}
          onChange={handleChange}
          placeholder="Número de cuenta bancaria"
        />
        
        <FormField
          label="Tipo de Cuenta"
          id="tipoCuenta"
          name="tipoCuenta"
          type="select"
          value={formData.tipoCuenta}
          onChange={handleChange}
          options={tiposCuenta}
        />
        
        <FormField
          label="Banco"
          id="banco"
          name="banco"
          type="select"
          value={formData.banco}
          onChange={handleChange}
          options={bancosPeru}
        />
        
        <FormField
          label="CCI"
          id="cci"
          name="cci"
          value={formData.cci}
          onChange={handleChange}
          placeholder="Código de Cuenta Interbancario"
        />
      </div>
    </FormSection>
  );

  // Render products section
  const renderProductos = () => (
    <FormSection title="Productos que Suministra" icon={Package}>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              id="nuevo-producto"
              value={nuevoProducto}
              onChange={(e) => setNuevoProducto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarProducto())}
              placeholder="Nombre del producto"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            />
            {errorProducto && <p className="mt-1 text-sm text-red-600">{errorProducto}</p>}
          </div>
          <button
            type="button"
            onClick={agregarProducto}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Agregar
          </button>
        </div>
        
        {formData.productos && formData.productos.length > 0 ? (
          <ul className="border rounded-md divide-y divide-gray-200">
            {formData.productos.map((producto, index) => (
              <li key={index} className="px-4 py-2 flex justify-between items-center">
                <span className="text-sm text-gray-700">{producto}</span>
                <button
                  type="button"
                  onClick={() => eliminarProducto(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No se han agregado productos</p>
        )}
      </div>
    </FormSection>
  );

  // Render notes section
  const renderNotas = () => (
    <FormSection title="Notas Adicionales" icon={FileText}>
      <div>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          value={formData.notas}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
          placeholder="Ingrese cualquier información adicional importante"
        />
      </div>
    </FormSection>
  );

  // Main component render
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
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
        
        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {renderInformacionBasica()}
            {renderUbicacion()}
            {renderContacto()}
            {renderInformacionComercial()}
            {renderInformacionBancaria()}
            {renderProductos()}
            {renderNotas()}
          </div>
          
          {/* Form actions */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Save className="-ml-1 mr-2 h-5 w-5" />
              {proveedor ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProveedorForm;
