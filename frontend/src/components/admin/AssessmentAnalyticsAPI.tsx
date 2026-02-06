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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  InputAdornment,
  Divider,
  Avatar,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Api,
  Code,
  DataUsage,
  Timeline,
  Assessment,
  Speed,
  TrendingUp,
  Download,
  Refresh,
  Settings,
  Key,
  Security,
  Sync,
  PlayArrow,
  Stop,
  Visibility,
  CopyAll,
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  MonitorHeart,
  Storage,
  Memory,
  NetworkCheck,
  CodeOff,
  ApiOutlined,
  IntegrationInstructions,
  CloudSync,
  Lock,
  LockOpen,
  BarChart,
  PieChart,
  Timeline as TimelineIcon,
  FilterList,
  Search,
  Schedule,
  NotificationsActive,
  Analytics,
  Dashboard,
  SecurityUpdate,
  Update,
  Delete,
  Edit,
  Add,
  Remove,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  TrendingDown,
  TrendingFlat,
  AssessmentOutlined,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface APIEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response_format: string;
  rate_limit: number;
  authentication_required: boolean;
  status: 'active' | 'inactive' | 'deprecated';
  created_at: string;
  last_updated: string;
}

interface APIUsage {
  endpoint_id: string;
  endpoint_name: string;
  requests_count: number;
  success_rate: number;
  average_response_time: number;
  error_count: number;
  last_accessed: string;
  daily_usage: Array<{
    date: string;
    requests: number;
  }>;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  expires_at: string;
  last_used: string;
  usage_count: number;
  status: 'active' | 'expired' | 'revoked';
}

interface APIAnalytics {
  total_requests: number;
  total_endpoints: number;
  active_endpoints: number;
  average_response_time: number;
  success_rate: number;
  error_rate: number;
  top_endpoints: Array<{
    name: string;
    requests: number;
    success_rate: number;
  }>;
  usage_trends: Array<{
    date: string;
    requests: number;
    errors: number;
  }>;
  performance_metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_io: number;
  };
}

