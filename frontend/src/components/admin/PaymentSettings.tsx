import React, { useState, useRef, useEffect, FC, useCallback } from 'react';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import PropTypes from 'prop-types';

// Material-UI Components
import { 
  Box, 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  CircularProgress, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Collapse, 
  IconButton,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  InputAdornment,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Select,
  FormHelperText,
  TablePagination,
  Tooltip,
  alpha,
  Theme,
  styled,
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  CardMedia,
  CardActions
} from '@mui/material';

// Material-UI Icons
import {
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  PendingActions as PendingActionsIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  HighlightOff as HighlightOffIcon
} from '@mui/icons-material';

// Hooks
import React, { FC, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useTheme,
  styled
} from '@mui/material';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  AttachMoney as AttachMoneyIcon,
  Check as CheckIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  HighlightOff as HighlightOffIcon,
  Payment as PaymentIcon,
  PendingActions as PendingActionsIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { usePayments } from '../../hooks/usePayments';
import { toast } from 'react-toastify';

// Types
type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
type PaymentMethod = 'transfer' | 'deposit' | 'yape' | 'plin' | 'credit_card';

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon?: React.ReactNode;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  paymentDate: Date | string;
  notes?: string;
  paymentProof?: string | File;
}

interface PaymentDetail {
  id: string;
  // Add other payment detail fields as needed
}

interface PaymentHistory {
  id: string;
  // Add other history fields as needed
}

interface PaymentFormData {
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference: string;
  description: string;
  paymentDate: Date;
  paymentProof: File | null;
  notes: string;
}

interface PaymentSettingsProps {
  onClose: () => void;
  tenant: any; // Replace 'any' with proper type
  onUpdate: () => void;
}

// Status Indicator Component
const StatusIndicator: FC<{ status: PaymentStatus }> = ({ status }) => {
  const statusConfig = {
    approved: {
      icon: <CheckCircleOutlineIcon fontSize="small" color="success" />,
      label: 'Aprobado'
    },
    pending: {
      icon: <ScheduleIcon fontSize="small" color="warning" />,
      label: 'Pendiente'
    },
    rejected: {
      icon: <HighlightOffIcon fontSize="small" color="error" />,
      label: 'Rechazado'
    },
    cancelled: {
      icon: <HighlightOffIcon fontSize="small" color="default" />,
      label: 'Cancelado'
    },
    refunded: {
      icon: <RefreshIcon fontSize="small" color="info" />,
      label: 'Reembolsado'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant="outlined"
        size="small"
      />
    </Box>
  );
};

// Utils
import api from '../../utils/api';

// =============================================
// Type Definitions
// =============================================

type PaymentMethod = 'transfer' | 'deposit' | 'yape' | 'plin' | 'credit_card';

type PaymentMethodLabel = 'Transferencia Bancaria' | 'Depósito' | 'Yape' | 'Plin' | 'Tarjeta de Crédito';
type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';

interface PaymentMethodOption {
  value: PaymentMethod;
  label: PaymentMethodLabel;
  icon?: React.ReactNode;
  description?: string;
}

// Payment method options
const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { 
    value: 'transfer', 
    label: 'Transferencia Bancaria',
    icon: <AccountBalanceWalletIcon />
  },
  { 
    value: 'deposit', 
    label: 'Depósito',
    icon: <AccountBalanceWalletIcon />
  },
  { 
    value: 'yape', 
    label: 'Yape',
    icon: <PaymentIcon />
  },
  { 
    value: 'plin', 
    label: 'Plin',
    icon: <PaymentIcon />
  },
  { 
    value: 'credit_card', 
    label: 'Tarjeta de Crédito',
    icon: <CreditCardIcon />
  }
] as const;

