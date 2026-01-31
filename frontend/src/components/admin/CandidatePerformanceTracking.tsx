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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Person,
  Star,
  Visibility,
  Download,
  Refresh,
  CheckCircle,
  LocationOn,
  EmojiEvents,
  Leaderboard,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  status: 'active' | 'completed' | 'rejected' | 'hired' | 'on_hold';
  created_at: string;
  updated_at: string;
}

interface PerformanceMetrics {
  overall_score: number;
  total_assessments: number;
  completed_assessments: number;
  success_rate: number;
  rank: number;
  percentile: number;
}

interface SkillAssessment {
  skill_name: string;
  category: 'technical' | 'soft' | 'domain' | 'language';
  level: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface CandidatePerformanceTracker {
  profile: CandidateProfile;
  metrics: PerformanceMetrics;
  skills: SkillAssessment[];
  strengths: string[];
  recommendations: string[];
}

export default function CandidatePerformanceTracking() {
  const [candidates, setCandidates] = useState<CandidatePerformanceTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePerformanceTracker | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_performance_tracking')
        .select('*')
        .order('metrics->>overall_score', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      setCandidates(getMockCandidateData());
    } finally {
      setLoading(false);
    }
  };

  const getMockCandidateData = (): CandidatePerformanceTracker[] => [
    {
      profile: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        status: 'active',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T14:00:00Z',
      },
      metrics: {
        overall_score: 8.7,
        total_assessments: 5,
        completed_assessments: 5,
        success_rate: 100,
        rank: 1,
        percentile: 95,
      },
      skills: [
        { skill_name: 'JavaScript', category: 'technical', level: 9, trend: 'improving' },
        { skill_name: 'React', category: 'technical', level: 8, trend: 'stable' },
        { skill_name: 'Communication', category: 'soft', level: 9, trend: 'improving' },
      ],
      strengths: ['Problem Solving', 'Communication', 'Leadership'],
      recommendations: ['Proceed to final interview', 'Consider for senior position'],
    },
    {
      profile: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0124',
        location: 'New York, NY',
        status: 'active',
        created_at: '2024-01-12T09:00:00Z',
        updated_at: '2024-01-16T16:00:00Z',
      },
      metrics: {
        overall_score: 7.8,
        total_assessments: 4,
        completed_assessments: 4,
        success_rate: 100,
        rank: 2,
        percentile: 85,
      },
      skills: [
        { skill_name: 'Python', category: 'technical', level: 9, trend: 'stable' },
        { skill_name: 'Django', category: 'technical', level: 8, trend: 'improving' },
        { skill_name: 'Database Design', category: 'technical', level: 8, trend: 'stable' },
      ],
      strengths: ['Backend Development', 'Database Design', 'API Development'],
      recommendations: ['Consider for backend position', 'Improve frontend skills'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': return '#4caf50';
      case 'active': return '#2196f3';
      case 'completed': return '#ff9800';
      case 'rejected': return '#f44336';
      case 'on_hold': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return '#4caf50';
    if (score >= 7.0) return '#8bc34a';
    if (score >= 6.0) return '#ff9800';
    return '#f44336';
  };

  const handleViewDetails = (candidate: CandidatePerformanceTracker) => {
    setSelectedCandidate(candidate);
    setDetailsDialogOpen(true);
  };

  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Overall Score', 'Status', 'Assessments Completed', 'Success Rate', 'Rank'],
      ...candidates.map(c => [
        c.profile.name,
        c.profile.email,
        c.metrics.overall_score.toFixed(2),
        c.profile.status,
        c.metrics.completed_assessments.toString(),
        `${c.metrics.success_rate}%`,
        `#${c.metrics.rank}`
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

    toast.success('Candidate performance data exported successfully');
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (filterStatus === 'all') return true;
    return candidate.profile.status === filterStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'score': return b.metrics.overall_score - a.metrics.overall_score;
      case 'name': return a.profile.name.localeCompare(b.profile.name);
      case 'date': return new Date(b.profile.updated_at).getTime() - new Date(a.profile.updated_at).getTime();
      default: return 0;
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading candidate performance tracking...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Candidate Performance Tracking
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="hired">Hired</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCandidateData}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
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
            }}
          >
            Export
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
                {candidates.length}
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
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {candidates.filter(c => c.profile.status === 'active').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Active Candidates
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
                {(candidates.reduce((sum, c) => sum + c.metrics.overall_score, 0) / candidates.length).toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Average Score
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
                {candidates.filter(c => c.profile.status === 'hired').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Hired Candidates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Candidates Table */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Candidate</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Overall Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assessments</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Success Rate</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rank</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.profile.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(98,0,69,0.8)', width: 40, height: 40 }}>
                        {candidate.profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {candidate.profile.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {candidate.profile.email}
                        </Typography>
                        {candidate.profile.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <LocationOn sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              {candidate.profile.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {candidate.metrics.overall_score.toFixed(1)}
                      </Typography>
                      <Star sx={{ color: getScoreColor(candidate.metrics.overall_score), fontSize: 16 }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={candidate.metrics.overall_score * 10}
                      sx={{
                        mt: 1,
                        width: 60,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(candidate.metrics.overall_score),
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={candidate.profile.status.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(candidate.profile.status),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {candidate.metrics.completed_assessments}/{candidate.metrics.total_assessments}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {candidate.metrics.success_rate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={candidate.metrics.success_rate}
                        sx={{
                          width: 60,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: candidate.metrics.success_rate >= 80 ? '#4caf50' : '#ff9800',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Leaderboard sx={{ color: 'rgba(98,0,69,1)', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{candidate.metrics.rank}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        ({candidate.metrics.percentile}%)
                      </Typography>
                    </Box>
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
    </Box>
  );
}