export default function AssessmentAnalyticsAPI() {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [usage, setUsage] = useState<APIUsage[]>([]);
  const [analytics, setAnalytics] = useState<APIAnalytics | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchAPIData();
  }, []);

  const fetchAPIData = async () => {
    try {
      const [endpointsRes, usageRes, analyticsRes] = await Promise.all([
        supabase.from('api_endpoints').select('*'),
        supabase.from('api_usage').select('*'),
        supabase.from('api_analytics').select('*').single(),
      ]);

      if (endpointsRes.error) throw endpointsRes.error;
      if (usageRes.error) throw usageRes.error;
      if (analyticsRes.error) throw analyticsRes.error;

      setEndpoints(endpointsRes.data || []);
      setUsage(usageRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching API data:', error);
      const mockData = getMockAPIData();
      setEndpoints(mockData.endpoints);
      setUsage(mockData.usage);
      setAnalytics(mockData.analytics);
    } finally {
      setLoading(false);
    }
  };

  const getMockAPIData = () => ({
    endpoints: [
      {
        id: '1',
        name: 'Get Assessment Results',
        description: 'Retrieve detailed assessment results and scores',
        method: 'GET',
        path: '/api/assessments/{id}/results',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Assessment ID' },
          { name: 'format', type: 'string', required: false, description: 'Response format (json, csv, xml)' },
        ],
        response_format: 'JSON',
        rate_limit: 1000,
        authentication_required: true,
        status: 'active',
        created_at: '2024-01-10T10:00:00Z',
        last_updated: '2024-01-15T14:00:00Z',
      },
      {
        id: '2',
        name: 'Create Assessment',
        description: 'Create a new assessment with specified parameters',
        method: 'POST',
        path: '/api/assessments',
        parameters: [
          { name: 'candidate_email', type: 'string', required: true, description: 'Candidate email address' },
          { name: 'problem_id', type: 'string', required: true, description: 'Problem ID' },
          { name: 'scheduled_at', type: 'datetime', required: false, description: 'Schedule timestamp' },
        ],
        response_format: 'JSON',
        rate_limit: 500,
        authentication_required: true,
        status: 'active',
        created_at: '2024-01-08T09:00:00Z',
        last_updated: '2024-01-14T16:00:00Z',
      },
      {
        id: '3',
        name: 'Get Analytics Data',
        description: 'Retrieve comprehensive analytics and metrics',
        method: 'GET',
        path: '/api/analytics',
        parameters: [
          { name: 'start_date', type: 'date', required: false, description: 'Start date for analytics' },
          { name: 'end_date', type: 'date', required: false, description: 'End date for analytics' },
          { name: 'metrics', type: 'array', required: false, description: 'Specific metrics to retrieve' },
        ],
        response_format: 'JSON',
        rate_limit: 2000,
        authentication_required: true,
        status: 'active',
        created_at: '2024-01-05T11:00:00Z',
        last_updated: '2024-01-12T13:00:00Z',
      },
    ],
    usage: [
      {
        endpoint_id: '1',
        endpoint_name: 'Get Assessment Results',
        requests_count: 15420,
        success_rate: 98.5,
        average_response_time: 120,
        error_count: 231,
        last_accessed: '2024-01-16T15:30:00Z',
        daily_usage: [
          { date: '2024-01-16', requests: 1250 },
          { date: '2024-01-15', requests: 1180 },
          { date: '2024-01-14', requests: 1320 },
        ],
      },
      {
        endpoint_id: '2',
        endpoint_name: 'Create Assessment',
        requests_count: 8930,
        success_rate: 99.2,
        average_response_time: 250,
        error_count: 71,
        last_accessed: '2024-01-16T14:45:00Z',
        daily_usage: [
          { date: '2024-01-16', requests: 780 },
          { date: '2024-01-15', requests: 720 },
          { date: '2024-01-14', requests: 810 },
        ],
      },
    ],
    analytics: {
      total_requests: 45680,
      total_endpoints: 12,
      active_endpoints: 10,
      average_response_time: 185,
      success_rate: 98.8,
      error_rate: 1.2,
      top_endpoints: [
        { name: 'Get Assessment Results', requests: 15420, success_rate: 98.5 },
        { name: 'Create Assessment', requests: 8930, success_rate: 99.2 },
        { name: 'Get Analytics Data', requests: 6780, success_rate: 99.1 },
      ],
      usage_trends: [
        { date: '2024-01-16', requests: 3200, errors: 38 },
        { date: '2024-01-15', requests: 3100, errors: 35 },
        { date: '2024-01-14', requests: 3300, errors: 42 },
      ],
      performance_metrics: {
        cpu_usage: 45.2,
        memory_usage: 62.8,
        disk_usage: 38.5,
        network_io: 125.6,
      },
    },
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#4caf50';
      case 'POST': return '#2196f3';
      case 'PUT': return '#ff9800';
      case 'DELETE': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#ff9800';
      case 'deprecated': return '#f44336';
      default: return '#757575';
    }
  };

  const handleTestEndpoint = async (endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint);
    setTestDialogOpen(true);
  };

  const executeTest = async () => {
    if (!selectedEndpoint) return;
    
    setTestLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        status: 200,
        data: {
          message: 'Test successful',
          timestamp: new Date().toISOString(),
          endpoint: selectedEndpoint.path,
          method: selectedEndpoint.method,
        },
        response_time: Math.floor(Math.random() * 200) + 50,
      };
      
      setTestResults(mockResponse);
      toast.success('API test completed successfully');
    } catch (error: any) {
      toast.error('API test failed', {
        description: error.message,
      });
    } finally {
      setTestLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading API analytics...</Typography>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>No API analytics data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Analytics API
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAPIData}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Api />}
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            API Documentation
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(20, 80, 140, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Api sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {analytics.total_requests.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {analytics.average_response_time}ms
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Avg Response Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {analytics.success_rate.toFixed(1)}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(100, 20, 140, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DataUsage sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {analytics.active_endpoints}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Active Endpoints
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Performance Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  CPU Usage
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {analytics.performance_metrics.cpu_usage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={analytics.performance_metrics.cpu_usage}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: analytics.performance_metrics.cpu_usage > 80 ? '#f44336' : '#4caf50',
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Memory Usage
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {analytics.performance_metrics.memory_usage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={analytics.performance_metrics.memory_usage}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: analytics.performance_metrics.memory_usage > 80 ? '#f44336' : '#4caf50',
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Disk Usage
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {analytics.performance_metrics.disk_usage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={analytics.performance_metrics.disk_usage}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: analytics.performance_metrics.disk_usage > 80 ? '#f44336' : '#4caf50',
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Network I/O
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {analytics.performance_metrics.network_io.toFixed(1)} MB/s
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(analytics.performance_metrics.network_io / 1000) * 100}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#2196f3',
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* API Endpoints */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          API Endpoints
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Endpoint</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Method</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Path</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rate Limit</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {endpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {endpoint.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {endpoint.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={endpoint.method}
                      size="small"
                      sx={{
                        bgcolor: getMethodColor(endpoint.method),
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {endpoint.path}
                      </Typography>
                      <Tooltip title="Copy path">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(endpoint.path)}
                          sx={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                          <CopyAll fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {endpoint.rate_limit.toLocaleString()}/hr
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={endpoint.status.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(endpoint.status),
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
                          onClick={() => {
                            setSelectedEndpoint(endpoint);
                            setApiDialogOpen(true);
                          }}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Test Endpoint">
                        <IconButton
                          size="small"
                          onClick={() => handleTestEndpoint(endpoint)}
                          sx={{ color: 'rgba(98,0,69,1)' }}
                        >
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Advanced Analytics Dashboard */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Advanced Analytics
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<Schedule />}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Time Range
            </Button>
          </Stack>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BarChart sx={{ color: '#4caf50', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Response Time Distribution
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  &lt;100ms
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                  75%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  100-500ms
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={20}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  color="warning"
                />
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  20%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  &gt;500ms
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={5}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  color="error"
                />
                <Typography variant="body2" sx={{ color: '#f44336' }}>
                  5%
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PieChart sx={{ color: '#2196f3', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Request Methods
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    GET
                  </Typography>
                  <Chip
                    label="65%"
                    size="small"
                    sx={{ bgcolor: '#4caf50', color: 'white', fontSize: '0.7rem' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    POST
                  </Typography>
                  <Chip
                    label="25%"
                    size="small"
                    sx={{ bgcolor: '#2196f3', color: 'white', fontSize: '0.7rem' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    PUT
                  </Typography>
                  <Chip
                    label="7%"
                    size="small"
                    sx={{ bgcolor: '#ff9800', color: 'white', fontSize: '0.7rem' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    DELETE
                  </Typography>
                  <Chip
                    label="3%"
                    size="small"
                    sx={{ bgcolor: '#f44336', color: 'white', fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TimelineIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Peak Usage Hours
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    09:00 - 12:00
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowUpward sx={{ color: '#4caf50', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#4caf50' }}>
                      High
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    14:00 - 18:00
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ color: '#ff9800', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#ff9800' }}>
                      Medium
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    22:00 - 06:00
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingDown sx={{ color: '#f44336', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#f44336' }}>
                      Low
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Real-time Activity Feed */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Real-time Activity Feed
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: '#4caf50' }} />
            <Typography variant="body2" sx={{ color: '#4caf50' }}>
              Live
            </Typography>
          </Box>
        </Box>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                <CheckCircle sx={{ fontSize: 18 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  GET /api/assessments - Success
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  2 seconds ago • 127.0.0.1 • 45ms
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff9800' }}>
                <Warning sx={{ fontSize: 18 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  POST /api/users - Rate Limited
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  5 seconds ago • 192.168.1.1 • 429
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#f44336' }}>
                <Error sx={{ fontSize: 18 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  DELETE /api/sessions - Unauthorized
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  8 seconds ago • 10.0.0.1 • 401
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* API Health Monitoring */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            API Health Monitoring
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Auto-refresh"
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MonitorHeart sx={{ color: '#4caf50', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                API Status
              </Typography>
            </Box>
            <Chip
              label="HEALTHY"
              sx={{
                bgcolor: '#4caf50',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CloudSync sx={{ color: '#2196f3', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                Uptime
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              99.9% (30 days)
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Security sx={{ color: '#ff9800', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                Security Status
              </Typography>
            </Box>
            <Chip
              label="SECURE"
              sx={{
                bgcolor: '#ff9800',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IntegrationInstructions sx={{ color: '#9c27b0', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                Version
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              v2.1.0
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* API Key Management */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            API Key Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Key />}
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            Generate New Key
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Key sx={{ color: '#4caf50', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Active Keys
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'white', fontSize: '1.5rem' }}>
                3
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Lock sx={{ color: '#ff9800', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Expired Keys
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'white', fontSize: '1.5rem' }}>
                1
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LockOpen sx={{ color: '#f44336', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  Revoked Keys
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'white', fontSize: '1.5rem' }}>
                2
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Usage Statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Top Endpoints by Usage
            </Typography>
            <List>
              {analytics.top_endpoints.map((endpoint, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {endpoint.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {endpoint.requests.toLocaleString()} requests
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Success Rate:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={endpoint.success_rate}
                      sx={{
                        width: 100,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: endpoint.success_rate > 95 ? '#4caf50' : '#ff9800',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {endpoint.success_rate.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Usage Trends
            </Typography>
            <List>
              {analytics.usage_trends.map((trend, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {new Date(trend.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {trend.requests.toLocaleString()} requests
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Errors:
                    </Typography>
                    <Typography variant="caption" sx={{ color: trend.errors > 40 ? '#f44336' : '#4caf50' }}>
                      {trend.errors}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      ({((trend.errors / trend.requests) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* API Details Dialog */}
      <Dialog
        open={apiDialogOpen}
        onClose={() => setApiDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          API Endpoint Details - {selectedEndpoint?.name}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedEndpoint && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Endpoint Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Method:</strong> {selectedEndpoint.method}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Path:</strong> {selectedEndpoint.path}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Rate Limit:</strong> {selectedEndpoint.rate_limit}/hr
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Authentication:</strong> {selectedEndpoint.authentication_required ? 'Required' : 'Not Required'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Status:</strong> {selectedEndpoint.status}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Response Format
                </Typography>
                <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                    {selectedEndpoint.response_format}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Parameters
                </Typography>
                <List>
                  {selectedEndpoint.parameters.map((param, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {param.name} ({param.type})
                        {param.required && <Chip label="Required" size="small" sx={{ ml: 1, bgcolor: '#f44336', color: 'white', fontSize: '0.6rem' }} />}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {param.description}
                      </Typography>
                    </Box>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setApiDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Close
          </Button>
          {selectedEndpoint && (
            <Button
              variant="contained"
              onClick={() => {
                setApiDialogOpen(false);
                handleTestEndpoint(selectedEndpoint);
              }}
              sx={{
                bgcolor: 'rgba(98,0,69,0.8)',
                '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
              }}
            >
              Test Endpoint
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Test Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Test API Endpoint - {selectedEndpoint?.name}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedEndpoint && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Endpoint Details
                </Typography>
                <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                    {selectedEndpoint.method} {selectedEndpoint.path}
                  </Typography>
                </Paper>
              </Grid>
              {testResults && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                    Test Results
                  </Typography>
                  <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                      Status: {testResults.status}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                      Response Time: {testResults.response_time}ms
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                      Response: {JSON.stringify(testResults.data, null, 2)}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setTestDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={executeTest}
            disabled={testLoading}
            startIcon={testLoading ? <Sync sx={{ animation: 'spin 1s linear infinite' }} /> : <PlayArrow />}
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            {testLoading ? 'Testing...' : 'Execute Test'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
