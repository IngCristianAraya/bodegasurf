import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// MUI Components
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  Box,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  InputAdornment,
  Collapse,
  useTheme,
  alpha,
  styled,
  Theme
} from '@mui/material';

// MUI Icons
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Receipt as ReceiptIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Date Picker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Hooks
import api from '../../utils/api';
import { usePayments } from '@hooks/usePayments';
import { useCulqi } from '@hooks/useCulqi';

// Types
type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled' | 'aprobado' | 'pendiente' | 'rechazado';
type PaymentMethod = 'transfer' | 'credit_card' | 'paypal' | 'cash' | 'other' | 'transferencia' | 'deposit' | 'yape' | 'plin';

// Interfaces
interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;
  logo: string;
  currency: string;
  timezone: string;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  paymentMethods: string[];
  settings: {
    payment: {
      bankAccounts: Array<{
        id: string;
        bankName: string;
        accountNumber: string;
        accountType: string;
        currency: string;
        isActive: boolean;
      }>;
      paymentMethods: string[];
      isPaymentEnabled: boolean;
      paymentInstructions: string;
    };
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  receiptUrl?: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  orderNumber?: string;
  paymentDate?: string;
  paymentProof?: string;
  paymentProofUrl?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
}

interface PaymentFormData {
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference: string;
  description: string;
  paymentDate: Date | null;
  paymentProof: File | null;
  notes: string;
}

interface PaymentSettingsProps {
  tenant: string | Tenant;
  onUpdate?: () => void;
}

// Styled Components
interface StyledCardProps {
  theme: Theme;
}

const StyledCard = styled(Card)<StyledCardProps>(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  '& .MuiCardHeader-root': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1),
    },
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
  },
}));

interface StatusIndicatorProps {
  status: PaymentStatus;
}

const StyledStatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<StatusIndicatorProps>(({ theme, status }) => {
  const statusColors = {
    approved: theme.palette.success.main,
    aprobado: theme.palette.success.main,
    pending: theme.palette.warning.main,
    pendiente: theme.palette.warning.main,
    rejected: theme.palette.error.main,
    rechazado: theme.palette.error.main,
    completed: theme.palette.info.main,
    failed: theme.palette.error.dark,
    cancelled: theme.palette.grey[500]
  };

  const backgroundColor = statusColors[status as keyof typeof statusColors] || theme.palette.grey[300];
  
  return {
    backgroundColor,
    color: theme.palette.getContrastText(backgroundColor),
    fontWeight: 500,
    textTransform: 'capitalize',
    minWidth: 100,
    justifyContent: 'center',
    '& .MuiChip-label': {
      padding: '0 8px'
    }
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  textTransform: 'none',
  fontWeight: 500,
}));

const LastUpdatedInfo = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontStyle: 'italic',
}));

  '&:first-of-type': {
    marginLeft: 0,
  },
  '&:last-child': {
    marginRight: 0,
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },
  },
}));

const StyledFileInput = styled('input')({
  display: 'none',
});

const StyledFileLabel = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: 4,
  backgroundColor: theme.palette.grey[100],
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },
}));

// Loading overlay component
const LoadingOverlay = ({ loading, children }: { loading: boolean; children: React.ReactNode }) => (
  <Box sx={{ position: 'relative' }}>
    {children}
    {loading && (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1,
        }}
      >
        <CircularProgress />
      </Box>
    )}
  </Box>
);

