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
  Badge,
} from '@mui/material';
import {
  CalendarToday,
  Schedule,
  AccessTime,
  Person,
  Email,
  Assessment,
  CheckCircle,
  RadioButtonUnchecked,
  Cancel,
  Info,
  Warning,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'assessment' | 'interview' | 'follow_up' | 'deadline';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  candidate_name: string;
  candidate_email: string;
  assessment_type?: string;
  location?: string;
  description?: string;
  interviewer_name?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

interface DayEvents {
  date: Date;
  events: CalendarEvent[];
}

export default function AssessmentCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_calendar')
        .select('*')
        .order('start', { ascending: true });

      if (error) throw error;
      setEvents((data || []).map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })));
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const getMockEvents = (): CalendarEvent[] => [
    {
      id: '1',
      title: 'System Design Assessment - John Doe',
      start: new Date(2024, 0, 15, 14, 0),
      end: new Date(2024, 0, 15, 16, 0),
      type: 'assessment',
      status: 'scheduled',
      candidate_name: 'John Doe',
      candidate_email: 'john.doe@example.com',
      assessment_type: 'system-design',
      location: 'Virtual',
      description: 'Senior system design assessment',
      interviewer_name: 'Sarah Johnson',
      priority: 'high',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Follow-up Interview - Jane Smith',
      start: new Date(2024, 0, 16, 10, 0),
      end: new Date(2024, 0, 16, 11, 0),
      type: 'interview',
      status: 'scheduled',
      candidate_name: 'Jane Smith',
      candidate_email: 'jane.smith@example.com',
      location: 'Conference Room A',
      description: 'Technical follow-up interview',
      interviewer_name: 'Mike Chen',
      priority: 'medium',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Coding Assessment - Bob Wilson',
      start: new Date(2024, 0, 17, 15, 0),
      end: new Date(2024, 0, 17, 17, 0),
      type: 'assessment',
      status: 'completed',
      candidate_name: 'Bob Wilson',
      candidate_email: 'bob.wilson@example.com',
      assessment_type: 'coding',
      location: 'Virtual',
      description: 'Full-stack coding challenge',
      interviewer_name: 'Alex Davis',
      priority: 'medium',
      created_at: new Date().toISOString(),
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'assessment': return '#2196f3';
      case 'interview': return '#4caf50';
      case 'follow_up': return '#ff9800';
      case 'deadline': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />;
      case 'in_progress': return <AccessTime sx={{ fontSize: 16, color: '#ff9800' }} />;
      case 'cancelled': return <Cancel sx={{ fontSize: 16, color: '#f44336' }} />;
      default: return <RadioButtonUnchecked sx={{ fontSize: 16, color: '#9e9e9e' }} />;
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getWeekDays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const getMonthYearString = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const getEventsCountForDate = (date: Date) => {
    return getEventsForDate(date).length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading calendar...</Typography>
      </Box>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Calendar
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handlePrevMonth}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
              '&:hover': {
                borderColor: 'rgba(98,0,69,0.8)',
                bgcolor: 'rgba(98,0,69,0.1)',
              },
            }}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            onClick={handleToday}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
              '&:hover': {
                borderColor: 'rgba(98,0,69,0.8)',
                bgcolor: 'rgba(98,0,69,0.1)',
              },
            }}
          >
            Today
          </Button>
          <Button
            variant="outlined"
            onClick={handleNextMonth}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.9)',
              '&:hover': {
                borderColor: 'rgba(98,0,69,0.8)',
                bgcolor: 'rgba(98,0,69,0.1)',
              },
            }}
          >
            Next
          </Button>
        </Box>
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
                {events.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Events
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
                {events.filter(e => e.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Scheduled
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
                {events.filter(e => e.status === 'in_progress').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                In Progress
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
                {events.filter(e => e.status === 'completed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendar Header */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
          {getMonthYearString()}
        </Typography>
      </Paper>

      {/* Calendar Grid */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2 }}>
        {/* Weekday Headers */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {getWeekDays().map(day => (
            <Grid item xs={12/7} key={day}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontWeight: 600 }}>
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Days */}
        <Grid container spacing={1}>
          {days.map((date, index) => (
            <Grid item xs={12/7} key={index}>
              <Box
                sx={{
                  minHeight: 100,
                  border: date ? '1px solid rgba(98,0,69,0.2)' : '1px solid transparent',
                  borderRadius: 1,
                  p: 1,
                  bgcolor: date && isToday(date) ? 'rgba(98,0,69,0.1)' : 'rgba(255,255,255,0.02)',
                  cursor: date ? 'pointer' : 'default',
                  '&:hover': date ? { bgcolor: 'rgba(98,0,69,0.2)' : {},
                }}
                onClick={() => date && handleDateClick(date)}
              >
                {date && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: isToday(date) ? 'white' : 'rgba(255,255,255,0.9)',
                          fontWeight: isToday(date) ? 600 : 400,
                        }}
                      >
                        {date.getDate()}
                      </Typography>
                      {getEventsCountForDate(date) > 0 && (
                        <Badge
                          badgeContent={getEventsCountForDate(date)}
                          color="primary"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.6rem',
                              height: 16,
                              minWidth: 16,
                            },
                          }}
                        />
                      )}
                    </Box>
                    
                    {/* Events for this day */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {getEventsForDate(date).slice(0, 3).map(event => (
                        <Box
                          key={event.id}
                          sx={{
                            p: 0.5,
                            borderRadius: 0.5,
                            bgcolor: getEventColor(event.type),
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.65rem', fontWeight: 500 }}>
                            {event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            {getStatusIcon(event.status)}
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.6rem' }}>
                              {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      {getEventsForDate(date).length > 3 && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem' }}>
                          +{getEventsForDate(date).length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Event Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Event Details
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  {selectedEvent.title}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Candidate
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {selectedEvent.candidate_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {selectedEvent.candidate_email}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Date & Time
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {selectedEvent.start.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Duration: {Math.round((selectedEvent.end.getTime() - selectedEvent.start.getTime()) / (1000 * 60))} minutes
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Type
                </Typography>
                <Chip
                  label={selectedEvent.type.replace('_', ' ').toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: getEventColor(selectedEvent.type),
                    color: 'white',
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(selectedEvent.status)}
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {selectedEvent.status.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>
              </Grid>

              {selectedEvent.location && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {selectedEvent.location}
                  </Typography>
                </Grid>
              )}

              {selectedEvent.interviewer_name && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Interviewer
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {selectedEvent.interviewer_name}
                  </Typography>
                </Grid>
              )}

              {selectedEvent.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {selectedEvent.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
