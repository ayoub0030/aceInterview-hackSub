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
  SmartToy,
  Psychology,
  TrendingUp,
  Lightbulb,
  Assessment,
  Person,
  School,
  Work,
  Refresh,
  Visibility,
  Download,
  Star,
  Timeline,
  Speed,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AIRecommendation {
  id: string;
  type: 'assessment' | 'candidate' | 'skill_gap' | 'improvement';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  data: Record<string, any>;
  created_at: string;
  is_applied: boolean;
}

interface AIInsight {
  id: string;
  category: 'performance' | 'trend' | 'prediction' | 'anomaly';
  title: string;
  description: string;
  metrics: Record<string, number>;
  recommendations: string[];
  confidence: number;
  created_at: string;
}

interface AIPrediction {
  id: string;
  prediction_type: 'candidate_success' | 'assessment_difficulty' | 'completion_time' | 'skill_mastery';
  target_id: string;
  target_name: string;
  prediction: number;
  confidence: number;
  factors: Array<{
    factor: string;
    weight: number;
    value: number;
  }>;
  created_at: string;
}

interface AIAnalytics {
  recommendations: AIRecommendation[];
  insights: AIInsight[];
  predictions: AIPrediction[];
  statistics: {
    total_recommendations: number;
    applied_recommendations: number;
    average_confidence: number;
    accuracy_rate: number;
    model_performance: {
      precision: number;
      recall: number;
      f1_score: number;
    };
  };
}

