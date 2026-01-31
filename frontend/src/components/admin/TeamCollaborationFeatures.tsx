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
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import {
  Group,
  Person,
  Email,
  Phone,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  Add,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'interviewer' | 'reviewer';
  department: string;
  avatar_url?: string;
  is_active: boolean;
  joined_at: string;
  last_active: string;
  assessments_assigned: number;
  assessments_completed: number;
}

interface TeamActivity {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  target_type: 'assessment' | 'candidate' | 'report';
  target_id: string;
  target_name: string;
  timestamp: string;
  details: string;
}

interface CollaborationSpace {
  id: string;
  name: string;
  description: string;
  type: 'assessment_review' | 'candidate_evaluation' | 'report_analysis';
  members: string[];
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export default function TeamCollaborationFeatures() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [spaces, setSpaces] = useState<CollaborationSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const [membersRes, activitiesRes, spacesRes] = await Promise.all([
        supabase.from('team_members').select('*'),
        supabase.from('team_activities').select('*').order('timestamp', { ascending: false }),
        supabase.from('collaboration_spaces').select('*'),
      ]);

      if (membersRes.error) throw membersRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
      if (spacesRes.error) throw spacesRes.error;

      setTeamMembers(membersRes.data || []);
      setActivities(activitiesRes.data || []);
      setSpaces(spacesRes.data || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      const mockData = getMockTeamData();
      setTeamMembers(mockData.members);
      setActivities(mockData.activities);
      setSpaces(mockData.spaces);
    } finally {
      setLoading(false);
    }
  };

  const getMockTeamData = () => ({
    members: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        phone: '+1-555-0101',
        role: 'admin' as const,
        department: 'Engineering',
        is_active: true,
        joined_at: '2023-01-15T10:00:00Z',
        last_active: '2024-01-16T14:30:00Z',
        assessments_assigned: 45,
        assessments_completed: 42,
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@company.com',
        role: 'manager' as const,
        department: 'Engineering',
        is_active: true,
        joined_at: '2023-02-20T09:00:00Z',
        last_active: '2024-01-16T16:45:00Z',
        assessments_assigned: 38,
        assessments_completed: 35,
      },
    ],
    activities: [
      {
        id: '1',
        user_id: '1',
        user_name: 'Sarah Johnson',
        action: 'completed_assessment',
        target_type: 'assessment' as const,
        target_id: 'assessment-1',
        target_name: 'System Design Assessment',
        timestamp: '2024-01-16T14:30:00Z',
        details: 'Completed system design assessment for John Doe',
      },
    ],
    spaces: [
      {
        id: '1',
        name: 'Frontend Assessment Review',
        description: 'Collaborative space for reviewing frontend assessments',
        type: 'assessment_review' as const,
        members: ['1', '2'],
        created_by: '1',
        created_at: '2024-01-10T10:00:00Z',
        is_active: true,
      },
    ],
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#f44336';
      case 'manager': return '#ff9800';
      case 'interviewer': return '#2196f3';
      case 'reviewer': return '#4caf50';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading team collaboration features...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
        Team Collaboration Features
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(20, 80, 140, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {teamMembers.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Team Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {teamMembers.filter(m => m.is_active).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Active Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {spaces.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Collaboration Spaces
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(100, 20, 140, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {activities.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Recent Activities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Team Members Table */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Team Members
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Member</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assessments</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Last Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(98,0,69,0.8)', width: 40, height: 40 }}>
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {member.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.role.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: getRoleColor(member.role),
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {member.department}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {member.assessments_completed}/{member.assessments_assigned}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.is_active ? 'ACTIVE' : 'INACTIVE'}
                      size="small"
                      sx={{
                        bgcolor: member.is_active ? '#4caf50' : '#9e9e9e',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Typography variant="body2">
                      {new Date(member.last_active).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Activities */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Recent Team Activities
        </Typography>
        <List>
          {activities.slice(0, 10).map((activity) => (
            <ListItem key={activity.id} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 1 }}>
              <ListItemIcon>
                <Person sx={{ color: 'rgba(98,0,69,1)', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {activity.user_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {activity.details}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
