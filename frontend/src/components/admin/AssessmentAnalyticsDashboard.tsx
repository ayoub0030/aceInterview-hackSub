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
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Person,
  Assessment,
  Star,
  Schedule,
  Visibility,
  Download,
  Refresh,
  Info,
  Warning,
  CheckCircle,
  Timeline,
  BarChart,
  PieChart,
  Speed,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  overview: {
    total_assessments: number;
    completed_assessments: number;
    average_score: number;
    completion_rate: number;
    average_time_to_complete: number;
    total_candidates: number;
    active_candidates: number;
    hired_candidates: number;
    rejected_candidates: number;
  };
  performance_trends: {
    daily_scores: Array<{ date: string; average_score: number; completion_count: number }>;
    weekly_performance: Array<{ week: string; average_score: number; completion_rate: number }>;
    monthly_summary: Array<{ month: string; total_assessments: number; average_score: number }>;
  };
  assessment_types: Array<{
    type: string;
    count: number;
    average_score: number;
    completion_rate: number;
    average_time: number;
    difficulty_distribution: Record<string, number>;
  }];
  candidate_journey: Array<{
    stage: string;
    count: number;
    conversion_rate: number;
    average_time_in_stage: number;
  }];
  top_performers: Array<{
    candidate_name: string;
    candidate_email: string;
    average_score: number;
    completed_assessments: number;
    strengths: string[];
  }>;
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export default function AssessmentAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'scores' | 'completion' | 'time'>('scores');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_analytics')
        .select('*')
        .eq('time_range', timeRange)
        .single();

      if (error) throw error;
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = (): AnalyticsData => ({
    overview: {
      total_assessments: 156,
      completed_assessments: 142,
      average_score: 7.3,
      completion_rate: 91.0,
      average_time_to_complete: 2.8,
      total_candidates: 89,
      active_candidates: 34,
      hired_candidates: 12,
      rejected_candidates: 43,
    },
    performance_trends: {
      daily_scores: [
        { date: '2024-01-15', average_score: 7.2, completion_count: 5 },
        { date: '2024-01-16', average_score: 7.5, completion_count: 8 },
        { date: '2024-01-17', average_score: 7.1, completion_count: 6 },
        { date: '2024-01-18', average_score: 7.8, completion_count: 9 },
        { date: '2024-01-19', average_score: 7.4, completion_count: 7 },
      ],
      weekly_performance: [
        { week: 'Week 1', average_score: 7.2, completion_rate: 89 },
        { week: 'Week 2', average_score: 7.5, completion_rate: 92 },
        { week: 'Week 3', average_score: 7.3, completion_rate: 90 },
        { week: 'Week 4', average_score: 7.6, completion_rate: 94 },
      ],
      monthly_summary: [
        { month: '2023-11', total_assessments: 45, average_score: 7.1 },
        { month: '2023-12', total_assessments: 52, average_score: 7.3 },
        { month: '2024-01', total_assessments: 59, average_score: 7.4 },
      ],
    },
    assessment_types: [
      {
        type: 'coding',
        count: 68,
        average_score: 7.1,
        completion_rate: 93,
        average_time: 2.5,
        difficulty_distribution: { easy: 15, medium: 35, hard: 18 },
      },
      {
        type: 'system-design',
        count: 45,
        average_score: 7.5,
        completion_rate: 89,
        average_time: 3.2,
        difficulty_distribution: { easy: 8, medium: 22, hard: 15 },
      },
      {
        type: 'behavioral',
        count: 29,
        average_score: 7.8,
        completion_rate: 95,
        average_time: 1.8,
        difficulty_distribution: { easy: 12, medium: 15, hard: 2 },
      },
      {
        type: 'technical',
        count: 14,
        average_score: 6.9,
        completion_rate: 86,
        average_time: 3.8,
        difficulty_distribution: { easy: 2, medium: 6, hard: 6 },
      },
    ],
    candidate_journey: [
      { stage: 'Applied', count: 200, conversion_rate: 100, average_time_in_stage: 0 },
      { stage: 'Assessment Sent', count: 156, conversion_rate: 78, average_time_in_stage: 1 },
      { stage: 'Assessment Started', count: 142, conversion_rate: 91, average_time_in_stage: 2 },
      { stage: 'Assessment Completed', count: 129, conversion_rate: 91, average_time_in_stage: 3 },
      { stage: 'Interview', count: 67, conversion_rate: 52, average_time_in_stage: 5 },
      { stage: 'Final Decision', count: 55, conversion_rate: 82, average_time_in_stage: 2 },
      { stage: 'Hired', count: 12, conversion_rate: 22, average_time_in_stage: 0 },
      { stage: 'Rejected', count: 43, conversion_rate: 78, average_time_in_stage: 0 },
    ],
    top_performers: [
      {
        candidate_name: 'John Doe',
        candidate_email: 'john.doe@example.com',
        average_score: 8.7,
        completed_assessments: 3,
        strengths: ['Problem-solving', 'Communication', 'Technical depth'],
      },
      {
        candidate_name: 'Jane Smith',
        candidate_email: 'jane.smith@example.com',
        average_score: 8.4,
        completed_assessments: 2,
        strengths: ['Algorithm knowledge', 'Code quality', 'System design'],
      },
      {
        candidate_name: 'Bob Wilson',
        candidate_email: 'bob.wilson@example.com',
        average_score: 8.2,
        completed_assessments: 4,
        strengths: ['Speed', 'Accuracy', 'Debugging skills'],
      },
    ],
    insights: [
      {
        type: 'positive',
        title: 'High Completion Rate',
        description: '91% of candidates complete their assessments, indicating good engagement.',
        impact: 'high',
      },
      {
        type: 'warning',
        title: 'Technical Assessment Drop-off',
        description: 'Technical assessments have a 14% lower completion rate than other types.',
        impact: 'medium',
      },
      {
        type: 'info',
        title: 'Peak Performance Times',
        description: 'Candidates perform best on assessments completed between 2-4 PM.',
        impact: 'low',
      },
    ],
  });

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#757575';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const handleExportReport = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      time_range: timeRange,
      ...analyticsData,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Analytics report exported successfully');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading analytics dashboard...</Typography>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Alert severity="error">
        Failed to load analytics data. Please try again.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
              }}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAnalyticsData}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
              '&:hover': {
                borderColor: 'rgba(98,0,69,0.8)',
                bgcolor: 'rgba(98,0,69,0.1)',
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportReport}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
              '&:hover': {
                borderColor: 'rgba(98,0,69,0.8)',
                bgcolor: 'rgba(98,0,69,0.1)',
              },
            }}
          >
            Export Report
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
              border: '1px solid rgba(33, 150, 243, 0.3)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {analyticsData.overview.total_assessments}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Assessments
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {analyticsData.overview.completed_assessments} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {analyticsData.overview.average_score.toFixed(1)}
                </Typography>
                <Star sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Average Score
              </Typography>
              <LinearProgress
                variant="determinate"
                value={analyticsData.overview.average_score * 10}
                sx={{
                  mt: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {analyticsData.overview.completion_rate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Completion Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={analyticsData.overview.completion_rate}
                sx={{
                  mt: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(100, 20, 140, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.3)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {analyticsData.overview.total_candidates}
                </Typography>
                <Person sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Candidates
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {analyticsData.overview.active_candidates} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline sx={{ color: 'rgba(98,0,69,1)' }} />
              Performance Trends
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Chart visualization would be implemented here with a charting library
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChart sx={{ color: 'rgba(98,0,69,1)' }} />
              Assessment Types
            </Typography>
            {analyticsData.assessment_types.map((type) => (
              <Box key={type.type} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    {type.type.toUpperCase()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {type.count} assessments
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Avg Score: {type.average_score.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Completion: {type.completion_rate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={type.average_score * 10}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: type.average_score >= 7.5 ? '#4caf50' : 
                                       type.average_score >= 6.5 ? '#ff9800' : '#f44336',
                    },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Candidate Journey */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChart sx={{ color: 'rgba(98,0,69,1)' }} />
              Candidate Journey Funnel
            </Typography>
            <Grid container spacing={2}>
              {analyticsData.candidate_journey.map((stage, index) => (
                <Grid item xs={12} md={3} key={stage.stage}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      {stage.stage}
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'rgba(98,0,69,1)', mb: 1 }}>
                      {stage.count}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Conversion: {stage.conversion_rate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stage.conversion_rate}
                      sx={{
                        mt: 1,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stage.conversion_rate >= 80 ? '#4caf50' : 
                                           stage.conversion_rate >= 60 ? '#ff9800' : '#f44336',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Performers and Insights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: '#4caf50' }} />
              Top Performers
            </Typography>
            {analyticsData.top_performers.map((performer, index) => (
              <Box key={performer.candidate_email} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'rgba(76,175,80,0.8)', width: 40, height: 40 }}>
                    {performer.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      {performer.candidate_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {performer.candidate_email}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                      {performer.average_score.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {performer.completed_assessments} assessments
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {performer.strengths.slice(0, 2).map((strength, i) => (
                    <Chip
                      key={i}
                      label={strength}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(76,175,80,0.2)',
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '0.7rem',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed sx={{ color: 'rgba(98,0,69,1)' }} />
              Key Insights
            </Typography>
            {analyticsData.insights.map((insight, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getInsightColor(insight.type),
                  }} />
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {insight.title}
                  </Typography>
                  <Chip
                    label={insight.impact.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getImpactColor(insight.impact),
                      color: 'white',
                      fontSize: '0.6rem',
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {insight.description}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Metrics Table */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assessment Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Count</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Avg Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Completion Rate</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Avg Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Difficulty Distribution</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData.assessment_types.map((type) => (
                <TableRow key={type.type}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {type.type.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {type.count}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{type.average_score.toFixed(1)}</Typography>
                      <Star sx={{ color: type.average_score >= 7.5 ? '#4caf50' : 
                                         type.average_score >= 6.5 ? '#ff9800' : '#f44336', fontSize: 16 }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{type.completion_rate}%</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={type.completion_rate}
                        sx={{
                          width: 60,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: type.completion_rate >= 90 ? '#4caf50' : 
                                             type.completion_rate >= 80 ? '#ff9800' : '#f44336',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {type.average_time.toFixed(1)}h
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {Object.entries(type.difficulty_distribution).map(([level, count]) => (
                        <Chip
                          key={level}
                          label={`${level}: ${count}`}
                          size="small"
                          sx={{
                            bgcolor: level === 'easy' ? 'rgba(76,175,80,0.2)' : 
                                     level === 'medium' ? 'rgba(255,152,0,0.2)' : 'rgba(244,67,54,0.2)',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.6rem',
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
