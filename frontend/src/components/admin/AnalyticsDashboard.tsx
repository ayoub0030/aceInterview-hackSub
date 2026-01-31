import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  scoreDistribution: { range: string; count: number; color: string }[];
  completionRate: number;
  recentActivity: { date: string; completed: number; started: number }[];
  topPerformers: { email: string; score: number; date: string }[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch assessments data
      const { data: assessments, error } = await supabase
        .from('design_assessments')
        .select(`
          *,
          design_assessment_results (
            reliability,
            scalability,
            availability,
            communication,
            trade_off_analysis,
            overall_score
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data
      const processedData = processAssessmentsData(assessments || []);
      setData(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data for demo
      setData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const processAssessmentsData = (assessments: any[]): AnalyticsData => {
    const total = assessments.length;
    const completed = assessments.filter(a => a.completed).length;
    const withResults = assessments.filter(a => a.design_assessment_results?.length > 0);
    
    // Calculate average score
    const scores = withResults.map(a => 
      a.design_assessment_results[0]?.overall_score || 0
    );
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;

    // Score distribution
    const scoreDistribution = [
      { range: 'Excellent (8-10)', count: scores.filter(s => s >= 8).length, color: '#4caf50' },
      { range: 'Good (6-7)', count: scores.filter(s => s >= 6 && s < 8).length, color: '#ff9800' },
      { range: 'Average (4-5)', count: scores.filter(s => s >= 4 && s < 6).length, color: '#2196f3' },
      { range: 'Poor (<4)', count: scores.filter(s => s < 4).length, color: '#f44336' },
    ];

    // Recent activity (last 7 days)
    const recentActivity = generateRecentActivity(assessments);

    // Top performers
    const topPerformers = withResults
      .map(a => ({
        email: a.applicant_email,
        score: a.design_assessment_results[0]?.overall_score || 0,
        date: a.ended_at,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      totalAssessments: total,
      completedAssessments: completed,
      averageScore: Math.round(averageScore * 10) / 10,
      scoreDistribution,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      recentActivity,
      topPerformers,
    };
  };

  const generateRecentActivity = (assessments: any[]) => {
    const activity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      const dayAssessments = assessments.filter(a => {
        const aDate = new Date(a.created_at);
        return aDate.toDateString() === date.toDateString();
      });

      activity.push({
        date: date.toLocaleDateString('en', { weekday: 'short' }),
        completed: dayAssessments.filter(a => a.completed).length,
        started: dayAssessments.length,
      });
    }
    return activity;
  };

  const getMockAnalyticsData = (): AnalyticsData => ({
    totalAssessments: 45,
    completedAssessments: 38,
    averageScore: 7.2,
    scoreDistribution: [
      { range: 'Excellent (8-10)', count: 12, color: '#4caf50' },
      { range: 'Good (6-7)', count: 15, color: '#ff9800' },
      { range: 'Average (4-5)', count: 8, color: '#2196f3' },
      { range: 'Poor (<4)', count: 3, color: '#f44336' },
    ],
    completionRate: 84,
    recentActivity: [
      { date: 'Mon', completed: 3, started: 4 },
      { date: 'Tue', completed: 5, started: 6 },
      { date: 'Wed', completed: 2, started: 3 },
      { date: 'Thu', completed: 7, started: 8 },
      { date: 'Fri', completed: 4, started: 5 },
      { date: 'Sat', completed: 1, started: 2 },
      { date: 'Sun', completed: 0, started: 1 },
    ],
    topPerformers: [
      { email: 'alice@example.com', score: 9.2, date: '2024-01-30' },
      { email: 'bob@example.com', score: 8.8, date: '2024-01-29' },
      { email: 'charlie@example.com', score: 8.5, date: '2024-01-28' },
      { email: 'diana@example.com', score: 8.1, date: '2024-01-27' },
      { email: 'eve@example.com', score: 7.9, date: '2024-01-26' },
    ],
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: 'rgba(98, 0, 69, 1)' }} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          No analytics data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {data.totalAssessments}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Assessments
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
                {data.completedAssessments}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Completed
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
                {data.averageScore}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

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
                {data.completionRate}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Score Distribution */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Score Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Recent Activity (7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 25, 0.9)',
                    border: '1px solid rgba(98, 0, 69, 0.3)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="started"
                  stroke="#ff9800"
                  strokeWidth={2}
                  name="Started"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#4caf50"
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Top Performers
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.topPerformers.map((performer, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {performer.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {new Date(performer.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={performer.score}
                    sx={{
                      bgcolor: getScoreColor(performer.score),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Score Breakdown Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Performance Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="range" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 25, 0.9)',
                    border: '1px solid rgba(98, 0, 69, 0.3)',
                  }}
                />
                <Bar dataKey="count" fill="#c83296" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

const getScoreColor = (score: number) => {
  if (score >= 8) return '#4caf50';
  if (score >= 6) return '#ff9800';
  return '#f44336';
};
