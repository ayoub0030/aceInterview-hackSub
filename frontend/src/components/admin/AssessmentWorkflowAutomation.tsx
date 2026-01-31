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
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Schedule,
  AutoMode,
  Settings,
  Email,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: 'assessment_completed' | 'assessment_started' | 'assessment_expired' | 'candidate_hired' | 'candidate_rejected';
  conditions: {
    score_range?: { min: number; max: number };
    assessment_type?: string[];
    candidate_level?: string[];
    time_threshold?: number; // hours
  };
  actions: {
    send_email?: boolean;
    email_template?: string;
    create_follow_up?: boolean;
    assign_reviewer?: string;
    update_status?: string;
    notify_manager?: boolean;
    schedule_interview?: boolean;
  };
  is_active: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  execution_count: number;
  last_executed?: string;
}

interface WorkflowExecution {
  id: string;
  rule_id: string;
  rule_name: string;
  trigger_data: Record<string, any>;
  executed_at: string;
  status: 'success' | 'failed' | 'pending';
  result?: string;
  error?: string;
}

export default function AssessmentWorkflowAutomation() {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'assessment_completed' as WorkflowRule['trigger'],
    conditions: {
      score_range: { min: 0, max: 10 },
      assessment_type: [] as string[],
      candidate_level: [] as string[],
      time_threshold: 24,
    },
    actions: {
      send_email: false,
      email_template: '',
      create_follow_up: false,
      assign_reviewer: '',
      update_status: '',
      notify_manager: false,
      schedule_interview: false,
    },
    is_active: true,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    fetchRules();
    fetchExecutions();
  }, []);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      setRules(getMockRules());
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error fetching executions:', error);
      setExecutions(getMockExecutions());
    }
  };

  const getMockRules = (): WorkflowRule[] => [
    {
      id: '1',
      name: 'High Score Auto-Interview',
      description: 'Automatically schedule follow-up interview for candidates scoring 8+',
      trigger: 'assessment_completed',
      conditions: {
        score_range: { min: 8, max: 10 },
        assessment_type: ['system-design', 'coding'],
      },
      actions: {
        send_email: true,
        email_template: 'high_score_followup',
        create_follow_up: true,
        notify_manager: true,
        schedule_interview: true,
      },
      is_active: true,
      priority: 'high',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 15,
      last_executed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Failed Assessment Notification',
      description: 'Notify hiring manager when candidate scores below 4',
      trigger: 'assessment_completed',
      conditions: {
        score_range: { min: 0, max: 3.9 },
      },
      actions: {
        send_email: true,
        email_template: 'low_score_notification',
        notify_manager: true,
        update_status: 'rejected',
      },
      is_active: true,
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 8,
      last_executed: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Expired Assessment Reminder',
      description: 'Send reminder to candidates 24 hours before assessment expires',
      trigger: 'assessment_expired',
      conditions: {
        time_threshold: 24,
      },
      actions: {
        send_email: true,
        email_template: 'expiration_reminder',
      },
      is_active: false,
      priority: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
    },
  ];

  const getMockExecutions = (): WorkflowExecution[] => [
    {
      id: '1',
      rule_id: '1',
      rule_name: 'High Score Auto-Interview',
      trigger_data: {
        candidate_email: 'john.doe@example.com',
        score: 8.5,
        assessment_type: 'system-design',
      },
      executed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      result: 'Follow-up interview scheduled for 2024-01-25 14:00',
    },
    {
      id: '2',
      rule_id: '2',
      rule_name: 'Failed Assessment Notification',
      trigger_data: {
        candidate_email: 'jane.smith@example.com',
        score: 3.2,
        assessment_type: 'coding',
      },
      executed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      result: 'Manager notified and candidate status updated to rejected',
    },
  ];

  const handleCreateRule = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      trigger: 'assessment_completed',
      conditions: {
        score_range: { min: 0, max: 10 },
        assessment_type: [],
        candidate_level: [],
        time_threshold: 24,
      },
      actions: {
        send_email: false,
        email_template: '',
        create_follow_up: false,
        assign_reviewer: '',
        update_status: '',
        notify_manager: false,
        schedule_interview: false,
      },
      is_active: true,
      priority: 'medium',
    });
    setDialogOpen(true);
  };

  const handleEditRule = (rule: WorkflowRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      conditions: rule.conditions,
      actions: rule.actions,
      is_active: rule.is_active,
      priority: rule.priority,
    });
    setDialogOpen(true);
  };

  const handleSaveRule = async () => {
    try {
      if (!formData.name || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      const ruleData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('workflow_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;
        toast.success('Workflow rule updated successfully');
      } else {
        // Create new rule
        const { error } = await supabase
          .from('workflow_rules')
          .insert({
            ...ruleData,
            created_at: new Date().toISOString(),
            execution_count: 0,
          });

        if (error) throw error;
        toast.success('Workflow rule created successfully');
      }

      setDialogOpen(false);
      fetchRules();
    } catch (error: any) {
      toast.error('Failed to save workflow rule', {
        description: error.message,
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this workflow rule?')) return;

    try {
      const { error } = await supabase
        .from('workflow_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      toast.success('Workflow rule deleted successfully');
      fetchRules();
    } catch (error: any) {
      toast.error('Failed to delete workflow rule', {
        description: error.message,
      });
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('workflow_rules')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      if (error) throw error;
      toast.success(`Workflow rule ${isActive ? 'activated' : 'deactivated'}`);
      fetchRules();
    } catch (error: any) {
      toast.error('Failed to toggle workflow rule', {
        description: error.message,
      });
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'assessment_completed': return 'Assessment Completed';
      case 'assessment_started': return 'Assessment Started';
      case 'assessment_expired': return 'Assessment Expired';
      case 'candidate_hired': return 'Candidate Hired';
      case 'candidate_rejected': return 'Candidate Rejected';
      default: return trigger;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'failed': return <Warning sx={{ color: '#f44336' }} />;
      case 'pending': return <Info sx={{ color: '#ff9800' }} />;
      default: return <Info sx={{ color: '#757575' }} />;
    }
  };

  const activeRules = rules.filter(rule => rule.is_active);
  const inactiveRules = rules.filter(rule => !rule.is_active);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading workflow automation...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Workflow Automation
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateRule}
          sx={{
            bgcolor: 'rgba(98, 0, 69, 0.8)',
            '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
          }}
        >
          Create Workflow Rule
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                {activeRules.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Active Rules
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(180, 40, 40, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {executions.filter(e => e.status === 'success').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Successful Executions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.4) 0%, rgba(180, 100, 20, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {executions.filter(e => e.status === 'failed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Failed Executions
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
                {rules.reduce((sum, rule) => sum + rule.execution_count, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Executions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Workflow Rules */}
      <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
        Workflow Rules
      </Typography>

      <Grid container spacing={3}>
        {rules.map((rule) => (
          <Grid item xs={12} md={6} key={rule.id}>
            <Card
              sx={{
                height: '100%',
                background: 'rgba(20, 20, 25, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                opacity: rule.is_active ? 1 : 0.6,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      {rule.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      {rule.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.is_active}
                          onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                          size="small"
                        />
                      }
                      label=""
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleEditRule(rule)}
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRule(rule.id)}
                      sx={{ color: 'rgba(244,67,54,0.7)' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={getTriggerLabel(rule.trigger)}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(98,0,69,0.8)',
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={rule.priority.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getPriorityColor(rule.priority),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                  {rule.is_active && (
                    <Chip
                      icon={<PlayArrow fontSize="small" />}
                      label="ACTIVE"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(76,175,80,0.8)',
                        color: 'white',
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                    Actions:
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    {rule.actions.send_email && (
                      <ListItem sx={{ p: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Email fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Send email: ${rule.actions.email_template}`}
                          primaryTypographyProps={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.8)',
                          }}
                        />
                      </ListItem>
                    )}
                    {rule.actions.create_follow_up && (
                      <ListItem sx={{ p: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Add fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Create follow-up task"
                          primaryTypographyProps={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.8)',
                          }}
                        />
                      </ListItem>
                    )}
                    {rule.actions.notify_manager && (
                      <ListItem sx={{ p: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Info fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Notify manager"
                          primaryTypographyProps={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.8)',
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Executed {rule.execution_count} times
                    {rule.last_executed && ` • Last: ${new Date(rule.last_executed).toLocaleString()}`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Executions */}
      <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600, mt: 4 }}>
        Recent Executions
      </Typography>

      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
        <List>
          {executions.slice(0, 10).map((execution) => (
            <Box key={execution.id}>
              <ListItem sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  {getStatusIcon(execution.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {execution.rule_name}
                      </Typography>
                      <Chip
                        label={execution.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: execution.status === 'success' ? 'rgba(76,175,80,0.8)' : 
                                 execution.status === 'failed' ? 'rgba(244,67,54,0.8)' : 'rgba(255,152,0,0.8)',
                          color: 'white',
                          fontSize: '0.6rem',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {new Date(execution.executed_at).toLocaleString()}
                      </Typography>
                      {execution.result && (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                          {execution.result}
                        </Typography>
                      )}
                      {execution.error && (
                        <Typography variant="body2" sx={{ color: 'rgba(255,100,100,0.9)', mt: 0.5 }}>
                          Error: {execution.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              <Divider sx={{ borderColor: 'rgba(98,0,69,0.2)' }} />
            </Box>
          ))}
        </List>
      </Paper>

      {rules.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No workflow rules found. Create your first rule to automate assessment workflows.
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
          {editingRule ? 'Edit Workflow Rule' : 'Create Workflow Rule'}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Name"
                value={formData.name}
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={formData.description}
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
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Trigger Event</InputLabel>
                <Select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value as any })}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  <MenuItem value="assessment_completed">Assessment Completed</MenuItem>
                  <MenuItem value="assessment_started">Assessment Started</MenuItem>
                  <MenuItem value="assessment_expired">Assessment Expired</MenuItem>
                  <MenuItem value="candidate_hired">Candidate Hired</MenuItem>
                  <MenuItem value="candidate_rejected">Candidate Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
                sx={{ color: 'rgba(255,255,255,0.9)' }}
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
            onClick={handleSaveRule}
            variant="contained"
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            {editingRule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
