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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Person,
  Assessment,
  Star,
  Schedule,
  Email,
  Phone,
  Visibility,
  Download,
  Refresh,
  Info,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface CandidatePerformance {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  total_assessments: number;
  completed_assessments: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  completion_rate: number;
  time_to_complete: number; // average in hours
  assessment_types: string[];
  last_assessment_date: string;
  first_assessment_date: string;
  status: 'active' | 'completed' | 'rejected' | 'hired';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

interface PerformanceMetrics {
  total_candidates: number;
  average_score: number;
  completion_rate: number;
  average_time_to_complete: number;
  top_performers: CandidatePerformance[];
  needs_improvement: CandidatePerformance[];
  assessment_type_performance: Record<string, {
    count: number;
    average_score: number;
    completion_rate: number;
  }>;
}

export default function AssessmentPerformanceInsights() {
  const [candidates, setCandidates] = useState<CandidatePerformance[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePerformance | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_performance')
        .select('*')
        .order('average_score', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
      calculateMetrics(data || []);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      const mockData = getMockCandidates();
      setCandidates(mockData);
      calculateMetrics(mockData);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (candidateData: CandidatePerformance[]) => {
    const totalCandidates = candidateData.length;
    const averageScore = candidateData.reduce((sum, c) => sum + c.average_score, 0) / totalCandidates;
    const completionRate = candidateData.reduce((sum, c) => sum + c.completion_rate, 0) / totalCandidates;
    const averageTimeToComplete = candidateData.reduce((sum, c) => sum + c.time_to_complete, 0) / totalCandidates;

    const topPerformers = candidateData
      .filter(c => c.average_score >= 8)
      .sort((a, b) => b.average_score - a.average_score)
      .slice(0, 5);

    const needsImprovement = candidateData
      .filter(c => c.average_score < 6)
      .sort((a, b) => a.average_score - b.average_score)
      .slice(0, 5);

    const assessmentTypePerformance: Record<string, any> = {};
    candidateData.forEach(candidate => {
      candidate.assessment_types.forEach(type => {
        if (!assessmentTypePerformance[type]) {
          assessmentTypePerformance[type] = {
            count: 0,
            totalScore: 0,
            completed: 0,
          };
        }
        assessmentTypePerformance[type].count++;
        assessmentTypePerformance[type].totalScore += candidate.average_score;
        if (candidate.status === 'completed') {
          assessmentTypePerformance[type].completed++;
        }
      });
    });

    Object.keys(assessmentTypePerformance).forEach(type => {
      const data = assessmentTypePerformance[type];
      assessmentTypePerformance[type] = {
        count: data.count,
        average_score: data.totalScore / data.count,
        completion_rate: (data.completed / data.count) * 100,
      };
    });

    setMetrics({
      totalCandidates,
      averageScore,
      completionRate,
      averageTimeToComplete,
      topPerformers,
      needsImprovement,
      assessment_type_performance: assessmentTypePerformance,
    });
  };

  const getMockCandidates = (): CandidatePerformance[] => [
    {
      id: '1',
      candidate_name: 'John Doe',
      candidate_email: 'john.doe@example.com',
      candidate_phone: '+1-555-0123',
      total_assessments: 3,
      completed_assessments: 3,
      average_score: 8.7,
      highest_score: 9.2,
      lowest_score: 8.1,
      completion_rate: 100,
      time_to_complete: 2.5,
      assessment_types: ['system-design', 'coding', 'behavioral'],
      last_assessment_date: '2024-01-15T14:00:00Z',
      first_assessment_date: '2024-01-10T10:00:00Z',
      status: 'hired',
      strengths: ['Excellent problem-solving', 'Strong communication', 'Technical depth'],
      weaknesses: ['Needs more experience with distributed systems'],
      recommendations: ['Proceed with final interview', 'Consider for senior position'],
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-15T14:00:00Z',
    },
    {
      id: '2',
      candidate_name: 'Jane Smith',
      candidate_email: 'jane.smith@example.com',
      candidate_phone: '+1-555-0124',
      total_assessments: 2,
      completed_assessments: 2,
      average_score: 7.3,
      highest_score: 8.0,
      lowest_score: 6.6,
      completion_rate: 100,
      time_to_complete: 3.2,
      assessment_types: ['coding', 'system-design'],
      last_assessment_date: '2024-01-14T16:00:00Z',
      first_assessment_date: '2024-01-12T09:00:00Z',
      status: 'active',
      strengths: ['Good coding skills', 'Quick learner'],
      weaknesses: ['Communication could be improved', 'Limited system design experience'],
      recommendations: ['Schedule behavioral interview', 'Provide system design training'],
      created_at: '2024-01-12T09:00:00Z',
      updated_at: '2024-01-14T16:00:00Z',
    },
    {
      id: '3',
      candidate_name: 'Bob Wilson',
      candidate_email: 'bob.wilson@example.com',
      total_assessments: 1,
      completed_assessments: 1,
      average_score: 5.8,
      highest_score: 5.8,
      lowest_score: 5.8,
      completion_rate: 100,
      time_to_complete: 4.5,
      assessment_types: ['coding'],
      last_assessment_date: '2024-01-13T11:00:00Z',
      first_assessment_date: '2024-01-13T11:00:00Z',
      status: 'rejected',
      strengths: ['Basic programming knowledge'],
      weaknesses: ['Slow problem-solving', 'Limited algorithm knowledge'],
      recommendations: ['Not recommended for current position', 'Consider junior role if available'],
      created_at: '2024-01-13T11:00:00Z',
      updated_at: '2024-01-13T11:00:00Z',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': return '#4caf50';
      case 'active': return '#2196f3';
      case 'completed': return '#ff9800';
      case 'rejected': return '#f44336';
      default: return '#757575';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4caf50';
    if (score >= 6) return '#ff9800';
    if (score >= 4) return '#ff9800';
    return '#f44336';
  };

  const handleViewDetails = (candidate: CandidatePerformance) => {
    setSelectedCandidate(candidate);
    setDetailsDialogOpen(true);
  };

  const handleExportData = () => {
    const csvContent = [
      ['Candidate Name', 'Email', 'Average Score', 'Completion Rate', 'Status', 'Assessments Completed'],
      ...candidates.map(c => [
        c.candidate_name,
        c.candidate_email,
        c.average_score.toFixed(2),
        `${c.completion_rate}%`,
        c.status,
        `${c.completed_assessments}/${c.total_assessments}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate_performance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Performance data exported successfully');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading performance insights...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Performance Insights
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchPerformanceData}
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
            onClick={handleExportData}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
              '&:hover': {
                borderColor: 'rgba(98,0,69,0.8)',
                bgcolor: 'rgba(98,0,69,0.1)',
              },
            }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Overview Metrics */}
      {metrics && (
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
                  {metrics.totalCandidates}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Candidates
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
                    {metrics.averageScore.toFixed(1)}
                  </Typography>
                  <Star sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Average Score
                </Typography>
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
                  {metrics.completionRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Completion Rate
                </Typography>
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
                    {metrics.averageTimeToComplete.toFixed(1)}h
                  </Typography>
                  <Schedule sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Avg. Time to Complete
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Top Performers */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: '#4caf50' }} />
              Top Performers
            </Typography>
            {metrics?.topPerformers.map((candidate, index) => (
              <Box key={candidate.id} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'rgba(76,175,80,0.8)', width: 40, height: 40 }}>
                    {candidate.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      {candidate.candidate_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {candidate.candidate_email}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                      {candidate.average_score.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Avg Score
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {candidate.strengths.slice(0, 2).map((strength, i) => (
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
              <TrendingDown sx={{ color: '#f44336' }} />
              Needs Improvement
            </Typography>
            {metrics?.needsImprovement.map((candidate, index) => (
              <Box key={candidate.id} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'rgba(244,67,54,0.8)', width: 40, height: 40 }}>
                    {candidate.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                      {candidate.candidate_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {candidate.candidate_email}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 600 }}>
                      {candidate.average_score.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Avg Score
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {candidate.weaknesses.slice(0, 2).map((weakness, i) => (
                    <Chip
                      key={i}
                      label={weakness}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(244,67,54,0.2)',
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
      </Grid>

      {/* Assessment Type Performance */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Performance by Assessment Type
        </Typography>
        <Grid container spacing={2}>
          {metrics?.assessment_type_performance && Object.entries(metrics.assessment_type_performance).map(([type, data]) => (
            <Grid item xs={12} md={4} key={type}>
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                  {type.replace('-', ' ').toUpperCase()}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Candidates: {data.count}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Average Score: {data.average_score.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Completion Rate: {data.completion_rate.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data.average_score * 10}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(data.average_score),
                    },
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Detailed Performance Table */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Candidate</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Average Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Completion Rate</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assessments</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Time to Complete</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(98,0,69,0.8)', width: 32, height: 32 }}>
                        {candidate.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{candidate.candidate_name}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {candidate.candidate_email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{candidate.average_score.toFixed(1)}</Typography>
                      <Star sx={{ color: getScoreColor(candidate.average_score), fontSize: 16 }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{candidate.completion_rate.toFixed(1)}%</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={candidate.completion_rate}
                        sx={{
                          width: 60,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: candidate.completion_rate >= 80 ? '#4caf50' : 
                                             candidate.completion_rate >= 60 ? '#ff9800' : '#f44336',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {candidate.completed_assessments}/{candidate.total_assessments}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {candidate.time_to_complete.toFixed(1)}h
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={candidate.status.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(candidate.status),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(candidate)}
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

      {/* Candidate Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Candidate Performance Details
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedCandidate && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(98,0,69,0.8)', width: 48, height: 48 }}>
                    {selectedCandidate.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {selectedCandidate.candidate_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {selectedCandidate.candidate_email}
                    </Typography>
                    {selectedCandidate.candidate_phone && (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {selectedCandidate.candidate_phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Performance Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Average Score:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {selectedCandidate.average_score.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Highest Score:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {selectedCandidate.highest_score.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Lowest Score:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {selectedCandidate.lowest_score.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Assessment Timeline
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      First Assessment:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {new Date(selectedCandidate.first_assessment_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Last Assessment:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {new Date(selectedCandidate.last_assessment_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Assessment Types
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedCandidate.assessment_types.map((type, index) => (
                    <Chip
                      key={index}
                      label={type.replace('-', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(98,0,69,0.8)',
                        color: 'white',
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Strengths
                </Typography>
                <List dense>
                  {selectedCandidate.strengths.map((strength, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircle sx={{ color: '#4caf50', fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={strength}
                        primaryTypographyProps={{
                          sx: { color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Areas for Improvement
                </Typography>
                <List dense>
                  {selectedCandidate.weaknesses.map((weakness, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Warning sx={{ color: '#ff9800', fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={weakness}
                        primaryTypographyProps={{
                          sx: { color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Recommendations
                </Typography>
                <List dense>
                  {selectedCandidate.recommendations.map((recommendation, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Info sx={{ color: '#2196f3', fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={recommendation}
                        primaryTypographyProps={{
                          sx: { color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
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
