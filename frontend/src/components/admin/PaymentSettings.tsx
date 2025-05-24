import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  CardActions,
  Checkbox,
  Tab,
  Tabs
} from '@mui/material';

// Material-UI Icons
import {
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircleOutline,
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
  HighlightOff,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { usePayments } from '../../hooks/usePayments';

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

// Status Indicator Component
const StatusIndicator: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const statusConfig = {
    approved: {
      icon: <CheckCircleOutline fontSize="small" color="success" />,
      label: 'Aprobado',
      color: 'success'
    },
    pending: {
      icon: <ScheduleIcon fontSize="small" color="warning" />,
      label: 'Pendiente',
      color: 'warning'
    },
    rejected: {
      icon: <HighlightOff fontSize="small" color="error" />,
      label: 'Rechazado',
      color: 'error'
    },
    cancelled: {
      icon: <HighlightOff fontSize="small" color="default" />,
      label: 'Cancelado',
      color: 'default'
    },
    refunded: {
      icon: <RefreshIcon fontSize="small" color="info" />,
      label: 'Reembolsado',
      color: 'info'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Chip
        icon={config.icon}
        label={config.label}
        color={status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'error'}
        variant="outlined"
        size="small"
      />
    </Box>
  );
};

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
  id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  description?: string;
  paymentDate: Date | string;
  date?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  receiptUrl?: string;
  paymentMethod?: string;
  paymentProof?: string | File;
  metadata?: Record<string, any>;
  notes?: string;
}

export interface PaymentHistory {
  _id: string;
  id?: string;
  paymentId: string;
  status: PaymentStatus;
  changedBy: string;
  changedAt: Date | string;
  notes?: string;
}

export interface PaymentDetail {
  _id: string;
  id?: string;
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
  onClose?: () => void;
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
  <Box display="flex" gap={1} justifyContent="flex-end">
    {status === 'pending' && (
      <>
        <Button
          variant="contained"
          color="success"
          onClick={onApprove}
          disabled={loading || disabled}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleOutline />}
        >
          Aprobar
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={onReject}
          disabled={loading || disabled}
          startIcon={loading ? <CircularProgress size={20} /> : <HighlightOff />}
        >
          Rechazar
        </Button>
      </>
    )}
  </Box>
);

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ onClose, tenant, onUpdate }) => {
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
                  label="Método de Pago"
                  variant="outlined"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as PaymentMethod })}
                  margin="normal"
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center">
                        {option.icon}
                        <Box ml={1}>{option.label}</Box>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Monto"
                  type="number"
                  variant="outlined"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  margin="normal"
                  InputProps={{
                    startAdornment: <span>S/</span>
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Referencia"
                  variant="outlined"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManualPayment(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Acción para guardar el pago manual
              toast.success('Pago registrado correctamente');
              setShowManualPayment(false);
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

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
                {/* Mock data for now */}
                <TableRow>
                  <TableCell>2023-01-01</TableCell>
                  <TableCell>Transferencia</TableCell>
                  <TableCell>S/ 100.00</TableCell>
                  <TableCell>
                    <StatusIndicator status="approved" />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewPayment({
                      _id: '1',
                      amount: 100,
                      currency: 'PEN',
                      status: 'approved',
                      method: 'transfer',
                      reference: 'REF-123',
                      paymentDate: '2023-01-01'
                    })}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  // Render payment detail
  const renderPaymentDetail = (): JSX.Element | null => {
    if (!selectedPayment) return null;

    return (
      <Dialog
        open={showPaymentDetail}
        onClose={() => setShowPaymentDetail(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles del Pago</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Monto:</Typography>
              <Typography variant="body1">{selectedPayment.amount} {selectedPayment.currency}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Estado:</Typography>
              <StatusIndicator status={selectedPayment.status} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Método:</Typography>
              <Typography variant="body1">
                {PAYMENT_METHOD_OPTIONS.find(m => m.value === selectedPayment.method)?.label || selectedPayment.method}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Referencia:</Typography>
              <Typography variant="body1">{selectedPayment.reference || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Fecha:</Typography>
              <Typography variant="body1">
                {new Date(selectedPayment.paymentDate).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDetail(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Configuración de Pagos
          </Typography>

          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Estado del Sistema de Pagos
            </Typography>
            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label={isActive ? "Activado" : "Desactivado"}
              />
            </Box>
          </Box>

          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowManualPayment(true)}
            >
              Registrar Pago Manual
            </Button>
          </Box>

          <Box mt={4}>
            {renderPaymentHistory()}
          </Box>
        </CardContent>
      </Card>

      {/* Modales */}
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
