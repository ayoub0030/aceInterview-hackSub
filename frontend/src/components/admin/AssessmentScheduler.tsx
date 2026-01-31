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
  DateTimePicker,
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
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CalendarToday,
  AccessTime,
  Person,
  Email,
  Send,
  Cancel,
} from '@mui/icons-material';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ScheduledAssessment {
  id: string;
  candidate_email: string;
  candidate_name: string;
  template_id: string;
  template_name: string;
  scheduled_time: string;
  duration: number;
  timezone: string;
  reminder_sent: boolean;
  assessment_created: boolean;
  status: 'scheduled' | 'reminder_sent' | 'assessment_created' | 'completed' | 'cancelled';
  created_at: string;
  notes?: string;
}

export default function AssessmentScheduler() {
  const [schedules, setSchedules] = useState<ScheduledAssessment[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledAssessment | null>(null);
  const [formData, setFormData] = useState({
    candidate_email: '',
    candidate_name: '',
    template_id: '',
    scheduled_time: DateTime.now().toISO(),
    duration: 60,
    timezone: 'UTC',
    notes: '',
    send_reminder: true,
    reminder_hours: 24,
  });

  useEffect(() => {
    fetchSchedules();
    fetchTemplates();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_assessments')
        .select('*')
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules(getMockSchedules());
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_templates')
        .select('id, name, type, difficulty, duration')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(getMockTemplates());
    }
  };

  const getMockSchedules = (): ScheduledAssessment[] => [
    {
      id: '1',
      candidate_email: 'john.doe@example.com',
      candidate_name: 'John Doe',
      template_id: 'template-1',
      template_name: 'Senior System Design',
      scheduled_time: DateTime.now().plus({ days: 1 }).toISO(),
      duration: 90,
      timezone: 'UTC',
      reminder_sent: false,
      assessment_created: false,
      status: 'scheduled',
      created_at: DateTime.now().toISO(),
      notes: 'Experienced candidate, focus on scalability',
    },
    {
      id: '2',
      candidate_email: 'jane.smith@example.com',
      candidate_name: 'Jane Smith',
      template_id: 'template-2',
      template_name: 'Full Stack Coding',
      scheduled_time: DateTime.now().plus({ days: 2 }).toISO(),
      duration: 60,
      timezone: 'UTC',
      reminder_sent: true,
      assessment_created: true,
      status: 'assessment_created',
      created_at: DateTime.now().toISO(),
    },
  ];

  const getMockTemplates = () => [
    { id: 'template-1', name: 'Senior System Design', type: 'system-design', difficulty: 'hard', duration: 90 },
    { id: 'template-2', name: 'Full Stack Coding', type: 'coding', difficulty: 'medium', duration: 60 },
    { id: 'template-3', name: 'Behavioral Interview', type: 'behavioral', difficulty: 'easy', duration: 45 },
  ];

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      candidate_email: '',
      candidate_name: '',
      template_id: '',
      scheduled_time: DateTime.now().toISO(),
      duration: 60,
      timezone: 'UTC',
      notes: '',
      send_reminder: true,
      reminder_hours: 24,
    });
    setDialogOpen(true);
  };

  const handleEditSchedule = (schedule: ScheduledAssessment) => {
    setEditingSchedule(schedule);
    setFormData({
      candidate_email: schedule.candidate_email,
      candidate_name: schedule.candidate_name,
      template_id: schedule.template_id,
      scheduled_time: schedule.scheduled_time,
      duration: schedule.duration,
      timezone: schedule.timezone,
      notes: schedule.notes || '',
      send_reminder: true,
      reminder_hours: 24,
    });
    setDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    try {
      if (!formData.candidate_email || !formData.template_id || !formData.scheduled_time) {
        toast.error('Please fill in all required fields');
        return;
      }

      const scheduleData = {
        ...formData,
        template_name: templates.find(t => t.id === formData.template_id)?.name || 'Unknown',
        reminder_sent: false,
        assessment_created: false,
        status: 'scheduled' as const,
      };

      if (editingSchedule) {
        // Update existing schedule
        const { error } = await supabase
          .from('scheduled_assessments')
          .update(scheduleData)
          .eq('id', editingSchedule.id);

        if (error) throw error;
        toast.success('Schedule updated successfully');
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('scheduled_assessments')
          .insert({
            ...scheduleData,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success('Schedule created successfully');
      }

      setDialogOpen(false);
      fetchSchedules();
    } catch (error: any) {
      toast.error('Failed to save schedule', {
        description: error.message,
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled assessment?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_assessments')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error: any) {
      toast.error('Failed to delete schedule', {
        description: error.message,
      });
    }
  };

  const handleSendNow = async (schedule: ScheduledAssessment) => {
    try {
      // Create the assessment immediately
      const response = await fetch('/api/create-assessment-from-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: schedule.id,
          templateId: schedule.template_id,
          candidateEmail: schedule.candidate_email,
          candidateName: schedule.candidate_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }

      // Update schedule status
      await supabase
        .from('scheduled_assessments')
        .update({ 
          status: 'assessment_created',
          assessment_created: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id);

      toast.success('Assessment created successfully');
      fetchSchedules();
    } catch (error: any) {
      toast.error('Failed to create assessment', {
        description: error.message,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#2196f3';
      case 'reminder_sent': return '#ff9800';
      case 'assessment_created': return '#4caf50';
      case 'completed': return '#9c27b0';
      case 'cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'reminder_sent': return 'Reminder Sent';
      case 'assessment_created': return 'Assessment Created';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const upcomingSchedules = schedules.filter(s => 
    DateTime.fromISO(s.scheduled_time) > DateTime.now() && s.status !== 'cancelled'
  );

  const pastSchedules = schedules.filter(s => 
    DateTime.fromISO(s.scheduled_time) <= DateTime.now() || s.status === 'cancelled'
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading schedules...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Scheduler
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateSchedule}
          sx={{
            bgcolor: 'rgba(98, 0, 69, 0.8)',
            '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
          }}
        >
          Schedule Assessment
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
                {upcomingSchedules.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Upcoming
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
                {schedules.filter(s => s.status === 'reminder_sent').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Reminders Sent
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
                {schedules.filter(s => s.status === 'assessment_created').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Assessments Created
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
                {schedules.filter(s => s.status === 'completed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Schedules */}
      <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
        Upcoming Assessments
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4, background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Candidate</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Template</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Scheduled Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingSchedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <Box>
                    <Typography variant="body2">{schedule.candidate_name}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {schedule.candidate_email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {schedule.template_name}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    {DateTime.fromISO(schedule.scheduled_time).toLocaleString()}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" />
                    {schedule.duration} min
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(schedule.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(schedule.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditSchedule(schedule)}
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleSendNow(schedule)}
                      sx={{ color: 'rgba(76,175,80,0.7)' }}
                    >
                      <Send fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      sx={{ color: 'rgba(244,67,54,0.7)' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Past Schedules */}
      <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
        Past Assessments
      </Typography>
      
      <TableContainer component={Paper} sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Candidate</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Template</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Scheduled Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pastSchedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <Box>
                    <Typography variant="body2">{schedule.candidate_name}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {schedule.candidate_email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {schedule.template_name}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {DateTime.fromISO(schedule.scheduled_time).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(schedule.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(schedule.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {schedule.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {schedules.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No scheduled assessments found. Create your first schedule to get started!
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
          {editingSchedule ? 'Edit Schedule' : 'Schedule Assessment'}
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
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Template</InputLabel>
                <Select
                  value={formData.template_id}
                  onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} ({template.type}, {template.difficulty})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled Time"
                type="datetime-local"
                value={formData.scheduled_time ? new Date(formData.scheduled_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, scheduled_time: new Date(e.target.value).toISOString() })}
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
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            onClick={handleSaveSchedule}
            variant="contained"
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            {editingSchedule ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