// Reason form component
const ReasonForm = ({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
}) => {
  const [reason, setReason] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Motivo del Rechazo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo"
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={!reason || loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Action buttons component
const ActionButtons = ({
  status,
  onApprove,
  onReject,
  loading,
  disabled,
}: {
  status: PaymentStatus;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
  disabled?: boolean;
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
    {status === 'pending' && (
      <>
        <ActionButton
          variant="contained"
          color="success"
          onClick={onApprove}
          disabled={loading || disabled}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleOutline />}
        >
          Aprobar
        </ActionButton>
        <ActionButton
          variant="outlined"
          color="error"
          onClick={onReject}
          disabled={loading || disabled}
          startIcon={loading ? <CircularProgress size={20} /> : <HighlightOff />}
        >
          Rechazar
        </ActionButton>
      </>
    )}
  </Box>
);

// Constants
const PAYMENT_METHODS: PaymentMethodOption[] = [
  { value: 'transfer', label: 'Transferencia Bancaria' },
  { value: 'deposit', label: 'Depósito' },
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'other', label: 'Otro' },
];

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments } from '@/hooks/usePayments';
import { useCulqi } from '@/hooks/useCulqi';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  FormLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Types
type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled' | 'aprobado' | 'pendiente';
type PaymentMethod = 'transfer' | 'credit_card' | 'paypal' | 'cash' | 'other' | 'transferencia';

interface Payment {
  _id: string;
  id: string;
  amount: number;
  date: string;
  paymentDate: string;
  status: PaymentStatus;
  reference: string;
  paymentMethod: PaymentMethod;
  method: string;
  receiptUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  tenant?: string;
}

interface PaymentFormData {
  amount: number;
  paymentDate: string;
  reference: string;
  paymentMethod: PaymentMethod;
  receipt: File | null;
  notes: string;
}

