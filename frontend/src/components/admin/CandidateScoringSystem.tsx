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
  Person,
  Assessment,
  Star,
  TrendingUp,
  TrendingDown,
  Timeline,
  Speed,
  EmojiEvents,
  School,
  Work,
  Refresh,
  Download,
  Visibility,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ScoringCriteria {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'experience' | 'education';
  weight: number;
  max_score: number;
  description: string;
}

interface CandidateScore {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  overall_score: number;
  max_score: number;
  percentile: number;
  rank: number;
  category_scores: Record<string, number>;
  detailed_scores: Array<{
    criteria_id: string;
    criteria_name: string;
    score: number;
    max_score: number;
    weight: number;
    weighted_score: number;
    comments?: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  last_updated: string;
  assessment_count: number;
}

interface ScoringSystem {
  criteria: ScoringCriteria[];
  candidates: CandidateScore[];
  statistics: {
    total_candidates: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    score_distribution: Record<string, number>;
    category_averages: Record<string, number>;
  };
}

export default function CandidateScoringSystem() {
  const [scoringSystem, setScoringSystem] = useState<ScoringSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateScore | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'rank'>('score');

  useEffect(() => {
    fetchScoringSystem();
  }, []);

  const fetchScoringSystem = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_scoring_system')
        .select('*')
        .single();

      if (error) throw error;
      setScoringSystem(data);
    } catch (error) {
      console.error('Error fetching scoring system:', error);
      setScoringSystem(getMockScoringSystem());
    } finally {
      setLoading(false);
    }
  };

  const getMockScoringSystem = (): ScoringSystem => ({
    criteria: [
      { id: '1', name: 'Technical Skills', category: 'technical', weight: 0.35, max_score: 10, description: 'Programming and technical abilities' },
      { id: '2', name: 'Problem Solving', category: 'technical', weight: 0.25, max_score: 10, description: 'Analytical and problem-solving capabilities' },
      { id: '3', name: 'Communication', category: 'soft', weight: 0.20, max_score: 10, description: 'Verbal and written communication skills' },
      { id: '4', name: 'Teamwork', category: 'soft', weight: 0.15, max_score: 10, description: 'Collaboration and team interaction' },
      { id: '5', name: 'Experience', category: 'experience', weight: 0.20, max_score: 10, description: 'Relevant work experience' },
      { id: '6', name: 'Education', category: 'education', weight: 0.15, max_score: 10, description: 'Academic qualifications' },
    ],
    candidates: [
      {
        id: '1',
        candidate_id: 'candidate-1',
        candidate_name: 'John Doe',
        candidate_email: 'john.doe@example.com',
        overall_score: 8.7,
        max_score: 10,
        percentile: 95,
        rank: 1,
        category_scores: {
          'Technical Skills': 9.2,
          'Problem Solving': 8.8,
          'Communication': 8.5,
          'Teamwork': 9.0,
          'Experience': 8.5,
          'Education': 8.2,
        },
        detailed_scores: [
          { criteria_id: '1', criteria_name: 'Technical Skills', score: 9.2, max_score: 10, weight: 0.35, weighted_score: 3.22 },
          { criteria_id: '2', criteria_name: 'Problem Solving', score: 8.8, max_score: 10, weight: 0.25, weighted_score: 2.20 },
          { criteria_id: '3', criteria_name: 'Communication', score: 8.5, max_score: 10, weight: 0.20, weighted_score: 1.70 },
          { criteria_id: '4', criteria_name: 'Teamwork', score: 9.0, max_score: 10, weight: 0.15, weighted_score: 1.35 },
          { criteria_id: '5', criteria_name: 'Experience', score: 8.5, max_score: 10, weight: 0.20, weighted_score: 1.70 },
          { criteria_id: '6', criteria_name: 'Education', score: 8.2, max_score: 10, weight: 0.15, weighted_score: 1.23 },
        ],
        strengths: ['Strong technical foundation', 'Excellent problem-solving', 'Great team player'],
        weaknesses: ['Limited leadership experience', 'Could improve documentation'],
        recommendations: ['Consider for senior role', 'Provide leadership training', 'Focus on technical mentorship'],
        last_updated: '2024-01-16T14:30:00Z',
        assessment_count: 5,
      },
      {
        id: '2',
        candidate_id: 'candidate-2',
        candidate_name: 'Jane Smith',
        candidate_email: 'jane.smith@example.com',
        overall_score: 8.2,
        max_score: 10,
        percentile: 88,
        rank: 2,
        category_scores: {
          'Technical Skills': 8.8,
          'Problem Solving': 8.5,
          'Communication': 7.8,
          'Teamwork': 8.2,
          'Experience': 7.5,
          'Education': 8.5,
        },
        detailed_scores: [
          { criteria_id: '1', criteria_name: 'Technical Skills', score: 8.8, max_score: 10, weight: 0.35, weighted_score: 3.08 },
          { criteria_id: '2', criteria_name: 'Problem Solving', score: 8.5, max_score: 10, weight: 0.25, weighted_score: 2.13 },
          { criteria_id: '3', criteria_name: 'Communication', score: 7.8, max_score: 10, weight: 0.20, weighted_score: 1.56 },
          { criteria_id: '4', criteria_name: 'Teamwork', score: 8.2, max_score: 10, weight: 0.15, weighted_score: 1.23 },
          { criteria_id: '5', criteria_name: 'Experience', score: 7.5, max_score: 10, weight: 0.20, weighted_score: 1.50 },
          { criteria_id: '6', criteria_name: 'Education', score: 8.5, max_score: 10, weight: 0.15, weighted_score: 1.28 },
        ],
        strengths: ['Solid technical skills', 'Good academic background', 'Reliable team member'],
        weaknesses: ['Needs improvement in communication', 'Limited project leadership'],
        recommendations: ['Focus on communication skills', 'Consider for mid-level role', 'Provide presentation training'],
        last_updated: '2024-01-15T16:45:00Z',
        assessment_count: 4,
      },
    ],
    statistics: {
      total_candidates: 2,
      average_score: 8.45,
      highest_score: 8.7,
      lowest_score: 8.2,
      score_distribution: {
        '9.0-10.0': 0,
        '8.0-8.9': 2,
        '7.0-7.9': 0,
        '6.0-6.9': 0,
        'Below 6.0': 0,
      },
      category_averages: {
        'Technical Skills': 9.0,
        'Problem Solving': 8.65,
        'Communication': 8.15,
        'Teamwork': 8.6,
        'Experience': 8.0,
        'Education': 8.35,
      },
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return '#4caf50';
    if (score >= 8.0) return '#8bc34a';
    if (score >= 7.0) return '#ff9800';
    if (score >= 6.0) return '#ff5722';
    return '#f44336';
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return '#4caf50';
    if (percentile >= 80) return '#8bc34a';
    if (percentile >= 70) return '#ff9800';
    if (percentile >= 60) return '#ff5722';
    return '#f44336';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Assessment sx={{ fontSize: 16 }} />;
      case 'soft': return <Person sx={{ fontSize: 16 }} />;
      case 'experience': return <Work sx={{ fontSize: 16 }} />;
      case 'education': return <School sx={{ fontSize: 16 }} />;
      default: return <Star sx={{ fontSize: 16 }} />;
    }
  };

  const handleViewDetails = (candidate: CandidateScore) => {
    setSelectedCandidate(candidate);
    setDetailsDialogOpen(true);
  };

  const handleExportScores = () => {
    const csvContent = [
      ['Rank', 'Candidate', 'Email', 'Overall Score', 'Percentile', 'Assessments'],
      ...scoringSystem!.candidates.map(candidate => [
        candidate.rank.toString(),
        candidate.candidate_name,
        candidate.candidate_email,
        candidate.overall_score.toFixed(2),
        `${candidate.percentile}%`,
        candidate.assessment_count.toString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate_scores_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Candidate scores exported successfully');
  };

  const sortedCandidates = [...scoringSystem!.candidates].sort((a, b) => {
    switch (sortBy) {
      case 'score': return b.overall_score - a.overall_score;
      case 'name': return a.candidate_name.localeCompare(b.candidate_name);
      case 'rank': return a.rank - b.rank;
      default: return 0;
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading candidate scoring system...</Typography>
      </Box>
    );
  }

  if (!scoringSystem) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>No scoring system data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Candidate Scoring System
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
              }}
            >
              <MenuItem value="score">Score</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="rank">Rank</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportScores}
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
            onClick={fetchScoringSystem}
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
                {scoringSystem.statistics.total_candidates}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Candidates
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {scoringSystem.statistics.average_score.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {scoringSystem.statistics.highest_score.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Highest Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(100, 20, 140, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {scoringSystem.criteria.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Scoring Criteria
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Scoring Criteria */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Scoring Criteria
        </Typography>
        <Grid container spacing={2}>
          {scoringSystem.criteria.map((criteria) => (
            <Grid item xs={12} sm={6} md={4} key={criteria.id}>
              <Card sx={{ background: 'rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getCategoryIcon(criteria.category)}
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {criteria.name}
                    </Typography>
                    <Chip
                      label={`${(criteria.weight * 100).toFixed(0)}%`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(98,0,69,0.8)',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {criteria.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Max Score: {criteria.max_score}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Candidate Scores Table */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Candidate Rankings
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rank</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Candidate</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Overall Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Percentile</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assessments</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiEvents sx={{ color: getPercentileColor(candidate.percentile), fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{candidate.rank}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(98,0,69,0.8)', width: 32, height: 32 }}>
                        {candidate.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {candidate.candidate_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {candidate.candidate_email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {candidate.overall_score.toFixed(2)}/{candidate.max_score}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(candidate.overall_score / candidate.max_score) * 100}
                        sx={{
                          width: 60,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getScoreColor(candidate.overall_score),
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${candidate.percentile}%`}
                      size="small"
                      sx={{
                        bgcolor: getPercentileColor(candidate.percentile),
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {candidate.assessment_count}
                    </Typography>
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

      {/* Category Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Category Performance
            </Typography>
            {Object.entries(scoringSystem.statistics.category_averages).map(([category, average]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getCategoryIcon(
                      scoringSystem.criteria.find(c => c.name === category)?.category || 'technical'
                    )}
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {category}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    {average.toFixed(2)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={average * 10}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(average),
                    },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Score Distribution
            </Typography>
            {Object.entries(scoringSystem.statistics.score_distribution).map(([range, count]) => (
              <Box key={range} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {range}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    {count} candidates
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={scoringSystem.statistics.total_candidates > 0 ? (count / scoringSystem.statistics.total_candidates) * 100 : 0}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: range.includes('9.0') ? '#4caf50' : 
                                       range.includes('8.0') ? '#8bc34a' : '#ff9800',
                    },
                  }}
                />
              </Box>
            ))}
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
          Candidate Score Details - {selectedCandidate?.candidate_name}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedCandidate && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Detailed Scores
                </Typography>
                {selectedCandidate.detailed_scores.map((score) => (
                  <Box key={score.criteria_id} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {score.criteria_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {score.score}/{score.max_score}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Weight: {(score.weight * 100).toFixed(0)}% | Weighted Score: {score.weighted_score.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Analysis
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#4caf50', mb: 1 }}>
                    Strengths:
                  </Typography>
                  {selectedCandidate.strengths.map((strength, index) => (
                    <Typography key={index} variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', ml: 1 }}>
                      • {strength}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#ff9800', mb: 1 }}>
                    Weaknesses:
                  </Typography>
                  {selectedCandidate.weaknesses.map((weakness, index) => (
                    <Typography key={index} variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', ml: 1 }}>
                      • {weakness}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#2196f3', mb: 1 }}>
                    Recommendations:
                  </Typography>
                  {selectedCandidate.recommendations.map((recommendation, index) => (
                    <Typography key={index} variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', ml: 1 }}>
                      • {recommendation}
                    </Typography>
                  ))}
                </Box>
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
