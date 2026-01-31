import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
  Chip,
  Alert,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Star,
  Send,
  Visibility,
  Download,
  Email,
  Comment,
  Assessment,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface CandidateFeedback {
  id: string;
  assessment_id: string;
  candidate_email: string;
  candidate_name: string;
  overall_rating: number;
  technical_skills: number;
  communication: number;
  problem_solving: number;
  cultural_fit: number;
  strengths: string[];
  weaknesses: string[];
  comments: string;
  interviewer_name: string;
  interviewer_id: string;
  feedback_date: string;
  status: 'draft' | 'submitted' | 'shared';
  shared_with_candidate: boolean;
  recommendation: 'hire' | 'consider' | 'reject';
  next_steps: string;
  created_at: string;
  updated_at: string;
}

interface FeedbackTemplate {
  id: string;
  name: string;
  description: string;
  categories: {
    technical_skills: { weight: number; criteria: string[] };
    communication: { weight: number; criteria: string[] };
    problem_solving: { weight: number; criteria: string[] };
    cultural_fit: { weight: number; criteria: string[] };
  };
  default_comments: string[];
  created_at: string;
}

export default function CandidateFeedbackSystem() {
  const [feedbacks, setFeedbacks] = useState<CandidateFeedback[]>([]);
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<CandidateFeedback | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const [formData, setFormData] = useState({
    assessment_id: '',
    candidate_email: '',
    candidate_name: '',
    overall_rating: 3,
    technical_skills: 3,
    communication: 3,
    problem_solving: 3,
    cultural_fit: 3,
    strengths: [] as string[],
    weaknesses: [] as string[],
    comments: '',
    interviewer_name: '',
    recommendation: 'consider' as 'hire' | 'consider' | 'reject',
    next_steps: '',
  });

  useEffect(() => {
    fetchFeedbacks();
    fetchTemplates();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_feedback')
        .select('*')
        .order('feedback_date', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks(getMockFeedbacks());
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(getMockTemplates());
    }
  };

  const getMockFeedbacks = (): CandidateFeedback[] => [
    {
      id: '1',
      assessment_id: 'assessment-1',
      candidate_email: 'john.doe@example.com',
      candidate_name: 'John Doe',
      overall_rating: 4.5,
      technical_skills: 4,
      communication: 5,
      problem_solving: 4,
      cultural_fit: 5,
      strengths: ['Excellent communication skills', 'Strong problem-solving abilities', 'Great team player'],
      weaknesses: ['Limited experience with distributed systems', 'Could improve on system design'],
      comments: 'John performed exceptionally well in the technical interview. His communication skills are outstanding, and he demonstrates strong analytical thinking. He would be a great addition to the team.',
      interviewer_name: 'Sarah Johnson',
      interviewer_id: 'user-1',
      feedback_date: new Date().toISOString(),
      status: 'submitted',
      shared_with_candidate: false,
      recommendation: 'hire',
      next_steps: 'Schedule final interview with engineering lead',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      assessment_id: 'assessment-2',
      candidate_email: 'jane.smith@example.com',
      candidate_name: 'Jane Smith',
      overall_rating: 3.2,
      technical_skills: 3,
      communication: 4,
      problem_solving: 3,
      cultural_fit: 3,
      strengths: ['Good communication', 'Positive attitude', 'Quick learner'],
      weaknesses: ['Limited technical depth', 'Needs more practice with algorithms'],
      comments: 'Jane shows potential but needs more technical development. Her communication skills are good, but she struggled with some technical concepts.',
      interviewer_name: 'Mike Chen',
      interviewer_id: 'user-2',
      feedback_date: new Date().toISOString(),
      status: 'draft',
      shared_with_candidate: false,
      recommendation: 'consider',
      next_steps: 'Consider for junior position or provide technical training',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const getMockTemplates = (): FeedbackTemplate[] => [
    {
      id: '1',
      name: 'Senior Engineer Template',
      description: 'Comprehensive feedback for senior engineering positions',
      categories: {
        technical_skills: { weight: 0.4, criteria: ['System Design', 'Algorithm Knowledge', 'Code Quality', 'Architecture'] },
        communication: { weight: 0.2, criteria: ['Clarity', 'Listening', 'Presentation', 'Documentation'] },
        problem_solving: { weight: 0.3, criteria: ['Analytical Thinking', 'Creativity', 'Efficiency', 'Debugging'] },
        cultural_fit: { weight: 0.1, criteria: ['Teamwork', 'Leadership', 'Values Alignment', 'Adaptability'] },
      },
      default_comments: ['Strong technical foundation', 'Excellent problem solver', 'Great communicator'],
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Junior Engineer Template',
      description: 'Feedback template focused on growth potential for junior roles',
      categories: {
        technical_skills: { weight: 0.3, criteria: ['Basic Programming', 'Data Structures', 'Learning Ability'] },
        communication: { weight: 0.3, criteria: ['Clarity', 'Team Collaboration', 'Willingness to Learn'] },
        problem_solving: { weight: 0.3, criteria: ['Basic Logic', 'Approach Method', 'Debugging Skills'] },
        cultural_fit: { weight: 0.1, criteria: ['Team Fit', 'Enthusiasm', 'Growth Mindset'] },
      },
      default_comments: ['Shows potential', 'Eager to learn', 'Good foundation'],
      created_at: new Date().toISOString(),
    },
  ];

  const handleCreateFeedback = () => {
    setEditingFeedback(null);
    setFormData({
      assessment_id: '',
      candidate_email: '',
      candidate_name: '',
      overall_rating: 3,
      technical_skills: 3,
      communication: 3,
      problem_solving: 3,
      cultural_fit: 3,
      strengths: [],
      weaknesses: [],
      comments: '',
      interviewer_name: '',
      recommendation: 'consider',
      next_steps: '',
    });
    setDialogOpen(true);
  };

  const handleEditFeedback = (feedback: CandidateFeedback) => {
    setEditingFeedback(feedback);
    setFormData({
      assessment_id: feedback.assessment_id,
      candidate_email: feedback.candidate_email,
      candidate_name: feedback.candidate_name,
      overall_rating: feedback.overall_rating,
      technical_skills: feedback.technical_skills,
      communication: feedback.communication,
      problem_solving: feedback.problem_solving,
      cultural_fit: feedback.cultural_fit,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
      comments: feedback.comments,
      interviewer_name: feedback.interviewer_name,
      recommendation: feedback.recommendation,
      next_steps: feedback.next_steps,
    });
    setDialogOpen(true);
  };

  const handleSaveFeedback = async () => {
    try {
      if (!formData.candidate_email || !formData.comments) {
        toast.error('Please fill in all required fields');
        return;
      }

      const feedbackData = {
        ...formData,
        feedback_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'draft' as const,
        shared_with_candidate: false,
      };

      if (editingFeedback) {
        // Update existing feedback
        const { error } = await supabase
          .from('candidate_feedback')
          .update(feedbackData)
          .eq('id', editingFeedback.id);

        if (error) throw error;
        toast.success('Feedback updated successfully');
      } else {
        // Create new feedback
        const { error } = await supabase
          .from('candidate_feedback')
          .insert({
            ...feedbackData,
            created_at: new Date().toISOString(),
            id: crypto.randomUUID(),
          });

        if (error) throw error;
        toast.success('Feedback created successfully');
      }

      setDialogOpen(false);
      fetchFeedbacks();
    } catch (error: any) {
      toast.error('Failed to save feedback', {
        description: error.message,
      });
    }
  };

  const handleSubmitFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('candidate_feedback')
        .update({ 
          status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', feedbackId);

      if (error) throw error;
      toast.success('Feedback submitted successfully');
      fetchFeedbacks();
    } catch (error: any) {
      toast.error('Failed to submit feedback', {
        description: error.message,
      });
    }
  };

  const handleShareWithCandidate = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('candidate_feedback')
        .update({ 
          shared_with_candidate: true,
          status: 'shared',
          updated_at: new Date().toISOString()
        })
        .eq('id', feedbackId);

      if (error) throw error;
      toast.success('Feedback shared with candidate');
      fetchFeedbacks();
    } catch (error: any) {
      toast.error('Failed to share feedback', {
        description: error.message,
      });
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const { error } = await supabase
        .from('candidate_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
      toast.success('Feedback deleted successfully');
      fetchFeedbacks();
    } catch (error: any) {
      toast.error('Failed to delete feedback', {
        description: error.message,
      });
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'hire': return '#4caf50';
      case 'consider': return '#ff9800';
      case 'reject': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#9e9e9e';
      case 'submitted': return '#2196f3';
      case 'shared': return '#4caf50';
      default: return '#757575';
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return feedback.status === 'draft';
    if (activeTab === 2) return feedback.status === 'submitted';
    if (activeTab === 3) return feedback.status === 'shared';
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading feedback system...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Candidate Feedback System
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateFeedback}
          sx={{
            bgcolor: 'rgba(98, 0, 69, 0.8)',
            '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
          }}
        >
          Create Feedback
        </Button>
      </Box>

      {/* Summary Cards */}
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
                {feedbacks.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Feedback
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
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {feedbacks.filter(f => f.status === 'draft').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Draft
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
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {feedbacks.filter(f => f.status === 'submitted').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Submitted
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
                {feedbacks.filter(f => f.recommendation === 'hire').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Hire Recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(98,0,69,0.3)', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          textColor="inherit"
          TabIndicatorProps={{ sx: { backgroundColor: 'rgba(98,0,69,1)' } }}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': { color: 'white' },
            },
          }}
        >
          <Tab label={`All (${feedbacks.length})`} />
          <Tab label={`Draft (${feedbacks.filter(f => f.status === 'draft').length})`} />
          <Tab label={`Submitted (${feedbacks.filter(f => f.status === 'submitted').length})`} />
          <Tab label={`Shared (${feedbacks.filter(f => f.status === 'shared').length})`} />
        </Tabs>
      </Box>

      {/* Feedback Table */}
      <TableContainer component={Paper} sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Candidate</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Overall Rating</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Interviewer</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Recommendation</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <Box>
                    <Typography variant="body2">{feedback.candidate_name}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {feedback.candidate_email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={feedback.overall_rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2">{feedback.overall_rating.toFixed(1)}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {feedback.interviewer_name}
                </TableCell>
                <TableCell>
                  <Chip
                    label={feedback.recommendation.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getRecommendationColor(feedback.recommendation),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={feedback.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(feedback.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {new Date(feedback.feedback_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleEditFeedback(feedback)}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {feedback.status === 'draft' && (
                      <Tooltip title="Submit Feedback">
                        <IconButton
                          size="small"
                          onClick={() => handleSubmitFeedback(feedback.id)}
                          sx={{ color: 'rgba(76,175,80,0.7)' }}
                        >
                          <Send fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {feedback.status === 'submitted' && !feedback.shared_with_candidate && (
                      <Tooltip title="Share with Candidate">
                        <IconButton
                          size="small"
                          onClick={() => handleShareWithCandidate(feedback.id)}
                          sx={{ color: 'rgba(33,150,243,0.7)' }}
                        >
                          <Email fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteFeedback(feedback.id)}
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

      {filteredFeedbacks.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No feedback found for the selected filter.
        </Alert>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          {editingFeedback ? 'Edit Feedback' : 'Create Feedback'}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Candidate Name"
                value={formData.candidate_name}
                onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(98,0,69,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(98,0,69,0.5)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Candidate Email"
                type="email"
                value={formData.candidate_email}
                onChange={(e) => setFormData({ ...formData, candidate_email: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(98,0,69,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(98,0,69,0.5)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Interviewer Name"
                value={formData.interviewer_name}
                onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(98,0,69,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(98,0,69,0.5)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Recommendation</InputLabel>
                <Select
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value as any })}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  <MenuItem value="hire">Hire</MenuItem>
                  <MenuItem value="consider">Consider</MenuItem>
                  <MenuItem value="reject">Reject</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Rating Categories */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                Technical Skills
              </Typography>
              <Rating
                value={formData.technical_skills}
                onChange={(_, value) => setFormData({ ...formData, technical_skills: value || 0 })}
                sx={{ color: 'rgba(98,0,69,1)' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                Communication
              </Typography>
              <Rating
                value={formData.communication}
                onChange={(_, value) => setFormData({ ...formData, communication: value || 0 })}
                sx={{ color: 'rgba(98,0,69,1)' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                Problem Solving
              </Typography>
              <Rating
                value={formData.problem_solving}
                onChange={(_, value) => setFormData({ ...formData, problem_solving: value || 0 })}
                sx={{ color: 'rgba(98,0,69,1)' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                Cultural Fit
              </Typography>
              <Rating
                value={formData.cultural_fit}
                onChange={(_, value) => setFormData({ ...formData, cultural_fit: value || 0 })}
                sx={{ color: 'rgba(98,0,69,1)' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                Overall Rating
              </Typography>
              <Rating
                value={formData.overall_rating}
                onChange={(_, value) => setFormData({ ...formData, overall_rating: value || 0 })}
                size="large"
                sx={{ color: 'rgba(98,0,69,1)' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(98,0,69,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(98,0,69,0.5)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Next Steps"
                value={formData.next_steps}
                onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(98,0,69,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(98,0,69,0.5)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveFeedback}
            variant="contained"
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            {editingFeedback ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
