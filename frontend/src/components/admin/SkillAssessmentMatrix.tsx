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
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  Star,
  Refresh,
  Visibility,
  Download,
  School,
  Code,
  Psychology,
  Work,
  Language,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface SkillAssessment {
  id: string;
  skill_id: string;
  skill_name: string;
  category_id: string;
  category_name: string;
  candidate_id: string;
  candidate_name: string;
  assessment_type: string;
  score: number;
  max_score: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  trend: 'improving' | 'stable' | 'declining';
  last_assessed: string;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface SkillMatrix {
  categories: SkillCategory[];
  assessments: SkillAssessment[];
  average_scores: Record<string, number>;
  skill_distribution: Record<string, Record<string, number>>;
  top_performers: Array<{
    skill_name: string;
    candidate_name: string;
    score: number;
  }>;
  skill_gaps: Array<{
    skill_name: string;
    gap_percentage: number;
    recommended_action: string;
  }>;
}

export default function SkillAssessmentMatrix() {
  const [skillMatrix, setSkillMatrix] = useState<SkillMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'distribution' | 'gaps'>('matrix');

  useEffect(() => {
    fetchSkillMatrix();
  }, []);

  const fetchSkillMatrix = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_assessment_matrix')
        .select('*')
        .single();

      if (error) throw error;
      setSkillMatrix(data);
    } catch (error) {
      console.error('Error fetching skill matrix:', error);
      setSkillMatrix(getMockSkillMatrix());
    } finally {
      setLoading(false);
    }
  };

  const getMockSkillMatrix = (): SkillMatrix => ({
    categories: [
      { id: '1', name: 'Technical Skills', description: 'Programming and technical abilities', icon: 'code', color: '#2196f3' },
      { id: '2', name: 'Soft Skills', description: 'Communication and interpersonal abilities', icon: 'psychology', color: '#4caf50' },
      { id: '3', name: 'Domain Knowledge', description: 'Industry-specific expertise', icon: 'work', color: '#ff9800' },
      { id: '4', name: 'Languages', description: 'Programming and spoken languages', icon: 'language', color: '#9c27b0' },
    ],
    assessments: [
      {
        id: '1',
        skill_id: 'js',
        skill_name: 'JavaScript',
        category_id: '1',
        category_name: 'Technical Skills',
        candidate_id: 'candidate-1',
        candidate_name: 'John Doe',
        assessment_type: 'coding',
        score: 8.5,
        max_score: 10,
        level: 'advanced',
        trend: 'improving',
        last_assessed: '2024-01-15T10:00:00Z',
        confidence_score: 0.92,
        strengths: ['ES6+ features', 'Async programming', 'DOM manipulation'],
        weaknesses: ['Performance optimization', 'Memory management'],
        recommendations: ['Focus on advanced patterns', 'Learn performance profiling'],
      },
      {
        id: '2',
        skill_id: 'react',
        skill_name: 'React',
        category_id: '1',
        category_name: 'Technical Skills',
        candidate_id: 'candidate-1',
        candidate_name: 'John Doe',
        assessment_type: 'coding',
        score: 9.0,
        max_score: 10,
        level: 'expert',
        trend: 'stable',
        last_assessed: '2024-01-14T14:00:00Z',
        confidence_score: 0.95,
        strengths: ['Hooks', 'State management', 'Component architecture'],
        weaknesses: ['Server-side rendering'],
        recommendations: ['Explore Next.js', 'Learn SSR patterns'],
      },
      {
        id: '3',
        skill_id: 'communication',
        skill_name: 'Communication',
        category_id: '2',
        category_name: 'Soft Skills',
        candidate_id: 'candidate-1',
        candidate_name: 'John Doe',
        assessment_type: 'behavioral',
        score: 7.5,
        max_score: 10,
        level: 'intermediate',
        trend: 'improving',
        last_assessed: '2024-01-13T16:00:00Z',
        confidence_score: 0.88,
        strengths: ['Clear explanations', 'Active listening'],
        weaknesses: ['Public speaking', 'Written communication'],
        recommendations: ['Practice presentations', 'Improve documentation skills'],
      },
    ],
    average_scores: {
      'Technical Skills': 7.8,
      'Soft Skills': 7.2,
      'Domain Knowledge': 6.9,
      'Languages': 8.1,
    },
    skill_distribution: {
      'Technical Skills': {
        beginner: 15,
        intermediate: 35,
        advanced: 30,
        expert: 20,
      },
      'Soft Skills': {
        beginner: 10,
        intermediate: 40,
        advanced: 35,
        expert: 15,
      },
    },
    top_performers: [
      { skill_name: 'JavaScript', candidate_name: 'John Doe', score: 8.5 },
      { skill_name: 'React', candidate_name: 'Jane Smith', score: 9.2 },
      { skill_name: 'Communication', candidate_name: 'Mike Chen', score: 8.8 },
    ],
    skill_gaps: [
      { skill_name: 'Cloud Architecture', gap_percentage: 65, recommended_action: 'AWS/Azure training' },
      { skill_name: 'DevOps Practices', gap_percentage: 58, recommended_action: 'CI/CD workshop' },
      { skill_name: 'Security Best Practices', gap_percentage: 52, recommended_action: 'Security certification' },
    ],
  });

  const getSkillIcon = (iconName: string) => {
    switch (iconName) {
      case 'code': return <Code sx={{ fontSize: 20 }} />;
      case 'psychology': return <Psychology sx={{ fontSize: 20 }} />;
      case 'work': return <Work sx={{ fontSize: 20 }} />;
      case 'language': return <Language sx={{ fontSize: 20 }} />;
      default: return <School sx={{ fontSize: 20 }} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return '#4caf50';
      case 'advanced': return '#8bc34a';
      case 'intermediate': return '#ff9800';
      case 'beginner': return '#f44336';
      default: return '#757575';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp sx={{ color: '#4caf50', fontSize: 16 }} />;
      case 'declining': return <TrendingDown sx={{ color: '#f44336', fontSize: 16 }} />;
      default: return <Star sx={{ color: '#ff9800', fontSize: 16 }} />;
    }
  };

  const handleExportMatrix = () => {
    const csvContent = [
      ['Skill', 'Category', 'Candidate', 'Score', 'Level', 'Trend', 'Last Assessed'],
      ...skillMatrix!.assessments.map(assessment => [
        assessment.skill_name,
        assessment.category_name,
        assessment.candidate_name,
        assessment.score.toString(),
        assessment.level,
        assessment.trend,
        new Date(assessment.last_assessed).toLocaleDateString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill_assessment_matrix_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Skill assessment matrix exported successfully');
  };

  const filteredAssessments = skillMatrix?.assessments.filter(assessment => {
    if (selectedCategory === 'all') return true;
    return assessment.category_id === selectedCategory;
  }) || [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading skill assessment matrix...</Typography>
      </Box>
    );
  }

  if (!skillMatrix) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>No skill matrix data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Skill Assessment Matrix
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {skillMatrix.categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportMatrix}
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
            onClick={fetchSkillMatrix}
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
                {skillMatrix.assessments.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Assessments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {skillMatrix.categories.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Skill Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {Object.values(skillMatrix.average_scores).reduce((sum, score) => sum + score, 0) / Object.keys(skillMatrix.average_scores).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(180, 20, 20, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {skillMatrix.skill_gaps.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Skill Gaps
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Skill Categories Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {skillMatrix.categories.map((category) => (
          <Grid item xs={12} sm={6} md={3} key={category.id}>
            <Card sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: category.color, width: 40, height: 40 }}>
                    {getSkillIcon(category.icon)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem' }}>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {category.description}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Average Score
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {skillMatrix.average_scores[category.name]?.toFixed(1) || 'N/A'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(skillMatrix.average_scores[category.name] || 0) * 10}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: category.color,
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {filteredAssessments.filter(a => a.category_id === category.id).length} assessments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Skill Assessments Table */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Skill Assessments
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Candidate</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Skill</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Score</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Level</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Trend</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Confidence</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Last Assessed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(98,0,69,0.8)', width: 32, height: 32 }}>
                        {assessment.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">
                        {assessment.candidate_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {assessment.skill_name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Chip
                      label={assessment.category_name}
                      size="small"
                      sx={{
                        bgcolor: skillMatrix.categories.find(c => c.id === assessment.category_id)?.color || '#757575',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {assessment.score}/{assessment.max_score}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(assessment.score / assessment.max_score) * 100}
                        sx={{
                          width: 60,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getLevelColor(assessment.level),
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assessment.level.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getLevelColor(assessment.level),
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {getTrendIcon(assessment.trend)}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {(assessment.confidence_score * 100).toFixed(0)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={assessment.confidence_score * 100}
                        sx={{
                          width: 60,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: assessment.confidence_score >= 0.8 ? '#4caf50' : '#ff9800',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {new Date(assessment.last_assessed).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Top Performers and Skill Gaps */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Top Performers
            </Typography>
            <List>
              {skillMatrix.top_performers.map((performer, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {performer.skill_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {performer.candidate_name}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                      {performer.score.toFixed(1)}
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
              Skill Gaps Analysis
            </Typography>
            <List>
              {skillMatrix.skill_gaps.map((gap, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {gap.skill_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#f44336' }}>
                      {gap.gap_percentage}% gap
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {gap.recommended_action}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={gap.gap_percentage}
                    sx={{
                      mt: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#f44336',
                      },
                    }}
                  />
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
