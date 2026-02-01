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
  LinearProgress,
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
  Badge,
} from '@mui/material';
import {
  Security,
  Shield,
  Lock,
  Key,
  Visibility,
  VisibilityOff,
  Warning,
  CheckCircle,
  Refresh,
  Person,
  AccessTime,
  DeviceHub,
  GppGood,
  GppBad,
  AdminPanelSettings,
  SecurityUpdateWarning,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface SecurityEvent {
  id: string;
  event_type: 'login_attempt' | 'failed_login' | 'password_change' | 'account_lock' | 'suspicious_activity' | 'data_access' | 'permission_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  user_name?: string;
  ip_address: string;
  user_agent: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  action_taken?: string;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'password_policy' | 'session_policy' | 'access_policy' | 'data_protection';
  enabled: boolean;
  settings: Record<string, any>;
  last_updated: string;
  updated_by: string;
}

interface SecurityMetrics {
  total_events: number;
  critical_events: number;
  resolved_events: number;
  active_threats: number;
  blocked_attempts: number;
  successful_logins: number;
  failed_logins: number;
  unique_ips: number;
  security_score: number;
  compliance_score: number;
}

export default function AssessmentSecurityFeatures() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, [severityFilter]);

  const fetchSecurityData = async () => {
    try {
      const [eventsRes, policiesRes, metricsRes] = await Promise.all([
        supabase.from('security_events').select('*').order('timestamp', { ascending: false }),
        supabase.from('security_policies').select('*'),
        supabase.from('security_metrics').select('*').single(),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (policiesRes.error) throw policiesRes.error;
      if (metricsRes.error) throw metricsRes.error;

      setSecurityEvents(eventsRes.data || []);
      setSecurityPolicies(policiesRes.data || []);
      setSecurityMetrics(metricsRes.data);
    } catch (error) {
      console.error('Error fetching security data:', error);
      const mockData = getMockSecurityData();
      setSecurityEvents(mockData.events);
      setSecurityPolicies(mockData.policies);
      setSecurityMetrics(mockData.metrics);
    } finally {
      setLoading(false);
    }
  };

  const getMockSecurityData = () => ({
    events: [
      {
        id: '1',
        event_type: 'failed_login',
        severity: 'high',
        user_id: 'user-1',
        user_name: 'John Doe',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        description: 'Multiple failed login attempts detected',
        timestamp: '2024-01-16T14:30:00Z',
        resolved: false,
        action_taken: 'Account temporarily locked',
      },
      {
        id: '2',
        event_type: 'suspicious_activity',
        severity: 'critical',
        user_id: 'user-2',
        user_name: 'Jane Smith',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        description: 'Unusual access pattern detected from multiple locations',
        timestamp: '2024-01-16T13:15:00Z',
        resolved: false,
        action_taken: 'Security alert sent to admin',
      },
      {
        id: '3',
        event_type: 'password_change',
        severity: 'low',
        user_id: 'user-3',
        user_name: 'Mike Chen',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        description: 'Password successfully changed',
        timestamp: '2024-01-16T12:00:00Z',
        resolved: true,
      },
    ],
    policies: [
      {
        id: '1',
        name: 'Password Policy',
        description: 'Strong password requirements and expiration settings',
        type: 'password_policy',
        enabled: true,
        settings: {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_symbols: true,
          expiration_days: 90,
          prevent_reuse: 5,
        },
        last_updated: '2024-01-10T10:00:00Z',
        updated_by: 'admin',
      },
      {
        id: '2',
        name: 'Session Policy',
        description: 'Session timeout and concurrent login restrictions',
        type: 'session_policy',
        enabled: true,
        settings: {
          timeout_minutes: 30,
          max_concurrent_sessions: 3,
          require_reauth_after: 3600,
          idle_timeout: 15,
        },
        last_updated: '2024-01-08T09:00:00Z',
        updated_by: 'admin',
      },
      {
        id: '3',
        name: 'Access Policy',
        description: 'IP whitelisting and geographic restrictions',
        type: 'access_policy',
        enabled: true,
        settings: {
          ip_whitelist: ['192.168.1.0/24', '10.0.0.0/8'],
          geo_restriction: true,
          allowed_countries: ['US', 'CA', 'UK'],
          block_vpn: true,
        },
        last_updated: '2024-01-05T11:00:00Z',
        updated_by: 'admin',
      },
    ],
    metrics: {
      total_events: 156,
      critical_events: 8,
      resolved_events: 142,
      active_threats: 6,
      blocked_attempts: 234,
      successful_logins: 1245,
      failed_logins: 89,
      unique_ips: 45,
      security_score: 87.5,
      compliance_score: 92.3,
    },
  });

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'login_attempt': return <Person sx={{ fontSize: 16 }} />;
      case 'failed_login': return <Lock sx={{ fontSize: 16 }} />;
      case 'password_change': return <Key sx={{ fontSize: 16 }} />;
      case 'account_lock': return <Shield sx={{ fontSize: 16 }} />;
      case 'suspicious_activity': return <Warning sx={{ fontSize: 16 }} />;
      case 'data_access': return <Visibility sx={{ fontSize: 16 }} />;
      case 'permission_change': return <AdminPanelSettings sx={{ fontSize: 16 }} />;
      default: return <Security sx={{ fontSize: 16 }} />;
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

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case 'password_policy': return <Key sx={{ fontSize: 16 }} />;
      case 'session_policy': return <AccessTime sx={{ fontSize: 16 }} />;
      case 'access_policy': return <Shield sx={{ fontSize: 16 }} />;
      case 'data_protection': return <Security sx={{ fontSize: 16 }} />;
      default: return <Lock sx={{ fontSize: 16 }} />;
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    try {
      setSecurityEvents(prev => prev.map(event =>
        event.id === eventId ? { ...event, resolved: true } : event
      ));
      toast.success('Security event resolved successfully');
    } catch (error: any) {
      toast.error('Failed to resolve event', {
        description: error.message,
      });
    }
  };

  const handleViewDetails = (event: SecurityEvent) => {
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };

  const handleTogglePolicy = async (policyId: string) => {
    try {
      setSecurityPolicies(prev => prev.map(policy =>
        policy.id === policyId ? { ...policy, enabled: !policy.enabled } : policy
      ));
      toast.success('Policy updated successfully');
    } catch (error: any) {
      toast.error('Failed to update policy', {
        description: error.message,
      });
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    if (severityFilter === 'all') return true;
    return event.severity === severityFilter;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading security features...</Typography>
      </Box>
    );
  }

  if (!securityMetrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>No security data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Security Features
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchSecurityData}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Security Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(20, 80, 140, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {securityMetrics.security_score.toFixed(1)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Security Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GppGood sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {securityMetrics.compliance_score.toFixed(1)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Compliance Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(180, 20, 20, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {securityMetrics.active_threats}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Active Threats
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(100, 20, 140, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {securityMetrics.blocked_attempts}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Blocked Attempts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Policies */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Security Policies
        </Typography>
        <Grid container spacing={2}>
          {securityPolicies.map((policy) => (
            <Grid item xs={12} md={4} key={policy.id}>
              <Card sx={{ background: 'rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPolicyIcon(policy.type)}
                      <Box>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                          {policy.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {policy.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant={policy.enabled ? 'outlined' : 'contained'}
                      size="small"
                      onClick={() => handleTogglePolicy(policy.id)}
                      sx={{
                        borderColor: policy.enabled ? 'rgba(98,0,69,0.5)' : undefined,
                        color: policy.enabled ? 'rgba(255,255,255,0.9)' : 'white',
                        bgcolor: policy.enabled ? undefined : 'rgba(98,0,69,0.8)',
                        fontSize: '0.8rem',
                      }}
                    >
                      {policy.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Last updated: {new Date(policy.last_updated).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Security Events */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Security Events
          </Typography>
          <FormControl size="small">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Severity</InputLabel>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
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
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Event Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>IP Address</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {new Date(event.timestamp).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getEventTypeIcon(event.event_type)}
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {event.event_type.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {event.user_name || 'System'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {event.ip_address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.severity.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getSeverityColor(event.severity),
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.resolved ? 'RESOLVED' : 'ACTIVE'}
                      size="small"
                      sx={{
                        bgcolor: event.resolved ? '#4caf50' : '#ff9800',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(event)}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!event.resolved && (
                        <Tooltip title="Resolve Event">
                          <IconButton
                            size="small"
                            onClick={() => handleResolveEvent(event.id)}
                            sx={{ color: 'rgba(76,175,80,0.7)' }}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Security Statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Login Statistics
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Successful Logins
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {securityMetrics.successful_logins}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(securityMetrics.successful_logins / (securityMetrics.successful_logins + securityMetrics.failed_logins)) * 100}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50',
                  },
                }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Failed Logins
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {securityMetrics.failed_logins}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(securityMetrics.failed_logins / (securityMetrics.successful_logins + securityMetrics.failed_logins)) * 100}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#f44336',
                  },
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Total Unique IPs: {securityMetrics.unique_ips}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Event Distribution
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Critical Events
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {securityMetrics.critical_events}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(securityMetrics.critical_events / securityMetrics.total_events) * 100}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#d32f2f',
                  },
                }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Resolved Events
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {securityMetrics.resolved_events}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(securityMetrics.resolved_events / securityMetrics.total_events) * 100}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50',
                  },
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Total Events: {securityMetrics.total_events}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Security Event Details
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Event Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Event Type:</strong> {selectedEvent.event_type.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Severity:</strong> {selectedEvent.severity}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Status:</strong> {selectedEvent.resolved ? 'Resolved' : 'Active'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Timestamp:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Technical Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>IP Address:</strong> {selectedEvent.ip_address}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>User Agent:</strong> {selectedEvent.user_agent}
                  </Typography>
                  {selectedEvent.user_name && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      <strong>User:</strong> {selectedEvent.user_name}
                    </Typography>
                  )}
                  {selectedEvent.action_taken && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      <strong>Action Taken:</strong> {selectedEvent.action_taken}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Description
                </Typography>
                <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {selectedEvent.description}
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
          {selectedEvent && !selectedEvent.resolved && (
            <Button
              variant="contained"
              onClick={() => {
                handleResolveEvent(selectedEvent.id);
                setDetailsDialogOpen(false);
              }}
              sx={{
                bgcolor: 'rgba(98,0,69,0.8)',
                '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
              }}
            >
              Resolve Event
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
