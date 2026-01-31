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
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send,
  Reply,
  Forward,
  AttachFile,
  Schedule,
  MarkEmailRead,
  MarkEmailUnread,
  Delete,
  Person,
  Email,
  Phone,
  Message,
  History,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  type: 'email' | 'sms' | 'in_app';
  subject: string;
  content: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_email: string;
  recipient_name: string;
  assessment_id?: string;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high';
  sent_at?: string;
  read_at?: string;
  attachments?: string[];
  thread_id?: string;
  created_at: string;
  updated_at: string;
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  category: 'assessment_invitation' | 'reminder' | 'follow_up' | 'rejection' | 'offer' | 'custom';
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assessment_status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'hired';
  last_contact?: string;
  communication_count: number;
}

export default function CandidateCommunicationCenter() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [formData, setFormData] = useState({
    type: 'email' as 'email' | 'sms' | 'in_app',
    recipient_email: '',
    recipient_name: '',
    subject: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assessment_id: '',
    template_id: '',
  });

  useEffect(() => {
    fetchMessages();
    fetchTemplates();
    fetchCandidates();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages(getMockMessages());
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(getMockTemplates());
    }
  };

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('name');

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates(getMockCandidates());
    }
  };

  const getMockMessages = (): Message[] => [
    {
      id: '1',
      type: 'email',
      subject: 'Assessment Invitation - Senior System Design Position',
      content: 'Dear John Doe, We are pleased to invite you to participate in our technical assessment for the Senior System Design position...',
      sender_id: 'user-1',
      sender_name: 'Sarah Johnson',
      recipient_id: 'candidate-1',
      recipient_email: 'john.doe@example.com',
      recipient_name: 'John Doe',
      assessment_id: 'assessment-1',
      status: 'delivered',
      priority: 'high',
      sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      thread_id: 'thread-1',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'email',
      subject: 'Assessment Reminder',
      content: 'Hi Jane Smith, This is a friendly reminder that your assessment is scheduled for tomorrow at 2:00 PM...',
      sender_id: 'user-2',
      sender_name: 'Mike Chen',
      recipient_id: 'candidate-2',
      recipient_email: 'jane.smith@example.com',
      recipient_name: 'Jane Smith',
      assessment_id: 'assessment-2',
      status: 'sent',
      priority: 'medium',
      sent_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      thread_id: 'thread-2',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getMockTemplates = (): CommunicationTemplate[] => [
    {
      id: '1',
      name: 'Assessment Invitation',
      type: 'email',
      subject: 'Assessment Invitation - {{position}}',
      content: 'Dear {{candidate_name}}, We are pleased to invite you to participate in our technical assessment for the {{position}} position...',
      variables: ['candidate_name', 'position', 'assessment_link', 'scheduled_time'],
      category: 'assessment_invitation',
      is_active: true,
      usage_count: 25,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Assessment Reminder',
      type: 'email',
      subject: 'Assessment Reminder',
      content: 'Hi {{candidate_name}}, This is a friendly reminder that your assessment is scheduled for {{scheduled_time}}...',
      variables: ['candidate_name', 'scheduled_time', 'assessment_link'],
      category: 'reminder',
      is_active: true,
      usage_count: 18,
      created_at: new Date().toISOString(),
    },
  ];

  const getMockCandidates = (): Candidate[] => [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      assessment_status: 'completed',
      last_contact: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      communication_count: 3,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0124',
      assessment_status: 'in_progress',
      last_contact: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      communication_count: 2,
    },
  ];

  const handleComposeMessage = () => {
    setFormData({
      type: 'email',
      recipient_email: '',
      recipient_name: '',
      subject: '',
      content: '',
      priority: 'medium',
      assessment_id: '',
      template_id: '',
    });
    setComposeDialogOpen(true);
  };

  const handleSendMessage = async () => {
    try {
      if (!formData.recipient_email || !formData.content) {
        toast.error('Please fill in all required fields');
        return;
      }

      const messageData = {
        ...formData,
        sender_id: 'current-user',
        sender_name: 'Current User',
        status: 'sent',
        sent_at: new Date().toISOString(),
        thread_id: crypto.randomUUID(),
      };

      const { error } = await supabase
        .from('communications')
        .insert({
          ...messageData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Message sent successfully');
      setComposeDialogOpen(false);
      fetchMessages();
    } catch (error: any) {
      toast.error('Failed to send message', {
        description: error.message,
      });
    }
  };

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject || '',
        content: template.content,
        template_id: templateId,
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('communications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error: any) {
      toast.error('Failed to mark as read', {
        description: error.message,
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('communications')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (error: any) {
      toast.error('Failed to delete message', {
        description: error.message,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#9e9e9e';
      case 'sent': return '#2196f3';
      case 'delivered': return '#4caf50';
      case 'read': return '#ff9800';
      case 'failed': return '#f44336';
      default: return '#757575';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Email fontSize="small" />;
      case 'sms': return <Phone fontSize="small" />;
      case 'in_app': return <Message fontSize="small" />;
      default: return <Email fontSize="small" />;
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

  const filteredMessages = messages.filter(message => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return message.status === 'sent';
    if (activeTab === 2) return message.status === 'delivered';
    if (activeTab === 3) return message.status === 'read';
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading communication center...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Candidate Communication Center
        </Typography>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleComposeMessage}
          sx={{
            bgcolor: 'rgba(98, 0, 69, 0.8)',
            '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
          }}
        >
          Compose Message
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
                {messages.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Messages
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
                {messages.filter(m => m.status === 'delivered').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Delivered
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
                {messages.filter(m => m.status === 'read').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Read
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
                {candidates.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Active Candidates
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
          <Tab label={`All (${messages.length})`} />
          <Tab label={`Sent (${messages.filter(m => m.status === 'sent').length})`} />
          <Tab label={`Delivered (${messages.filter(m => m.status === 'delivered').length})`} />
          <Tab label={`Read (${messages.filter(m => m.status === 'read').length})`} />
        </Tabs>
      </Box>

      {/* Messages List */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
        <List>
          {filteredMessages.map((message) => (
            <Box key={message.id}>
              <ListItem sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'rgba(98,0,69,0.8)', width: 40, height: 40 }}>
                    {getTypeIcon(message.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        {message.subject}
                      </Typography>
                      <Chip
                        label={message.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(message.status),
                          color: 'white',
                          fontSize: '0.6rem',
                        }}
                      />
                      <Chip
                        label={message.priority.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getPriorityColor(message.priority),
                          color: 'white',
                          fontSize: '0.6rem',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          To: {message.recipient_name} ({message.recipient_email})
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          From: {message.sender_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {new Date(message.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {message.content}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {message.status !== 'read' && (
                    <Tooltip title="Mark as Read">
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(message.id)}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <MarkEmailRead fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Reply">
                    <IconButton
                      size="small"
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <Reply fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Forward">
                    <IconButton
                      size="small"
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <Forward fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteMessage(message.id)}
                      sx={{ color: 'rgba(244,67,54,0.7)' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
              <Divider sx={{ borderColor: 'rgba(98,0,69,0.2)' }} />
            </Box>
          ))}
        </List>
      </Paper>

      {filteredMessages.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No messages found for the selected filter.
        </Alert>
      )}

      {/* Compose Dialog */}
      <Dialog
        open={composeDialogOpen}
        onClose={() => setComposeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Compose Message
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Message Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="in_app">In-App Message</MenuItem>
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
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Recipient Name"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
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
                label="Recipient Email"
                type="email"
                value={formData.recipient_email}
                onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
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

            {formData.type === 'email' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
            onClick={() => setComposeDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            startIcon={<Send />}
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
