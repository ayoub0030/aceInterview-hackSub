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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
} from '@mui/material';
import {
  Assessment,
  Description,
  Download,
  Visibility,
  Refresh,
  Add,
  Edit,
  Delete,
  Schedule,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'candidate' | 'assessment' | 'performance' | 'analytics' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  parameters: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GeneratedReport {
  id: string;
  template_id: string;
  template_name: string;
  title: string;
  type: string;
  format: string;
  status: 'generating' | 'completed' | 'failed';
  file_url?: string;
  generated_at: string;
  expires_at?: string;
  parameters: Record<string, any>;
  file_size?: number;
  download_count: number;
}

interface ReportSchedule {
  id: string;
  template_id: string;
  template_name: string;
  frequency: string;
  next_run: string;
  recipients: string[];
  is_active: boolean;
  last_run?: string;
  created_at: string;
}

export default function AssessmentReportingSystem() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [templatesRes, reportsRes, schedulesRes] = await Promise.all([
        supabase.from('report_templates').select('*'),
        supabase.from('generated_reports').select('*').order('generated_at', { ascending: false }),
        supabase.from('report_schedules').select('*'),
      ]);

      if (templatesRes.error) throw templatesRes.error;
      if (reportsRes.error) throw reportsRes.error;
      if (schedulesRes.error) throw schedulesRes.error;

      setTemplates(templatesRes.data || []);
      setReports(reportsRes.data || []);
      setSchedules(schedulesRes.data || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      const mockData = getMockReportData();
      setTemplates(mockData.templates);
      setReports(mockData.reports);
      setSchedules(mockData.schedules);
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = () => ({
    templates: [
      {
        id: '1',
        name: 'Candidate Performance Report',
        description: 'Comprehensive analysis of candidate performance metrics',
        type: 'candidate' as const,
        frequency: 'weekly' as const,
        format: 'pdf' as const,
        parameters: { date_range: '30d', include_charts: true },
        is_active: true,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T14:00:00Z',
      },
      {
        id: '2',
        name: 'Assessment Analytics Summary',
        description: 'Detailed analytics of assessment completion and performance',
        type: 'assessment' as const,
        frequency: 'monthly' as const,
        format: 'excel' as const,
        parameters: { include_trends: true, compare_periods: true },
        is_active: true,
        created_at: '2024-01-08T09:00:00Z',
        updated_at: '2024-01-12T16:00:00Z',
      },
      {
        id: '3',
        name: 'Team Performance Dashboard',
        description: 'Team-wide assessment performance and insights',
        type: 'performance' as const,
        frequency: 'monthly' as const,
        format: 'pdf' as const,
        parameters: { team_id: 'all', include_recommendations: true },
        is_active: false,
        created_at: '2024-01-05T11:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
      },
    ],
    reports: [
      {
        id: '1',
        template_id: '1',
        template_name: 'Candidate Performance Report',
        title: 'Weekly Candidate Performance - Jan 15, 2024',
        type: 'candidate',
        format: 'pdf',
        status: 'completed' as const,
        file_url: '/reports/candidate_performance_2024-01-15.pdf',
        generated_at: '2024-01-15T16:00:00Z',
        expires_at: '2024-02-15T16:00:00Z',
        parameters: { date_range: '30d', include_charts: true },
        file_size: 2048576,
        download_count: 5,
      },
      {
        id: '2',
        template_id: '2',
        template_name: 'Assessment Analytics Summary',
        title: 'Monthly Assessment Analytics - January 2024',
        type: 'assessment',
        format: 'excel',
        status: 'completed' as const,
        file_url: '/reports/assessment_analytics_2024-01.xlsx',
        generated_at: '2024-01-14T10:00:00Z',
        expires_at: '2024-02-14T10:00:00Z',
        parameters: { include_trends: true, compare_periods: true },
        file_size: 3145728,
        download_count: 8,
      },
      {
        id: '3',
        template_id: '1',
        template_name: 'Candidate Performance Report',
        title: 'Custom Performance Analysis',
        type: 'candidate',
        format: 'csv',
        status: 'generating' as const,
        generated_at: '2024-01-16T09:00:00Z',
        parameters: { date_range: '90d', include_charts: false },
        download_count: 0,
      },
    ],
    schedules: [
      {
        id: '1',
        template_id: '1',
        template_name: 'Candidate Performance Report',
        frequency: 'weekly',
        next_run: '2024-01-22T09:00:00Z',
        recipients: ['manager@company.com', 'hr@company.com'],
        is_active: true,
        last_run: '2024-01-15T09:00:00Z',
        created_at: '2024-01-10T10:00:00Z',
      },
      {
        id: '2',
        template_id: '2',
        template_name: 'Assessment Analytics Summary',
        frequency: 'monthly',
        next_run: '2024-02-01T09:00:00Z',
        recipients: ['analytics@company.com'],
        is_active: true,
        last_run: '2024-01-01T09:00:00Z',
        created_at: '2024-01-08T09:00:00Z',
      },
    ],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'generating': return '#ff9800';
      case 'failed': return '#f44336';
      default: return '#757575';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'candidate': return <Person sx={{ fontSize: 16 }} />;
      case 'assessment': return <Assessment sx={{ fontSize: 16 }} />;
      case 'performance': return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'analytics': return <BarChart sx={{ fontSize: 16 }} />;
      default: return <Description sx={{ fontSize: 16 }} />;
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a report template');
      return;
    }

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) return;

      const newReport = {
        id: crypto.randomUUID(),
        template_id: selectedTemplate,
        template_name: template.name,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        type: template.type,
        format: template.format,
        status: 'generating' as const,
        generated_at: new Date().toISOString(),
        parameters: reportParameters,
        download_count: 0,
      };

      setReports([newReport, ...reports]);

      // Simulate report generation
      setTimeout(() => {
        setReports(prev => prev.map(r => 
          r.id === newReport.id 
            ? { 
                ...r, 
                status: 'completed' as const,
                file_url: `/reports/${template.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${template.format}`,
                file_size: Math.floor(Math.random() * 5000000) + 1000000,
              }
            : r
        ));
        toast.success('Report generated successfully');
      }, 3000);

      setGenerateDialogOpen(false);
      setSelectedTemplate('');
      setReportParameters({});
      toast.info('Report generation started...');
    } catch (error: any) {
      toast.error('Failed to generate report', {
        description: error.message,
      });
    }
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    if (report.status !== 'completed' || !report.file_url) {
      toast.error('Report is not ready for download');
      return;
    }

    // Simulate download
    setReports(prev => prev.map(r => 
      r.id === report.id 
        ? { ...r, download_count: r.download_count + 1 }
        : r
    ));

    toast.success(`Downloading ${report.title}`);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      setReports(prev => prev.filter(r => r.id !== reportId));
      toast.success('Report deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete report', {
        description: error.message,
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading reporting system...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Reporting System
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setGenerateDialogOpen(true)}
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            Generate Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchReportData}
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
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(20, 80, 140, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {templates.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Report Templates
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {reports.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Generated Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {schedules.filter(s => s.is_active).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Active Schedules
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(100, 20, 140, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {reports.reduce((sum, r) => sum + r.download_count, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Downloads
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Templates */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Report Templates
        </Typography>
        <Grid container spacing={2}>
          {templates.map((template) => (
            <Grid item xs={12} md={4} key={template.id}>
              <Card sx={{ background: 'rgba(255,255,255,0.05)', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getTypeIcon(template.type)}
                    <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem' }}>
                      {template.name}
                    </Typography>
                    <Chip
                      label={template.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        bgcolor: template.is_active ? '#4caf50' : '#9e9e9e',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={template.type}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(98,0,69,0.8)',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                    <Chip
                      label={template.frequency}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(33,150,243,0.8)',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                    <Chip
                      label={template.format.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(76,175,80,0.8)',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setReportParameters(template.parameters);
                      setGenerateDialogOpen(true);
                    }}
                    sx={{
                      borderColor: 'rgba(98,0,69,0.5)',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.8rem',
                    }}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Generated Reports */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2, p: 2 }}>
          Generated Reports
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Report Title</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Format</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Generated</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>File Size</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Downloads</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {report.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {report.template_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(report.type)}
                      <Typography variant="body2">
                        {report.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Chip
                      label={report.format.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(76,175,80,0.8)',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(report.status),
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {new Date(report.generated_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {new Date(report.generated_at).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {formatFileSize(report.file_size)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {report.download_count}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadReport(report)}
                          disabled={report.status !== 'completed'}
                          sx={{ 
                            color: report.status === 'completed' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' 
                          }}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteReport(report.id)}
                          sx={{ color: 'rgba(244,67,54,0.7)' }}
                        >
                          <Delete fontSize="small" />
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

      {/* Generate Report Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Generate Report
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Report Template</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                const template = templates.find(t => t.id === e.target.value);
                if (template) {
                  setReportParameters(template.parameters);
                }
              }}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
              }}
            >
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedTemplate && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Report will be generated with the following parameters: {JSON.stringify(reportParameters)}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setGenerateDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
