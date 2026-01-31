import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface CandidateResult {
  id: string;
  applicant_email: string;
  reliability: number;
  scalability: number;
  availability: number;
  communication: number;
  tradeoff_analysis: number;
  overall_score: number;
  completed_at: string;
}

export default function CandidateComparison() {
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(['', '']);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (selectedCandidates[0] && selectedCandidates[1]) {
      generateComparisonData();
    }
  }, [selectedCandidates]);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('design_assessments')
        .select(`
          applicant_email,
          design_assessment_results!inner (
            reliability,
            scalability,
            availability,
            communication,
            trade_off_analysis,
            overall_score,
            created_at
          ),
          ended_at,
          id
        `)
        .eq('completed', true)
        .order('ended_at', { ascending: false });

      if (error) throw error;

      const processedData: CandidateResult[] = (data || []).map((item: any) => ({
        id: item.id,
        applicant_email: item.applicant_email,
        reliability: item.design_assessment_results[0]?.reliability || 0,
        scalability: item.design_assessment_results[0]?.scalability || 0,
        availability: item.design_assessment_results[0]?.availability || 0,
        communication: item.design_assessment_results[0]?.communication || 0,
        tradeoff_analysis: item.design_assessment_results[0]?.trade_off_analysis || 0,
        overall_score: item.design_assessment_results[0]?.overall_score || 0,
        completed_at: item.ended_at,
      }));

      setCandidates(processedData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Use mock data for demo
      setCandidates(getMockCandidates());
    }
  };

  const getMockCandidates = (): CandidateResult[] => [
    {
      id: '1',
      applicant_email: 'alice@example.com',
      reliability: 8,
      scalability: 9,
      availability: 7,
      communication: 9,
      tradeoff_analysis: 8,
      overall_score: 8.2,
      completed_at: '2024-01-30T10:00:00Z',
    },
    {
      id: '2',
      applicant_email: 'bob@example.com',
      reliability: 7,
      scalability: 8,
      availability: 9,
      communication: 6,
      tradeoff_analysis: 7,
      overall_score: 7.4,
      completed_at: '2024-01-29T14:30:00Z',
    },
    {
      id: '3',
      applicant_email: 'charlie@example.com',
      reliability: 9,
      scalability: 7,
      availability: 8,
      communication: 8,
      tradeoff_analysis: 9,
      overall_score: 8.2,
      completed_at: '2024-01-28T09:15:00Z',
    },
  ];

  const generateComparisonData = () => {
    const candidate1 = candidates.find(c => c.id === selectedCandidates[0]);
    const candidate2 = candidates.find(c => c.id === selectedCandidates[1]);

    if (!candidate1 || !candidate2) return;

    const data = [
      {
        metric: 'Reliability',
        [candidate1.applicant_email]: candidate1.reliability,
        [candidate2.applicant_email]: candidate2.reliability,
      },
      {
        metric: 'Scalability',
        [candidate1.applicant_email]: candidate1.scalability,
        [candidate2.applicant_email]: candidate2.scalability,
      },
      {
        metric: 'Availability',
        [candidate1.applicant_email]: candidate1.availability,
        [candidate2.applicant_email]: candidate2.availability,
      },
      {
        metric: 'Communication',
        [candidate1.applicant_email]: candidate1.communication,
        [candidate2.applicant_email]: candidate2.communication,
      },
      {
        metric: 'Trade-off Analysis',
        [candidate1.applicant_email]: candidate1.tradeoff_analysis,
        [candidate2.applicant_email]: candidate2.tradeoff_analysis,
      },
    ];

    setComparisonData(data);
  };

  const handleCandidateChange = (index: number, value: string) => {
    const newSelected = [...selectedCandidates];
    newSelected[index] = value;
    setSelectedCandidates(newSelected);
  };

  const getCandidateDetails = (candidateId: string) => {
    return candidates.find(c => c.id === candidateId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4caf50';
    if (score >= 6) return '#ff9800';
    return '#f44336';
  };

  const getWinner = (metric: string) => {
    if (comparisonData.length === 0) return null;
    
    const dataPoint = comparisonData.find(d => d.metric === metric);
    if (!dataPoint) return null;

    const candidate1 = getCandidateDetails(selectedCandidates[0]);
    const candidate2 = getCandidateDetails(selectedCandidates[1]);

    if (!candidate1 || !candidate2) return null;

    const score1 = dataPoint[candidate1.applicant_email] || 0;
    const score2 = dataPoint[candidate2.applicant_email] || 0;

    if (score1 > score2) return candidate1.applicant_email;
    if (score2 > score1) return candidate2.applicant_email;
    return 'Tie';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 4, fontWeight: 600 }}>
        Candidate Comparison
      </Typography>

      {/* Candidate Selection */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Candidate 1</InputLabel>
          <Select
            value={selectedCandidates[0]}
            onChange={(e) => handleCandidateChange(0, e.target.value)}
            label="Candidate 1"
            sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
            }}
          >
            {candidates.map((candidate) => (
              <MenuItem key={candidate.id} value={candidate.id}>
                {candidate.applicant_email} (Score: {candidate.overall_score})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Candidate 2</InputLabel>
          <Select
            value={selectedCandidates[1]}
            onChange={(e) => handleCandidateChange(1, e.target.value)}
            label="Candidate 2"
            sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
            }}
          >
            {candidates.map((candidate) => (
              <MenuItem key={candidate.id} value={candidate.id}>
                {candidate.applicant_email} (Score: {candidate.overall_score})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedCandidates[0] && selectedCandidates[1] && selectedCandidates[0] !== selectedCandidates[1] ? (
        <Box>
          {/* Candidate Cards */}
          <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            {[0, 1].map((index) => {
              const candidate = getCandidateDetails(selectedCandidates[index]);
              if (!candidate) return null;

              return (
                <Card
                  key={index}
                  sx={{
                    flex: 1,
                    minWidth: 280,
                    background: 'linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(98, 0, 69, 0.3)',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                      Candidate {index + 1}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                      {candidate.applicant_email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      Completed: {new Date(candidate.completed_at).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h4" sx={{ color: getScoreColor(candidate.overall_score) }}>
                        {candidate.overall_score}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        /10
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/admin/results/${candidate.id}`)}
                      sx={{
                        mt: 2,
                        borderColor: 'rgba(98,0,69,0.5)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'rgba(98,0,69,0.8)',
                          bgcolor: 'rgba(98,0,69,0.1)',
                        },
                      }}
                    >
                      View Full Results
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Comparison Chart */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={comparisonData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.7)" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="rgba(255,255,255,0.5)" />
                {selectedCandidates.map((candidateId, index) => {
                  const candidate = getCandidateDetails(candidateId);
                  if (!candidate) return null;
                  
                  return (
                    <Radar
                      key={candidateId}
                      name={candidate.applicant_email}
                      dataKey={candidate.applicant_email}
                      stroke={index === 0 ? '#ff6b6b' : '#4ecdc4'}
                      fill={index === 0 ? '#ff6b6b' : '#4ecdc4'}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  );
                })}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Detailed Comparison Table */}
          <Paper
            sx={{
              p: 3,
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Detailed Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Metric</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      {getCandidateDetails(selectedCandidates[0])?.applicant_email}
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                      {getCandidateDetails(selectedCandidates[1])?.applicant_email}
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Winner</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { key: 'reliability', label: 'Reliability' },
                    { key: 'scalability', label: 'Scalability' },
                    { key: 'availability', label: 'Availability' },
                    { key: 'communication', label: 'Communication' },
                    { key: 'tradeoff_analysis', label: 'Trade-off Analysis' },
                    { key: 'overall_score', label: 'Overall Score' },
                  ].map((row) => {
                    const candidate1 = getCandidateDetails(selectedCandidates[0]);
                    const candidate2 = getCandidateDetails(selectedCandidates[1]);
                    const winner = getWinner(row.label);

                    return (
                      <TableRow key={row.key}>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          {row.label}
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          <Chip
                            label={candidate1?.[row.key as keyof CandidateResult] || 0}
                            size="small"
                            sx={{
                              bgcolor: getScoreColor(candidate1?.[row.key as keyof CandidateResult] as number || 0),
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          <Chip
                            label={candidate2?.[row.key as keyof CandidateResult] || 0}
                            size="small"
                            sx={{
                              bgcolor: getScoreColor(candidate2?.[row.key as keyof CandidateResult] as number || 0),
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          {winner === 'Tie' ? (
                            <Chip label="Tie" size="small" sx={{ bgcolor: '#757575', color: 'white' }} />
                          ) : (
                            <Chip
                              label={winner}
                              size="small"
                              sx={{
                                bgcolor: winner === candidate1?.applicant_email ? '#ff6b6b' : '#4ecdc4',
                                color: 'white',
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please select two different candidates to compare their performance.
        </Alert>
      )}
    </Box>
  );
}
