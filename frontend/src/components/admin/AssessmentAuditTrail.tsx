import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  History,
  Visibility,
  Download,
  Refresh,
  Search,
  FilterList,
  Person,
  Assessment,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  Security,
  Timeline,
  AccountTree,
  EventNote,
  Description,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AuditTrailEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  action_type: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout';
  target_type: 'assessment' | 'candidate' | 'template' | 'report' | 'user' | 'system';
  target_id: string;
  target_name: string;
  ip_address: string;
  user_agent: string;
  session_id: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'warning';
}

interface AuditFilters {
  date_range: '24h' | '7d' | '30d' | '90d' | 'all';
  action_type: string;
  target_type: string;
  severity: string;
  user_id: string;
  search_term: string;
}

export default function AssessmentAuditTrail() {
  const [auditEntries, setAuditEntries] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    date_range: '7d',
    action_type: 'all',
    target_type: 'all',
    severity: 'all',
    user_id: 'all',
    search_term: '',
  });
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAuditTrail();
  }, [filters]);

  const fetchAuditTrail = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditEntries(data || []);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      setAuditEntries(getMockAuditData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAuditData = (): AuditTrailEntry[] => [
    {
      id: '1',
      timestamp: '2024-01-16T14:30:00Z',
      user_id: 'user-1',
      user_name: 'Sarah Johnson',
      user_email: 'sarah@company.com',
      action: 'Completed assessment review',
      action_type: 'update',
      target_type: 'assessment',
      target_id: 'assessment-1',
      target_name: 'System Design Assessment',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      session_id: 'session-123',
      details: {
        score: 8.5,
        feedback: 'Excellent system design skills',
        time_spent: 45,
        previous_score: 7.2,
      },
      severity: 'medium',
      status: 'success',
    },
    {
      id: '2',
      timestamp: '2024-01-16T13:15:00Z',
      user_id: 'user-2',
      user_name: 'Mike Chen',
      user_email: 'mike@company.com',
      action: 'Generated assessment report',
      action_type: 'export',
      target_type: 'report',
      target_id: 'report-1',
      target_name: 'Weekly Performance Report',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      session_id: 'session-124',
      details: {
        format: 'PDF',
        date_range: '7d',
        candidates_included: 15,
        file_size: '2.3MB',
      },
      severity: 'low',
      status: 'success',
    },
    {
      id: '3',
      timestamp: '2024-01-16T12:00:00Z',
      user_id: 'user-1',
      user_name: 'Sarah Johnson',
      user_email: 'sarah@company.com',
      action: 'Failed login attempt',
      action_type: 'login',
      target_type: 'user',
      target_id: 'user-1',
      target_name: 'Sarah Johnson',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      session_id: 'session-125',
      details: {
        reason: 'Invalid password',
        attempts: 3,
        locked_out: false,
      },
      severity: 'high',
      status: 'failed',
    },
    {
      id: '4',
      timestamp: '2024-01-16T10:30:00Z',
      user_id: 'user-3',
      user_name: 'Emily Davis',
      user_email: 'emily@company.com',
      action: 'Created new assessment template',
      action_type: 'create',
      target_type: 'template',
      target_id: 'template-1',
      target_name: 'Frontend React Assessment',
      ip_address: '192.168.1.103',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      session_id: 'session-126',
      details: {
        template_type: 'coding',
        difficulty: 'medium',
        estimated_time: 60,
        questions_count: 5,
      },
      severity: 'low',
      status: 'success',
    },
    {
      id: '5',
      timestamp: '2024-01-16T09:15:00Z',
      user_id: 'system',
      user_name: 'System',
      user_email: 'system@company.com',
      action: 'Automated backup completed',
      action_type: 'system',
      target_type: 'system',
      target_id: 'system-1',
      target_name: 'Database Backup',
      ip_address: '127.0.0.1',
      user_agent: 'System Agent',
      session_id: 'system-session',
      details: {
        backup_type: 'automated',
        size: '1.2GB',
        duration: '5 minutes',
        status: 'completed',
      },
      severity: 'low',
      status: 'success',
    },
  ];

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'create': return '#4caf50';
      case 'update': return '#2196f3';
      case 'delete': return '#f44336';
      case 'view': return '#9e9e9e';
      case 'export': return '#ff9800';
      case 'login': return '#673ab7';
      case 'logout': return '#607d8b';
      default: return '#757575';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4caf50';
      case 'failed': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#757575';
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'assessment': return <Assessment sx={{ fontSize: 16 }} />;
      case 'candidate': return <Person sx={{ fontSize: 16 }} />;
      case 'template': return <Description sx={{ fontSize: 16 }} />;
      case 'report': return <Description sx={{ fontSize: 16 }} />;
      case 'user': return <Person sx={{ fontSize: 16 }} />;
      case 'system': return <Security sx={{ fontSize: 16 }} />;
      default: return <Info sx={{ fontSize: 16 }} />;
    }
  };

  const handleViewDetails = (entry: AuditTrailEntry) => {
    setSelectedEntry(entry);
    setDetailsDialogOpen(true);
  };

  const handleExportAuditTrail = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Target Type', 'Target', 'Severity', 'Status', 'IP Address'],
      ...auditEntries.map(entry => [
        new Date(entry.timestamp).toLocaleString(),
        entry.user_name,
        entry.action,
        entry.target_type,
        entry.target_name,
        entry.severity,
        entry.status,
        entry.ip_address,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Audit trail exported successfully');
  };

  const filteredEntries = auditEntries.filter(entry => {
    if (filters.search_term && !entry.action.toLowerCase().includes(filters.search_term.toLowerCase()) &&
        !entry.target_name.toLowerCase().includes(filters.search_term.toLowerCase()) &&
        !entry.user_name.toLowerCase().includes(filters.search_term.toLowerCase())) {
      return false;
    }
    if (filters.action_type !== 'all' && entry.action_type !== filters.action_type) return false;
    if (filters.target_type !== 'all' && entry.target_type !== filters.target_type) return false;
    if (filters.severity !== 'all' && entry.severity !== filters.severity) return false;
    if (filters.user_id !== 'all' && entry.user_id !== filters.user_id) return false;
    
    // Date range filtering
    if (filters.date_range !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      const daysAgo = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90,
      }[filters.date_range];
      
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      if (entryDate < cutoffDate) return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading audit trail...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Audit Trail
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportAuditTrail}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAuditTrail}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(20, 80, 140, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {auditEntries.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Entries
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {auditEntries.filter(e => e.status === 'success').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Successful Actions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {auditEntries.filter(e => e.severity === 'high' || e.severity === 'critical').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                High Severity
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(180, 20, 20, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {auditEntries.filter(e => e.status === 'failed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Failed Actions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Date Range</InputLabel>
              <Select
                value={filters.date_range}
                onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                }}
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Action Type</InputLabel>
              <Select
                value={filters.action_type}
                onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
                <MenuItem value="view">View</MenuItem>
                <MenuItem value="export">Export</MenuItem>
                <MenuItem value="login">Login</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Target Type</InputLabel>
              <Select
                value={filters.target_type}
                onChange={(e) => setFilters({ ...filters, target_type: e.target.value })}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                }}
              >
                <MenuItem value="all">All Targets</MenuItem>
                <MenuItem value="assessment">Assessment</MenuItem>
                <MenuItem value="candidate">Candidate</MenuItem>
                <MenuItem value="template">Template</MenuItem>
                <MenuItem value="report">Report</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Severity</InputLabel>
              <Select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                }}
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by action, target, or user..."
              value={filters.search_term}
              onChange={(e) => setFilters({ ...filters, search_term: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '& fieldset': { borderColor: 'rgba(98,0,69,0.3)' },
                  '& input': { color: 'white' },
                },
              }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Audit Trail Table */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Target</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>IP Address</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box>
                      <Typography variant="body2">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {entry.user_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {entry.user_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={entry.action_type.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getActionTypeColor(entry.action_type),
                          color: 'white',
                          fontSize: '0.6rem',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {entry.action}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTargetIcon(entry.target_type)}
                      <Box>
                        <Typography variant="body2">
                          {entry.target_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {entry.target_type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={entry.severity.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getSeverityColor(entry.severity),
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={entry.status.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(entry.status),
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {entry.ip_address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(entry)}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Audit Trail Entry Details
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedEntry && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  General Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Timestamp"
                      secondary={new Date(selectedEntry.timestamp).toLocaleString()}
                      primaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.9)' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="User"
                      secondary={`${selectedEntry.user_name} (${selectedEntry.user_email})`}
                      primaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.9)' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Action"
                      secondary={selectedEntry.action}
                      primaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.9)' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Target"
                      secondary={`${selectedEntry.target_name} (${selectedEntry.target_type})`}
                      primaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.9)' }}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Technical Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="IP Address"
                      secondary={selectedEntry.ip_address}
                      primaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.9)' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="User Agent"
                      secondary={selectedEntry.user_agent}
                      primaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.9)' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Session ID"
                      secondary={selectedEntry.session_id}
                      primaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.9)' }}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Additional Details
                </Typography>
                <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                    {JSON.stringify(selectedEntry.details, null, 2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setDetailsDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