export default function AIPoweredAssessmentRecommendations() {
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAIAnalytics();
  }, []);

  const fetchAIAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_assessment_analytics')
        .select('*')
        .single();

      if (error) throw error;
      setAiAnalytics(data);
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      setAiAnalytics(getMockAIAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getMockAIAnalytics = (): AIAnalytics => ({
    recommendations: [
      {
        id: '1',
        type: 'assessment',
        title: 'React Frontend Assessment Recommended',
        description: 'Based on candidate profile and job requirements, React assessment is highly recommended',
        confidence: 0.92,
        priority: 'high',
        data: {
          candidate_id: 'candidate-1',
          job_role: 'Frontend Developer',
          required_skills: ['React', 'JavaScript', 'CSS'],
          current_skill_level: 7.5,
        },
        created_at: '2024-01-16T10:00:00Z',
        is_applied: false,
      },
      {
        id: '2',
        type: 'candidate',
        title: 'John Doe - High Potential Candidate',
        description: 'Candidate shows strong technical skills and cultural fit for senior role',
        confidence: 0.88,
        priority: 'high',
        data: {
          candidate_id: 'candidate-1',
          overall_score: 8.7,
          technical_score: 9.2,
          soft_skills_score: 8.1,
          experience_years: 5,
        },
        created_at: '2024-01-15T14:30:00Z',
        is_applied: true,
      },
      {
        id: '3',
        type: 'skill_gap',
        title: 'Cloud Architecture Skills Gap Identified',
        description: 'Team shows significant gap in cloud architecture skills, training recommended',
        confidence: 0.85,
        priority: 'medium',
        data: {
          skill_name: 'Cloud Architecture',
          current_level: 4.2,
          required_level: 7.5,
          affected_candidates: 8,
          training_program: 'AWS Certification Path',
        },
        created_at: '2024-01-14T09:15:00Z',
        is_applied: false,
      },
    ],
    insights: [
      {
        id: '1',
        category: 'performance',
        title: 'Assessment Completion Rate Trend',
        description: 'Assessment completion rate has increased by 15% over the past month',
        metrics: {
          current_rate: 91.2,
          previous_rate: 79.3,
          improvement: 15.1,
        },
        recommendations: [
          'Continue current assessment design approach',
          'Focus on mobile optimization for further improvements',
        ],
        confidence: 0.94,
        created_at: '2024-01-16T08:00:00Z',
      },
      {
        id: '2',
        category: 'trend',
        title: 'Technical Skills Improvement Pattern',
        description: 'Candidates show consistent improvement in technical skills after targeted training',
        metrics: {
          improvement_rate: 23.5,
          training_effectiveness: 0.87,
          skill_retention: 0.92,
        },
        recommendations: [
          'Expand technical training programs',
          'Implement skill assessment before and after training',
        ],
        confidence: 0.89,
        created_at: '2024-01-15T16:45:00Z',
      },
    ],
    predictions: [
      {
        id: '1',
        prediction_type: 'candidate_success',
        target_id: 'candidate-1',
        target_name: 'John Doe',
        prediction: 0.87,
        confidence: 0.91,
        factors: [
          { factor: 'Technical Score', weight: 0.35, value: 9.2 },
          { factor: 'Experience', weight: 0.25, value: 8.5 },
          { factor: 'Education', weight: 0.20, value: 8.0 },
          { factor: 'Soft Skills', weight: 0.20, value: 8.1 },
        ],
        created_at: '2024-01-16T11:30:00Z',
      },
      {
        id: '2',
        prediction_type: 'assessment_difficulty',
        target_id: 'assessment-1',
        target_name: 'System Design Assessment',
        prediction: 7.8,
        confidence: 0.86,
        factors: [
          { factor: 'Question Complexity', weight: 0.40, value: 8.5 },
          { factor: 'Time Required', weight: 0.30, value: 7.2 },
          { factor: 'Success Rate', weight: 0.30, value: 7.8 },
        ],
        created_at: '2024-01-15T13:15:00Z',
      },
    ],
    statistics: {
      total_recommendations: 156,
      applied_recommendations: 89,
      average_confidence: 0.87,
      accuracy_rate: 0.91,
      model_performance: {
        precision: 0.89,
        recall: 0.87,
        f1_score: 0.88,
      },
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assessment': return <Assessment sx={{ fontSize: 16 }} />;
      case 'candidate': return <Person sx={{ fontSize: 16 }} />;
      case 'skill_gap': return <School sx={{ fontSize: 16 }} />;
      case 'improvement': return <TrendingUp sx={{ fontSize: 16 }} />;
      default: return <Lightbulb sx={{ fontSize: 16 }} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Speed sx={{ fontSize: 16 }} />;
      case 'trend': return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'prediction': return <Psychology sx={{ fontSize: 16 }} />;
      case 'anomaly': return <Lightbulb sx={{ fontSize: 16 }} />;
      default: return <Assessment sx={{ fontSize: 16 }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return '#4caf50';
    if (confidence >= 0.8) return '#8bc34a';
    if (confidence >= 0.7) return '#ff9800';
    if (confidence >= 0.6) return '#ff5722';
    return '#f44336';
  };

  const handleApplyRecommendation = async (recommendation: AIRecommendation) => {
    try {
      // Simulate applying recommendation
      setAiAnalytics(prev => ({
        ...prev!,
        recommendations: prev!.recommendations.map(r =>
          r.id === recommendation.id ? { ...r, is_applied: true } : r
        ),
        statistics: {
          ...prev!.statistics,
          applied_recommendations: prev!.statistics.applied_recommendations + 1,
        },
      }));

      toast.success('Recommendation applied successfully');
    } catch (error: any) {
      toast.error('Failed to apply recommendation', {
        description: error.message,
      });
    }
  };

  const handleViewDetails = (recommendation: AIRecommendation) => {
    setSelectedRecommendation(recommendation);
    setDetailsDialogOpen(true);
  };

  const handleRefreshAI = async () => {
    setLoading(true);
    await fetchAIAnalytics();
    toast.success('AI analytics refreshed successfully');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading AI analytics...</Typography>
      </Box>
    );
  }

  if (!aiAnalytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>No AI analytics data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          AI-Powered Assessment Recommendations
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefreshAI}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Refresh AI
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(20, 80, 140, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToy sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {aiAnalytics.statistics.total_recommendations}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {aiAnalytics.statistics.applied_recommendations}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Applied Recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {(aiAnalytics.statistics.average_confidence * 100).toFixed(0)}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Average Confidence
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(100, 20, 140, 0.5) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {(aiAnalytics.statistics.accuracy_rate * 100).toFixed(0)}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Accuracy Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Performance Metrics */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          AI Model Performance
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Precision
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {(aiAnalytics.statistics.model_performance.precision * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={aiAnalytics.statistics.model_performance.precision * 100}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50',
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Recall
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {(aiAnalytics.statistics.model_performance.recall * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={aiAnalytics.statistics.model_performance.recall * 100}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff9800',
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  F1 Score
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {(aiAnalytics.statistics.model_performance.f1_score * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={aiAnalytics.statistics.model_performance.f1_score * 100}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#9c27b0',
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Recommendations */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          AI Recommendations
        </Typography>
        <List>
          {aiAnalytics.recommendations.map((recommendation) => (
            <Box key={recommendation.id} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  {getTypeIcon(recommendation.type)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {recommendation.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {recommendation.description}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={recommendation.priority.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getPriorityColor(recommendation.priority),
                      color: 'white',
                      fontSize: '0.6rem',
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {(recommendation.confidence * 100).toFixed(0)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={recommendation.confidence * 100}
                      sx={{
                        width: 40,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getConfidenceColor(recommendation.confidence),
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {new Date(recommendation.created_at).toLocaleDateString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {recommendation.is_applied ? (
                    <Chip
                      label="Applied"
                      size="small"
                      sx={{
                        bgcolor: '#4caf50',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  ) : (
                    <>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(recommendation)}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleApplyRecommendation(recommendation)}
                        sx={{
                          borderColor: 'rgba(98,0,69,0.5)',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '0.7rem',
                        }}
                      >
                        Apply
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </List>
      </Paper>

      {/* AI Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              AI Insights
            </Typography>
            <List>
              {aiAnalytics.insights.map((insight) => (
                <Box key={insight.id} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getCategoryIcon(insight.category)}
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {insight.title}
                    </Typography>
                    <Chip
                      label={`${(insight.confidence * 100}%`}
                      size="small"
                      sx={{
                        bgcolor: getConfidenceColor(insight.confidence),
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    {insight.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(98,0,69,1)', mb: 1 }}>
                    Recommendations:
                  </Typography>
                  {insight.recommendations.map((rec, index) => (
                    <Typography key={index} variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1 }}>
                      • {rec}
                    </Typography>
                  ))}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              AI Predictions
            </Typography>
            <List>
              {aiAnalytics.predictions.map((prediction) => (
                <Box key={prediction.id} sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {prediction.target_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {prediction.prediction_type === 'candidate_success' 
                        ? `Success: ${(prediction.prediction * 100).toFixed(0)}%`
                        : `Score: ${prediction.prediction.toFixed(1)}`}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
                    {prediction.prediction_type.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Confidence:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={prediction.confidence * 100}
                      sx={{
                        width: 60,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getConfidenceColor(prediction.confidence),
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {(prediction.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Key Factors: {prediction.factors.slice(0, 2).map(f => f.factor).join(', ')}
                  </Typography>
                </Box>
              ))}
            </List>
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
          Recommendation Details - {selectedRecommendation?.title}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedRecommendation && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Recommendation Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Type:</strong> {selectedRecommendation.type}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Priority:</strong> {selectedRecommendation.priority}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Confidence:</strong> {(selectedRecommendation.confidence * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Status:</strong> {selectedRecommendation.is_applied ? 'Applied' : 'Pending'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Recommendation Data
                </Typography>
                <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                    {JSON.stringify(selectedRecommendation.data, null, 2)}
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
          {selectedRecommendation && !selectedRecommendation.is_applied && (
            <Button
              variant="contained"
              onClick={() => {
                handleApplyRecommendation(selectedRecommendation);
                setDetailsDialogOpen(false);
              }}
              sx={{
                bgcolor: 'rgba(98,0,69,0.8)',
                '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
              }}
            >
              Apply Recommendation
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
