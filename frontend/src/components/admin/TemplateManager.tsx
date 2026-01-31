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
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Copy,
  Visibility,
  Save,
  Cancel,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'system-design' | 'coding' | 'behavioral' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  problem_ids: string[];
  settings: {
    allowRetake: boolean;
    showResults: boolean;
    randomizeQuestions: boolean;
    timeLimit: boolean;
    proctoringEnabled: boolean;
  };
  created_at: string;
  updated_at: string;
  usage_count: number;
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AssessmentTemplate | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Partial<AssessmentTemplate>>({
    name: '',
    description: '',
    type: 'system-design',
    difficulty: 'medium',
    duration: 60,
    problem_ids: [],
    settings: {
      allowRetake: false,
      showResults: true,
      randomizeQuestions: false,
      timeLimit: true,
      proctoringEnabled: true,
    },
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Use mock data for demo
      setTemplates(getMockTemplates());
    } finally {
      setLoading(false);
    }
  };

  const getMockTemplates = (): AssessmentTemplate[] => [
    {
      id: '1',
      name: 'Senior System Design',
      description: 'Comprehensive system design assessment for senior engineers',
      type: 'system-design',
      difficulty: 'hard',
      duration: 90,
      problem_ids: ['prob-1', 'prob-2'],
      settings: {
        allowRetake: false,
        showResults: true,
        randomizeQuestions: false,
        timeLimit: true,
        proctoringEnabled: true,
      },
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      usage_count: 25,
    },
    {
      id: '2',
      name: 'Full Stack Coding Challenge',
      description: 'Mixed coding assessment covering frontend and backend',
      type: 'coding',
      difficulty: 'medium',
      duration: 60,
      problem_ids: ['prob-3', 'prob-4', 'prob-5'],
      settings: {
        allowRetake: true,
        showResults: false,
        randomizeQuestions: true,
        timeLimit: true,
        proctoringEnabled: false,
      },
      created_at: '2024-01-10T14:30:00Z',
      updated_at: '2024-01-12T09:15:00Z',
      usage_count: 18,
    },
  ];

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      type: 'system-design',
      difficulty: 'medium',
      duration: 60,
      problem_ids: [],
      settings: {
        allowRetake: false,
        showResults: true,
        randomizeQuestions: false,
        timeLimit: true,
        proctoringEnabled: true,
      },
    });
    setDialogOpen(true);
  };

  const handleEditTemplate = (template: AssessmentTemplate) => {
    setEditingTemplate(template);
    setFormData(template);
    setDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (!formData.name || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      const templateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('assessment_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        // Create new template
        const { error } = await supabase
          .from('assessment_templates')
          .insert({
            ...templateData,
            created_at: new Date().toISOString(),
            usage_count: 0,
          });

        if (error) throw error;
        toast.success('Template created successfully');
      }

      setDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      toast.error('Failed to save template', {
        description: error.message,
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('assessment_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error: any) {
      toast.error('Failed to delete template', {
        description: error.message,
      });
    }
  };

  const handleDuplicateTemplate = async (template: AssessmentTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        id: undefined,
        name: `${template.name} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
      };

      const { error } = await supabase
        .from('assessment_templates')
        .insert(duplicatedTemplate);

      if (error) throw error;
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error: any) {
      toast.error('Failed to duplicate template', {
        description: error.message,
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#757575';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system-design': return '#2196f3';
      case 'coding': return '#9c27b0';
      case 'behavioral': return '#00bcd4';
      case 'mixed': return '#607d8b';
      default: return '#757575';
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return template.type === 'system-design';
    if (activeTab === 2) return template.type === 'coding';
    if (activeTab === 3) return template.type === 'behavioral';
    if (activeTab === 4) return template.type === 'mixed';
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading templates...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTemplate}
          sx={{
            bgcolor: 'rgba(98, 0, 69, 0.8)',
            '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
          }}
        >
          Create Template
        </Button>
      </Box>

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
          <Tab label={`All (${templates.length})`} />
          <Tab label="System Design" />
          <Tab label="Coding" />
          <Tab label="Behavioral" />
          <Tab label="Mixed" />
        </Tabs>
      </Box>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card
              sx={{
                height: '100%',
                background: 'rgba(20, 20, 25, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {template.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditTemplate(template)}
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicateTemplate(template)}
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <Copy fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTemplate(template.id)}
                      sx={{ color: 'rgba(244,67,54,0.7)' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                  {template.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={template.type}
                    size="small"
                    sx={{
                      bgcolor: getTypeColor(template.type),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={template.difficulty}
                    size="small"
                    sx={{
                      bgcolor: getDifficultyColor(template.difficulty),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={`${template.duration} min`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(98,0,69,0.8)',
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Used {template.usage_count} times • Updated {new Date(template.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTemplates.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No templates found for the selected filter.
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
          {editingTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Type</InputLabel>
                <Select
                  value={formData.type || 'system-design'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  <MenuItem value="system-design">System Design</MenuItem>
                  <MenuItem value="coding">Coding</MenuItem>
                  <MenuItem value="behavioral">Behavioral</MenuItem>
                  <MenuItem value="mixed">Mixed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty || 'medium'}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Duration (minutes)"
                value={formData.duration || 60}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
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
            onClick={handleSaveTemplate}
            variant="contained"
            startIcon={<Save />}
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