interface PaymentSettingsProps {
  tenant?: string;
  onUpdate?: () => void;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ tenant = '', onUpdate = () => {} }) => {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  // UI State
  const [showManualPayment, setShowManualPayment] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [switchChecked, setSwitchChecked] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    paymentMethod: 'transferencia',
    receipt: null,
    notes: ''
  });

  // Payment and plan data from hooks
  const { 
    payments = [], 
    loading: paymentsLoading, 
    uploadReceipt 
  } = usePayments(tenant) || {};

  const { 
    initCulqi, 
    processPayment, 
    loading: paymentProcessing 
  } = useCulqi() || {};

  // Plan information
  const planInfo = {
    price: 99.00,
    name: 'Plan Premium',
    currency: 'PEN',
    billingCycle: 'Mensual',
    features: [
      'Acceso completo a todas las funciones',
      'Soporte prioritario',
      'Actualizaciones automáticas',
      'Integración con pasarelas de pago'
    ]
  const formRef = useRef<HTMLFormElement>(null);

  // UI State
  const [showReasonInput, setShowReasonInput] = useState<boolean>(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [showManualPayment, setShowManualPayment] = useState<boolean>(false);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  // Form State
  const [tempReason, setTempReason] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Form state
  const [paymentData, setPaymentData] = useState<PaymentFormData>(() => ({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    paymentMethod: 'transferencia' as PaymentMethod,
    receipt: null,
    notes: ''
  }));

  // Switch state
  const [switchChecked, setSwitchChecked] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment and plan data from hooks
  const { 
    payments, 
    loading: loadingPayments, 
    uploadReceipt 
  } = usePayments(tenant?.id);

  const { 
    initCulqi, 
    processPayment, 
    loading: processingPayment 
  } = useCulqi();

  // Plan information
  const [planInfo, setPlanInfo] = useState({
    price: 99.00,
    name: 'Plan Premium',
    currency: 'PEN',
    billingCycle: 'Mensual'
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentData(prev => ({
        ...prev,
        receipt: e.target.files[0]
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await uploadReceipt(paymentData);
      setShowManualPayment(false);
      // Reset form
      setPaymentData({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        reference: '',
        paymentMethod: 'transfer',
        receipt: null
      });
    } catch (error) {
      console.error('Error uploading receipt:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Datos de ejemplo del plan (deberían venir de la API)
  const planInfo = {
    name: 'Plan Premium',
    price: 99.00,
    currency: 'PEN',
    billingCycle: 'mensual',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde hoy
    features: [
      'Hasta 50 productos',
      'Soporte prioritario',
      'Reportes avanzados',
      'Integración con pasarelas de pago'
    ]
  };

  const {
    isActive,
    reason,
    lastUpdated,
    lastUpdatedBy,
    isLoading,
    isSaving,
    error,
    showRetry,
    fetchStatus,
    updatePaymentStatus
  } = usePaymentStatus(tenant?.id);

  // Update switch state when isActive changes
  useEffect(() => {
    setSwitchChecked(isActive);
  }, [isActive]);

  const handleSwitchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    
    // If activating, update directly
    if (newStatus) {
      await updatePaymentStatus(true);
      setShowReasonInput(false);
      setTempReason('');
    } else {
      // If deactivating, show reason input
      setShowReasonInput(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempReason.trim()) {
      toast.error('Por favor ingresa una razón para desactivar los pagos', { position: 'top-right' });
      return;
    }
    
    const success = await updatePaymentStatus(false, tempReason);
    if (success) {
      setTempReason('');
      setShowReasonInput(false);
    }
  };

  const handleCancel = () => {
    setShowReasonInput(false);
    setTempReason('');
    setSwitchChecked(true);
  };

  const handleRetry = () => {
    fetchStatus();
  };

  // Inicializar Culqi al montar el componente
  useEffect(() => {
    initCulqi();
  }, []);

  // Manejar pago exitoso con Culqi
  const handleCulqiPayment = async (token: any) => {
    try {
      const paymentData = {
        token: token.id,
        amount: planInfo.price * 100, // Convertir a centavos
        currency: planInfo.currency,
        description: `Pago de ${planInfo.name} - ${planInfo.billingCycle}`,
        email: user?.email,
        tenantId: tenant?.id
      };
      
      const result = await processPayment(paymentData);
      if (result.success) {
        toast.success('¡Pago procesado con éxito!');
        setShowPaymentDialog(false);
        // Actualizar estado de pagos
        await fetchPayments();
      }
    } catch (error) {
      toast.error('Error al procesar el pago');
      console.error('Payment error:', error);
    }
  };

  // Configurar el botón de Culqi
  useEffect(() => {
    if (window.Culqi) {
      window.Culqi.settings({
        title: 'BodegaSurf',
        currency: planInfo.currency,
        description: planInfo.name,
        amount: planInfo.price * 100,
        order: `order-${Date.now()}`,
      });
      
      window.Culqi.options({
        lang: 'auto',
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          bancaMovil: true,
          billetera: true,
          cuotealo: false,
        },
        style: {
          logo: '/logo.png',
          bannerColor: '#ffffff',
          buttonBackground: '#3f51b5',
          menuColor: '#3f51b5',
          linksColor: '#3f51b5',
          buttonText: 'Pagar',
          buttonTextColor: '#ffffff',
          priceColor: '#000000',
        },
      });
      
      // Manejador de éxito de Culqi
      window.document.addEventListener('payment_event', async (token) => {
        await handleCulqiPayment(token);
      });
    }
    
    return () => {
      window.document.removeEventListener('payment_event', handleCulqiPayment);
    };
  }, []);

  // Modal para pago en línea
  const renderPaymentDialog = () => (
    <Dialog 
      open={showPaymentDialog} 
      onClose={() => setShowPaymentDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Pagar con Culqi</DialogTitle>
      <DialogContent>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" gutterBottom>
            Monto a pagar: S/ 99.00
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Selecciona tu método de pago preferido
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2} maxWidth={300} mx="auto" my={3}>
            <Button 
              variant="outlined" 
              startIcon={<img src="/culqi-logo.png" alt="Culqi" height={24} />}
              onClick={() => {
                // Aquí iría la lógica para abrir el formulario de Culqi
                console.log('Iniciando pago con Culqi');
              }}
            >
              Pagar con Tarjeta
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<img src="/yape-logo.png" alt="Yape" height={24} />}
              onClick={() => {
                // Lógica para pago con Yape
                console.log('Iniciando pago con Yape');
              }}
            >
              Pagar con Yape
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<img src="/plin-logo.png" alt="Plin" height={24} />}
              onClick={() => {
                // Lógica para pago con Plin
                console.log('Iniciando pago con Plin');
              }}
            >
              Pagar con Plin
            </Button>
          </Box>
          
          <Typography variant="caption" color="textSecondary">
            Al continuar, aceptas los Términos y Condiciones de Culqi
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );

  // Modal para subir comprobante
  const renderManualPaymentDialog = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState('');
    
    const [paymentData, setPaymentData] = useState<PaymentFormData>({
      amount: planInfo.price,
      paymentDate: new Date().toISOString().split('T')[0],
      reference: '',
      paymentMethod: 'transferencia',
      notes: ''
    });

    const paymentMethods = [
      { value: 'transferencia', label: 'Transferencia Bancaria' },
      { value: 'deposito', label: 'Depósito Bancario' },
      { value: 'efectivo', label: 'Efectivo' },
      { value: 'otro', label: 'Otro' },
    ];

    // Generar vista previa de la imagen
    useEffect(() => {
      if (!file) {
        setPreview('');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Limpiar el objeto URL cuando el componente se desmonte
      return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const validateForm = () => {
      const newErrors = {};
      
      if (!file) {
        newErrors.file = 'Por favor, selecciona un archivo';
      } else {
        const fileSize = file.size / 1024 / 1024; // en MB
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        
        if (!validTypes.includes(file.type)) {
          newErrors.file = 'Formato de archivo no válido. Sube una imagen (JPEG, PNG) o PDF';
        } else if (fileSize > 5) {
          newErrors.file = 'El archivo es demasiado grande (máx. 5MB)';
        }
      }

      if (!paymentData.paymentDate) {
        newErrors.paymentDate = 'La fecha de pago es requerida';
      }

      if (!paymentData.reference.trim()) {
        newErrors.reference = 'La referencia de pago es requerida';
      }

      if (paymentData.amount <= 0) {
        newErrors.amount = 'El monto debe ser mayor a 0';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPaymentData(prev => ({
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) || 0 : value
      }));
      
      // Limpiar el error del campo al modificar
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        // Limpiar error de archivo al seleccionar uno nuevo
        if (errors.file) {
          setErrors(prev => ({
            ...prev,
            file: null
          }));
        }
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }
      
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('paymentDate', paymentData.paymentDate);
        formData.append('reference', paymentData.reference);
        formData.append('amount', paymentData.amount);
        formData.append('paymentMethod', paymentData.paymentMethod);
        if (paymentData.notes) {
          formData.append('notes', paymentData.notes);
        }
        formData.append('tenantId', tenant?.id);
        formData.append('userId', user?.id);
        
        await uploadReceipt(formData);
        
        toast.success('✅ Comprobante subido correctamente. Está pendiente de verificación.');
        
        // Resetear formulario
        setFile(null);
        setPaymentData({
          amount: planInfo.price,
          paymentDate: new Date().toISOString().split('T')[0],
          reference: '',
          paymentMethod: 'transferencia',
          notes: ''
        });
        setErrors({});
        
        // Cerrar el modal después de 1.5 segundos
        setTimeout(() => {
          setShowManualPayment(false);
        }, 1500);
        
      } catch (error) {
        console.error('Error al subir el comprobante:', error);
        toast.error(`❌ ${error.message || 'Error al subir el comprobante. Por favor, inténtalo de nuevo.'}`);
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <Dialog 
        open={showManualPayment} 
        onClose={() => !isUploading && setShowManualPayment(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 1 }}>
            <Box display="flex" alignItems="center">
              <CloudUploadIcon sx={{ mr: 1 }} />
              Subir Comprobante de Pago
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box py={2}>
              <Grid container spacing={3}>
                {/* Columna izquierda - Formulario */}
                <Grid item xs={12} md={6} component="div">
                  <Typography variant="subtitle1" gutterBottom color="textPrimary">
                    Información del Pago
                  </Typography>
                  
                  <Grid container spacing={2} component="div">
                    <Grid item xs={12} sm={6} component="div">
                      <TextField
                        fullWidth
                        label="Monto (S/)"
                        name="amount"
                        type="number"
                        value={paymentData.amount || ''}
                        onChange={handleInputChange}
                        error={!!errors.amount}
                        helperText={errors.amount}
                        inputProps={{
                          min: "0.01",
                          step: "0.01"
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                        }}
                        disabled={isUploading}
                        variant="outlined"
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Fecha de Pago"
                        name="paymentDate"
                        type="date"
                        value={paymentData.paymentDate}
                        onChange={handleInputChange}
                        error={!!errors.paymentDate}
                        helperText={errors.paymentDate}
                        disabled={isUploading}
                        variant="outlined"
                        margin="normal"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Número de Operación/Referencia"
                        name="reference"
                        value={paymentData.reference}
                        onChange={handleInputChange}
                        error={!!errors.reference}
                        helperText={errors.reference || 'Número de operación, transferencia o referencia'}
                        disabled={isUploading}
                        variant="outlined"
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Método de Pago"
                        name="paymentMethod"
                        value={paymentData.paymentMethod}
                        onChange={handleInputChange}
                        disabled={isUploading}
                        variant="outlined"
                        margin="normal"
                      >
                        {paymentMethods.map((method) => (
                          <MenuItem key={method.value} value={method.value}>
                            {method.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notas (Opcional)"
                        name="notes"
                        value={paymentData.notes}
                        onChange={handleInputChange}
                        disabled={isUploading}
                        variant="outlined"
                        margin="normal"
                        multiline
                        rows={3}
                        placeholder="Agrega cualquier información adicional sobre este pago"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                
                {/* Columna derecha - Subida de archivo */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom color="textPrimary">
                    Comprobante de Pago
                  </Typography>
                  
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: errors.file ? 'error.main' : 'divider',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onClick={() => document.getElementById('receipt-upload').click()}
                  >
                    <input
                      id="receipt-upload"
                      type="file"
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    
                    {preview ? (
                      <>
                        {file.type.startsWith('image/') ? (
                          <img
                            src={preview}
                            alt="Vista previa del comprobante"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              marginBottom: '16px',
                              borderRadius: '4px',
                              border: '1px solid #e0e0e0',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              bgcolor: 'grey.100',
                              p: 3,
                              borderRadius: 1,
                              mb: 2,
                              width: '100%',
                              textAlign: 'center',
                            }}
                          >
                            <PictureAsPdfIcon sx={{ fontSize: 64, color: 'error.main' }} />
                            <Typography variant="body2" color="textSecondary">
                              {file.name}
                            </Typography>
                          </Box>
                        )}
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<CloudUploadIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('receipt-upload').click();
                          }}
                          disabled={isUploading}
                          sx={{ mt: 1 }}
                        >
                          Cambiar archivo
                        </Button>
                      </>
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
                        <Typography variant="body1" gutterBottom>
                          Haz clic o arrastra un archivo aquí
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          Formatos aceptados: JPG, PNG, PDF (máx. 5MB)
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          component="span"
                          disabled={isUploading}
                        >
                          Seleccionar archivo
                        </Button>
                      </>
                    )}
                    
                    {errors.file && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {errors.file}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box mt={2}>
                    <Alert severity="info" icon={<InfoIcon fontSize="small" />}>
                      <Typography variant="caption">
                        Asegúrate de que la imagen o PDF sea legible y contenga la información del pago.
                      </Typography>
                    </Alert>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button 
              onClick={() => !isUploading && setShowManualPayment(false)}
              disabled={isUploading}
              color="inherit"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isUploading || !file}
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            >
              {isUploading ? 'Subiendo...' : 'Subir Comprobante'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  // Componente de historial de pagos
  const renderPaymentHistory = () => {
    const [localShowHistory, setLocalShowHistory] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showManualPayment, setShowManualPayment] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [tempReason, setTempReason] = useState('');
    const [reason, setReason] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [lastUpdatedBy, setLastUpdatedBy] = useState('');
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [switchChecked, setSwitchChecked] = useState(false);
    
    // Mock data for development
    const mockPayments: Payment[] = [
      {
        _id: '1',
        id: '1',
        amount: 100,
        date: '2023-01-01',
        paymentDate: '2023-01-01',
        status: 'completed' as PaymentStatus,
        reference: 'REF-123',
        paymentMethod: 'transfer',
        method: 'Transferencia Bancaria',
        receiptUrl: '/receipts/sample.pdf',
        notes: 'Pago mensual de suscripción'
      }
    ];
    
    // Initialize with mock data for development
    useEffect(() => {
      setPayments(mockPayments);
    }, []);
    
    // Handle switch change
    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSwitchChecked(event.target.checked);
      setShowReasonInput(!event.target.checked);
      if (event.target.checked) {
        setTempReason('');
      }
    };
    
    // Handle cancel action
    const handleCancel = () => {
      setShowPaymentDialog(false);
      setSelectedPayment(null);
      setTempReason('');
      setShowReasonInput(false);
    };
    
    // Handle retry action
    const handleRetry = () => {
      // Implement retry logic here
      console.log('Retrying payment...');
    };
    
    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!selectedFile) return;
      
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('receipt', selectedFile);
        
        // Example API call (uncomment and implement as needed)
        /*
        const response = await api.post('/payments/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Update payments list after successful upload
        if (response.data.payment) {
          setPayments(prev => [response.data.payment, ...prev]);
        }
        */
        
        setSelectedFile(null);
        setShowPaymentDialog(false);
        
        // Reset file input
        const fileInput = document.getElementById('payment-receipt') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        toast.success('Comprobante subido exitosamente');
      } catch (error) {
        console.error('Error al subir el comprobante:', error);
        toast.error('Error al subir el comprobante');
      } finally {
        setIsUploading(false);
      }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const newFile = event.target.files[0];
        setSelectedFile(newFile);
        setFile(newFile);
      }
    };

    const handleManualPaymentSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!file) return;
      
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('receipt', file);
        
        // Example API call (uncomment and implement as needed)
        /*
        const response = await api.post('/payments/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Update payments list after successful upload
        if (response.data.payment) {
          setPayments(prev => [response.data.payment, ...prev]);
        }
        */
        
        setFile(null);
        setSelectedFile(null);
        setShowManualPayment(false);
        
        // Reset file input
        const fileInput = document.getElementById('payment-receipt') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        toast.success('Comprobante subido exitosamente');
      } catch (error) {
        console.error('Error al subir el comprobante:', error);
        toast.error('Error al subir el comprobante');
      } finally {
        setIsUploading(false);
      }
    };
      }
    };

    const handleManualPaymentSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!file) return;
      
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('receipt', file);
        
        // Example API call (uncomment and implement as needed)
        /*
        await api.post('/payments/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        */
        
        setFile(null);
        setShowManualPayment(false);
        
        // Reset file input
        const fileInput = document.getElementById('payment-receipt') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        toast.success('Comprobante subido exitosamente');
      } catch (error) {
        console.error('Error al subir el comprobante:', error);
        toast.error('Error al subir el comprobante');
      } finally {
        setIsUploading(false);
      }
    };

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!selectedFile) return;
      
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('receipt', selectedFile);
        
        // Example API call (uncomment and implement as needed)
        /*
        await api.post('/payments/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        */
        
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('payment-receipt') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        toast.success('Comprobante subido exitosamente');
      } catch (error) {
        console.error('Error al subir el comprobante:', error);
        toast.error('Error al subir el comprobante');
      } finally {
        setIsUploading(false);
      }
    };
    
    return (
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <HistoryIcon sx={{ mr: 1 }} />
                <span>Historial de Pagos</span>
              </Box>
              <IconButton 
                onClick={() => setLocalShowHistory(!localShowHistory)}
                size="small"
              >
                {localShowHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          } 
      />
      <Collapse in={showHistory}>
        <CardContent>
          {loadingPayments ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : payments.length === 0 ? (
            <Alert severity="info">No hay registros de pagos</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell>Referencia</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow 
                      key={payment._id}
                      hover
                      onClick={() => setSelectedPayment(payment)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {format(new Date(payment.paymentDate), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        S/ {payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.status}
                          color={
                            payment.status === 'aprobado' ? 'success' : 
                            payment.status === 'pendiente' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>{payment.reference || 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );

  // Modal de detalle de pago
  const renderPaymentDetail = () => (
    <Dialog 
      open={!!selectedPayment} 
      onClose={() => setSelectedPayment(null)}
      maxWidth="sm"
      fullWidth
    >
      {selectedPayment && (
        <>
          <DialogTitle>Detalle del Pago</DialogTitle>
          <DialogContent>
            <Box py={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Fecha</Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedPayment.paymentDate), 'PPP', { locale: es })}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Monto</Typography>
                  <Typography variant="h6">
                    S/ {selectedPayment.amount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Estado</Typography>
                  <Chip 
                    label={selectedPayment.status}
                    color={
                      selectedPayment.status === 'aprobado' ? 'success' : 
                      selectedPayment.status === 'pendiente' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Método</Typography>
                  <Typography variant="body1">
                    {selectedPayment.paymentMethod}
                  </Typography>
                </Grid>
                {selectedPayment.reference && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Referencia</Typography>
                    <Typography variant="body1">
                      {selectedPayment.reference}
                    </Typography>
                  </Grid>
                )}
                {selectedPayment.receiptUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Comprobante
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                    >
                      Ver Comprobante
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedPayment(null)}>Cerrar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  return (
    <>
      <Card>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center">
            <SettingsIcon />
            <span>Configuración de Pagos</span>
          </Box>
        } 
      />
      <CardContent>
        <Box position="relative">
          {(isLoading || isSaving) && (
            <LoadingOverlay>
              <CircularProgress />
            </LoadingOverlay>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }} 
              action={
                showRetry && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleRetry}
                    startIcon={<RefreshIcon />}
                  >
                    Reintentar
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" gutterBottom>
                Estado del Sistema de Pagos
              </Typography>
              <StatusIndicator isActive={isActive}>
                {isActive ? (
                  <>
                    <CheckCircleIcon />
                    <span>Activo</span>
                  </>
                ) : (
                  <>
                    <ErrorIcon />
                    <span>Inactivo</span>
                  </>
                )}
              </StatusIndicator>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={switchChecked}
                  onChange={handleSwitchChange}
                  color="primary"
                  disabled={isLoading || isSaving}
                />
              }
              label={switchChecked ? 'Activado' : 'Desactivado'}
              labelPlacement="start"
            />
          </Box>

          {!isActive && reason && (
            <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Razón de desactivación:</strong> {reason}
              </Typography>
            </Alert>
          )}

          <Collapse in={showReasonInput}>
            <ReasonForm onSubmit={handleSubmit}>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                label="Razón de desactivación"
                value={tempReason}
                onChange={(e) => setTempReason(e.target.value)}
                helperText="Por favor, indique el motivo por el cual se desactiva el sistema de pagos"
                required
              />
              <ActionButtons>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={isSaving || !tempReason.trim()}
                >
                  {isSaving ? 'Guardando...' : 'Confirmar'}
                </Button>
              </ActionButtons>
            </ReasonForm>
          </Collapse>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Información de Pago
            </Typography>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography><strong>Estado del Pago:</strong></Typography>
                <Chip 
                  label={isActive ? 'Al día' : 'Pendiente'} 
                  color={isActive ? 'success' : 'warning'} 
                  size="small" 
                />
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Próximo vencimiento:</strong> 10/06/2024
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                <strong>Monto a pagar:</strong> S/ 99.00
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<PaymentIcon />}
                  onClick={() => setShowPaymentDialog(true)}
                >
                  Pagar Ahora
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ReceiptIcon />}
                  onClick={() => setShowManualPayment(true)}
                >
                  Subir Comprobante
                </Button>
              </Box>
            </Card>
            
            <LastUpdatedInfo>
              <Typography variant="caption" display="block" color="textSecondary">
                <strong>Última actualización:</strong> {lastUpdated || 'Nunca'}
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary">
                <strong>Actualizado por:</strong> {lastUpdatedBy || 'Sistema'}
              </Typography>
            </LastUpdatedInfo>
          </Box>
        </Box>
      </CardContent>
      </Card>
      
      {/* Historial de pagos */}
      {renderPaymentHistory()}
      
      {/* Modales */}
      {renderPaymentDialog()}
      {renderManualPaymentDialog()}
      {renderPaymentDetail()}
    </>
  );
};

PaymentSettings.propTypes = {
  tenant: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
};

export default PaymentSettings;
