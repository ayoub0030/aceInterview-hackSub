import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  IconButton,
  Menu,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  MoreVert,
  CompareArrows,
  Download,
} from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DesignAssessment } from '../../services/design.service';

interface Props {
  completed: DesignAssessment[];
  incomplete: DesignAssessment[];
  selectedAssessments?: string[];
  onSelectionChange?: (selected: string[]) => void;
}

export default function Assessments({ 
  completed, 
  incomplete, 
  selectedAssessments = [], 
  onSelectionChange = () => {} 
}: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'completed' | 'incomplete'>('completed');
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const total = (completed?.length ?? 0) + (incomplete?.length ?? 0);

  // Handle checkbox selection
  const handleSelectAssessment = (assessmentId: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedAssessments, assessmentId]
      : selectedAssessments.filter(id => id !== assessmentId);
    onSelectionChange(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? rows.map(r => r.id) : []);
  };

  // Filter and search logic
  const filteredRows = useMemo(() => {
    let rows = tab === 'completed' ? completed : incomplete;
    
    // Search filter
    if (searchTerm) {
      rows = rows.filter(row => 
        row.applicant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Score filter (only for completed assessments)
    if (tab === 'completed' && scoreFilter !== 'all') {
      rows = rows.filter(row => {
        const score = row.score || 0;
        switch (scoreFilter) {
          case 'excellent': return score >= 8;
          case 'good': return score >= 6 && score < 8;
          case 'average': return score >= 4 && score < 6;
          case 'poor': return score < 4;
          default: return true;
        }
      });
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      if (dateFilter !== 'all') {
        const dateField = tab === 'completed' ? 'ended_at' : 'created_at';
        rows = rows.filter(row => {
          const rowDate = new Date(row[dateField as keyof DesignAssessment] as string);
          return rowDate >= filterDate;
        });
      }
    }
    
    return rows;
  }, [tab, completed, incomplete, searchTerm, scoreFilter, dateFilter]);

  const rows = filteredRows;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        background: 'rgba(20,20,25,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(98,0,69,0.3)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(98,0,69,0.2)',
      }}
    >
      {/* Header with Search and Filters */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2.5,
          flexWrap: 'wrap',
          width: '100%',
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Typography
            variant="h4"
            noWrap
            sx={{
              color: 'white',
              fontWeight: 600,
              letterSpacing: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Assessments
            <Typography
              component="span"
              sx={{ ml: 2, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}
            >
              {total} total ({rows.length} filtered)
            </Typography>
          </Typography>
        </Box>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search by email or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                  sx={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255,255,255,0.05)',
              color: 'white',
              '& fieldset': { borderColor: 'rgba(98,0,69,0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(98,0,69,0.5)' },
              '&.Mui-focused fieldset': { borderColor: 'rgba(98,0,69,0.8)' },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255,255,255,0.5)',
            },
          }}
        />

        {/* Score Filter */}
        {tab === 'completed' && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Score</InputLabel>
            <Select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              label="Score"
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.8)' },
                '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
              }}
            >
              <MenuItem value="all">All Scores</MenuItem>
              <MenuItem value="excellent">Excellent (8+)</MenuItem>
              <MenuItem value="good">Good (6-7)</MenuItem>
              <MenuItem value="average">Average (4-5)</MenuItem>
              <MenuItem value="poor">Poor (<4)</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Date Filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Date</InputLabel>
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            label="Date"
            sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.5)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.8)' },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
            }}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
          </Select>
        </FormControl>

        {/* Clear Filters */}
        {(searchTerm || scoreFilter !== 'all' || dateFilter !== 'all') && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchTerm('');
              setScoreFilter('all');
              setDateFilter('all');
            }}
            sx={{
              borderColor: 'rgba(98,0,69,0.5)',
              color: 'rgba(255,255,255,0.8)',
              '&:hover': {
                borderColor: 'rgba(98,0,69,0.8)',
                bgcolor: 'rgba(98,0,69,0.1)',
              },
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_: any, v: string) => setTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ sx: { backgroundColor: 'rgba(98,0,69,1)' } }}
          sx={{
            minHeight: 40,
            '.MuiTab-root': {
              minHeight: 40,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              '&.Mui-selected': { color: 'white' },
            },
          }}
        >
          <Tab value="completed" label={`Completed (${completed.length})`} />
          <Tab value="incomplete" label={`Incomplete (${incomplete.length})`} />
        </Tabs>

      {/* Table wrapper */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(98,0,69,0.3)',
        }}
      >
        <TableContainer
          sx={{
            maxHeight: 520,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(98,0,69,0.5)',
              borderRadius: 8,
              '&:hover': { background: 'rgba(98,0,69,0.7)' },
            },
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thSx}>Applicant Email</TableCell>

                {tab === 'completed' ? (
                  <>
                    <TableCell sx={thSx} align="left">Ended At</TableCell>
                    <TableCell sx={thSx} align="left">Score</TableCell>
                    <TableCell sx={thSx} align="right">Actions</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={thSx} align="left">Expires At</TableCell>
                    <TableCell sx={thSx} align="right">Status</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((a) => (
                <TableRow
                  key={a.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: 'rgba(98,0,69,0.10)' },
                    transition: 'background 0.2s ease',
                    height: 56,
                  }}
                >
                  <TableCell sx={tdSx}>{a.applicant_email}</TableCell>

                  {tab === 'completed' ? (
                    <>
                      <TableCell sx={{ ...tdSx, color: 'rgba(255,255,255,0.8)' }}>
                        {formatDate(a.ended_at)}
                      </TableCell>

                      <TableCell sx={tdSx}>
                        {a.score !== undefined ? (
                          <Chip
                            label={a.score}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: 'rgba(98,0,69,0.9)',
                              color: 'white',
                              border: '1px solid rgba(98,0,69,1)',
                            }}
                          />
                        ) : (
                          <Typography sx={{ color: 'rgba(255,255,255,0.65)' }}>N/A</Typography>
                        )}
                      </TableCell>

                      <TableCell sx={tdSx} align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/admin/results/${a.id}`)}
                          sx={{
                            bgcolor: 'rgba(98,0,69,0.95)',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            '&:hover': {
                              bgcolor: 'rgba(98,0,69,1)',
                              transform: 'translateY(-1px)',
                            },
                          }}
                        >
                          View Results
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ ...tdSx, color: 'rgba(255,255,255,0.8)' }}>
                        {formatDate(a.expires_at)}
                      </TableCell>

                      <TableCell sx={tdSx} align="right">
                        <Chip
                          label="Pending"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: 'rgba(255,152,0,0.25)',
                            color: '#ffb74d',
                            border: '1px solid rgba(255,152,0,0.35)',
                          }}
                        />
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}

              {!rows.length && (
                <TableRow>
                  <TableCell
                    colSpan={tab === 'completed' ? 4 : 3}
                    sx={{
                      py: 8,
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {tab === 'completed'
                      ? 'No completed assessments.'
                      : 'No incomplete assessments.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}

/* ---------- Helpers & shared styles ---------- */

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}

const thSx = {
  position: 'sticky' as const,
  top: 0,
  zIndex: 1,
  bgcolor: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(12px)',
  color: 'rgba(255,255,255,0.85)',
  fontWeight: 700,
  borderBottom: '1px solid rgba(98,0,69,0.35)',
};

const tdSx = {
  color: 'white',
  borderBottom: '1px solid rgba(98,0,69,0.2)',
};