export interface Payment {
  _id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  description?: string;
  paymentDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentHistory {
  _id: string;
  paymentId: string;
  status: PaymentStatus;
  changedBy: string;
  changedAt: Date | string;
  notes?: string;
}

export interface PaymentDetail {
  _id: string;
  payment: Payment;
  history: PaymentHistory[];
  tenant: {
    _id: string;
    name: string;
    email: string;
  };
  subscription: {
    _id: string;
    name: string;
    price: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
  };
  invoiceNumber: string;
  dueDate: Date | string;
  paidAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  settings?: {
    currency?: string;
    timezone?: string;
    language?: string;
    dateFormat?: string;
  };
  subscription?: {
    plan: string;
    status: 'active' | 'inactive' | 'suspended' | 'cancelled';
    startDate: Date | string;
    endDate?: Date | string;
    trialEndsAt?: Date | string;
  };
  paymentMethods?: Array<{
    type: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
  }>;
  billingEmail?: string;
  taxId?: string;
  vatNumber?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaymentSettingsProps {
  tenant: string | { _id: string; name: string };
  onUpdate?: () => void;
}

// =============================================
// Styled Components
// =============================================

const StyledStatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: PaymentStatus }>(({ theme, status }) => {
  const statusColors: Record<string, string> = {
    approved: theme.palette.success.main,
    aprobado: theme.palette.success.main,
    pending: theme.palette.warning.main,
    pendiente: theme.palette.warning.main,
    rejected: theme.palette.error.main,
    rechazado: theme.palette.error.main,
    processing: theme.palette.info.main,
    completed: theme.palette.success.dark,
    failed: theme.palette.error.dark,
    cancelled: theme.palette.grey[500],
  };

  const backgroundColor = statusColors[status] || theme.palette.grey[300];
  
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

// =============================================
// Type Definitions (consolidated)
// =============================================

/**
 * Payment form data
 */
interface PaymentFormData {
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference: string;
  description: string;
  paymentDate: string | Date | null;
  paymentProof: File | null;
  notes: string;
}

// =============================================
// Styled Components
// =============================================

const StyledCard = styled(Card)(({ theme }: { theme: Theme }) => ({
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



const PaymentSettings: FC<PaymentSettingsProps> = ({ onClose, tenant, onUpdate }) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Payment; direction: 'asc' | 'desc' }>({
    key: 'paymentDate',
    direction: 'desc'
  });
  
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    currency: 'PEN',
    method: 'transfer',
    reference: '',
    description: '',
    paymentDate: new Date(),
    paymentProof: null,
    notes: ''
  });
  
  const theme = useTheme();
  const { user } = useAuth();
  const { processPayment, getPaymentHistory } = usePayments();
  const theme = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>('');
  const [showRetry, setShowRetry] = useState(false);
  
  // Render payment history
  const renderPaymentHistory = (): JSX.Element => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Historial de Pagos
        </Typography>
        {paymentHistory.length === 0 ? (
          <Typography>No hay registros de pago</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.amount} {payment.currency}</TableCell>
                    <TableCell>
                      <StatusIndicator status={payment.status} />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewPayment(payment)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  // Handle view payment details
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetail(true);
  };

  // Render payment dialog
  const renderPaymentDialog = (): JSX.Element | null => {
    if (!selectedPayment) return null;
    
    return (
      <Dialog 
        open={showPaymentDialog} 
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles del Pago</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Información del Pago</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Método de pago" 
                    secondary={selectedPayment.method} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Monto" 
                    secondary={`${selectedPayment.amount} ${selectedPayment.currency}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Estado" 
                    secondary={<StatusIndicator status={selectedPayment.status} />} 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Información Adicional</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Referencia" 
                    secondary={selectedPayment.reference || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Fecha" 
                    secondary={new Date(selectedPayment.paymentDate).toLocaleString()} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render manual payment dialog
  const renderManualPaymentDialog = (): JSX.Element => {
    return (
      <Dialog 
        open={showManualPayment} 
        onClose={() => setShowManualPayment(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Pago Manual</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Método de pago"
                  value={formData.method}
                  onChange={(e) => setFormData({...formData, method: e.target.value as PaymentMethod})}
                  variant="outlined"
                  margin="normal"
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monto"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Referencia"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="payment-proof-upload"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFormData({...formData, paymentProof: e.target.files[0]});
                    }
                  }}
                />
                <label htmlFor="payment-proof-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                  >
                    {formData.paymentProof ? 'Cambiar comprobante' : 'Subir comprobante'}
                  </Button>
                </label>
                {formData.paymentProof && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {formData.paymentProof.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManualPayment(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmitManualPayment}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Handle manual payment submission
  const handleSubmitManualPayment = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement payment submission logic
      // await processPayment(formData);
      setShowManualPayment(false);
      toast.success('Pago registrado exitosamente');
    } catch (err) {
      console.error('Error al registrar pago:', err);
      toast.error('Error al registrar el pago');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render payment detail
  const renderPaymentDetail = (payment: Payment): JSX.Element => {
    return (
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>Detalles del Pago</Typography>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Método de pago:</Typography>
                <Typography>{payment.method}</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Monto:</Typography>
                <Typography>{payment.amount} {payment.currency}</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Estado:</Typography>
                <StatusIndicator status={payment.status} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Referencia:</Typography>
                <Typography>{payment.reference || 'N/A'}</Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Fecha:</Typography>
                <Typography>{new Date(payment.paymentDate).toLocaleString()}</Typography>
                
                {payment.notes && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Notas:</Typography>
                    <Typography>{payment.notes}</Typography>
                  </>
                )}
              </Grid>
              {payment.paymentProof && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Comprobante:</Typography>
                  <img 
                    src={payment.paymentProof} 
                    alt="Comprobante de pago" 
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }} 
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [tempReason, setTempReason] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Payment; direction: 'asc' | 'desc' }>({ 
    key: 'createdAt', 
    direction: 'desc' 
  });
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    currency: 'PEN',
    method: 'transfer',
    reference: '',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentProof: null,
    notes: ''
  });
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useAuth();
  const theme = useTheme();

  // Payment and plan data from hooks
  const { payments: paymentsData, loading: paymentsLoading, uploadReceipt } = usePayments(tenant);
  const { initCulqi, processPayment, loading: paymentProcessing } = useCulqi();
  
  // Mock lastUpdatedBy for now
  const lastUpdatedBy = user?.name || 'Sistema';
  
  // Initialize errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle payment detail dialog
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);
  
  // Handle view payment details
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetail(true);
  };
  
  // Close payment detail dialog
  const handleClosePaymentDetail = () => {
    setShowPaymentDetail(false);
    setSelectedPayment(null);
  };

  // Load payment data
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        // const response = await api.get(`/payments/tenant/${typeof tenant === 'string' ? tenant : tenant._id}`);
        // setPayments(response.data);
        
        // Mock data for development
        const mockPayments: Payment[] = [
          {
            _id: '1',
            id: '1',
            amount: 100,
            date: '2023-01-01',
            paymentDate: '2023-01-01',
            status: 'approved',
            reference: 'REF-123',
            paymentMethod: 'transfer',
            method: 'Transferencia Bancaria',
            receiptUrl: '/receipts/sample.pdf',
            currency: 'PEN',
            description: 'Pago mensual de suscripción',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setPayments(mockPayments);
        setPaymentHistory(mockPayments);
      } catch (error) {
        console.error('Error loading payment data:', error);
        toast.error('Error al cargar los datos de pagos');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPaymentData();
  }, [tenant]);
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
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      paymentDate: date ? date.toISOString().split('T')[0] : ''
    }));
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        paymentProof: event.target.files?.[0] || null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await uploadReceipt(formData);
      setShowManualPayment(false);
      // Reset form
      setFormData({
        amount: 0,
        currency: 'PEN',
        method: 'transfer',
        reference: '',
        description: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentProof: null,
        notes: ''
      });
    } catch (error) {
      console.error('Error uploading receipt:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manual payment submission
  const handleManualPaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.paymentProof) {
      toast.error('Por favor, selecciona un comprobante de pago');
      return;
    }

    try {
      setIsProcessing(true);
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount.toString());
      formDataToSend.append('currency', formData.currency || 'PEN');
      formDataToSend.append('method', formData.method);
      formDataToSend.append('reference', formData.reference);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('paymentDate', formData.paymentDate as string);
      formDataToSend.append('notes', formData.notes);
      if (formData.paymentProof) {
        formDataToSend.append('receipt', formData.paymentProof);
      }
      await api.post('/api/payments', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Pago registrado exitosamente');
      setShowManualPayment(false);
      onUpdate();
      // Reset form
      setFormData({
        amount: 0,
        currency: 'PEN',
        method: 'transfer',
        reference: '',
        description: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentProof: null,
        notes: ''
      });
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render manual payment dialog
  const renderManualPaymentDialog = () => (
    <Dialog open={showManualPayment} onClose={() => !isProcessing && setShowManualPayment(false)} maxWidth="md" fullWidth>
      <form onSubmit={handleManualPaymentSubmit}>
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
                      value={formData.amount || ''}
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
                      disabled={isProcessing}
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
                      value={formData.paymentDate}
                      onChange={handleDateChange}
                      error={!!errors.paymentDate}
                      helperText={errors.paymentDate}
                      disabled={isProcessing}
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
                      value={formData.reference}
                      onChange={handleInputChange}
                      error={!!errors.reference}
                      helperText={errors.reference || 'Número de operación, transferencia o referencia'}
                      disabled={isProcessing}
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Método de Pago"
                      name="method"
                      value={formData.method}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      variant="outlined"
                      margin="normal"
                    >
                      {PAYMENT_METHODS.map((method) => (
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
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={isProcessing}
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
                    disabled={isProcessing}
                  />
                  {formData.paymentProof ? (
                    <>
                      {formData.paymentProof.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(formData.paymentProof)}
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
                            {formData.paymentProof.name}
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
                        disabled={isProcessing}
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
                        disabled={isProcessing}
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
            onClick={() => !isProcessing && setShowManualPayment(false)}
            disabled={isProcessing}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isProcessing || !formData.paymentProof}
            startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          >
            {isProcessing ? 'Subiendo...' : 'Subir Comprobante'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  // Payment history component
  const renderPaymentHistory = () => {
    const [localPayments, setLocalPayments] = useState<Payment[]>([]);
    const [localLoading, setLocalLoading] = useState(false);
    const [localSelectedPayment, setLocalSelectedPayment] = useState<Payment | null>(null);
    const [localShowHistory, setLocalShowHistory] = useState(false);
    
    // Mock data for development
    useEffect(() => {
      setLocalLoading(true);
      // Simulate API call
      const timer = setTimeout(() => {
        setLocalPayments([
          {
            _id: '1',
            id: '1',
            amount: 100,
            date: '2023-01-01',
            paymentDate: '2023-01-01',
            status: 'approved',
            reference: 'REF-123',
            paymentMethod: 'transfer',
            method: 'Transferencia Bancaria',
            receiptUrl: '/receipts/sample.pdf',
            currency: 'PEN',
            description: 'Pago mensual de suscripción'
          }
        ]);
        setLocalLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }, []);

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
      <Collapse in={localShowHistory}>
        <CardContent>
          {localIsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : localPayments.length === 0 ? (
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
                  {localPayments.map((payment) => (
                    <TableRow 
                      key={payment._id}
                      hover
                      onClick={() => setLocalSelectedPayment(payment)}
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
};

// Modal de detalle de pago
const renderPaymentDetail = (): JSX.Element | null => {
  if (!paymentDetail) return null;
  
  return (
    <Dialog 
      open={!!selectedPayment} 
      onClose={() => setSelectedPayment(null)}
      maxWidth="md"
      fullWidth
    >
      {selectedPayment && (
        <>
          <DialogTitle>Detalle del Pago</DialogTitle>
          <DialogContent>
            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
              <Box gridColumn="span 12" sm={6}>
                <Typography variant="subtitle1">Monto:</Typography>
                <Typography variant="body1">{selectedPayment.amount} {selectedPayment.currency}</Typography>
              </Box>
              <Box gridColumn="span 12" sm={6}>
                <Typography variant="subtitle1">Estado:</Typography>
                <StyledStatusChip 
                  status={selectedPayment.status} 
                  label={selectedPayment.status}
                />
              </Box>
              <Box gridColumn="span 12" sm={6}>
                <Typography variant="subtitle1">Método:</Typography>
                <Typography variant="body1">
                  {PAYMENT_METHODS.find(m => m.value === selectedPayment.method)?.label || selectedPayment.method}
                </Typography>
              </Box>
              <Box gridColumn="span 12" sm={6}>
                <Typography variant="subtitle1">Referencia:</Typography>
                <Typography variant="body1">{selectedPayment.reference}</Typography>
              </Box>
              {selectedPayment.description && (
                <Box gridColumn="span 12">
                  <Typography variant="subtitle1">Descripción:</Typography>
                  <Typography variant="body1">{selectedPayment.description}</Typography>
                </Box>
              )}
              {selectedPayment.receiptUrl && (
                <Box gridColumn="span 12">
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                  >
                    Ver Comprobante
                  </Button>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedPayment(null)} color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
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
  tenant: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ]).isRequired,
  onUpdate: PropTypes.func,
};

export default PaymentSettings;
