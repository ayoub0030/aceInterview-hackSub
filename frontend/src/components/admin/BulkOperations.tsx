import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Delete,
  Send,
  Download,
  Refresh,
  Email,
  Archive,
} from '@mui/icons-material';
import { toast } from 'sonner';
import type { DesignAssessment } from '../../services/design.service';

interface BulkOperationsProps {
  selectedAssessments: string[];
  assessments: DesignAssessment[];
  onSelectionChange: (selected: string[]) => void;
  onRefresh: () => void;
}

export default function BulkOperations({
  selectedAssessments,
  assessments,
  onSelectionChange,
  onRefresh,
}: BulkOperationsProps) {
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [operation, setOperation] = useState<'delete' | 'remind' | 'export' | 'archive' | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedAssessmentsData = assessments.filter(a => selectedAssessments.includes(a.id));
  const completedCount = selectedAssessmentsData.filter(a => a.completed).length;
  const incompleteCount = selectedAssessmentsData.length - completedCount;

  const handleBulkOperation = async (op: typeof operation) => {
    setOperation(op);
    setBulkDialogOpen(true);
  };

  const executeBulkOperation = async () => {
    if (!operation) return;

    setLoading(true);
    try {
      switch (operation) {
        case 'delete':
          await handleBulkDelete();
          break;
        case 'remind':
          await handleBulkRemind();
          break;
        case 'export':
          await handleBulkExport();
          break;
        case 'archive':
          await handleBulkArchive();
          break;
      }
      
      setBulkDialogOpen(false);
      onRefresh();
      onSelectionChange([]);
    } catch (error: any) {
      toast.error(`Bulk ${operation} failed`, {
        description: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
      setOperation(null);
      setConfirmDelete(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    const deletePromises = selectedAssessments.map(async (assessmentId) => {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete assessment ${assessmentId}`);
      }
      return response.json();
    });

    await Promise.all(deletePromises);
    
    toast.success(`Successfully deleted ${selectedAssessments.length} assessments`);
  };

  const handleBulkRemind = async () => {
    const incompleteAssessments = selectedAssessmentsData.filter(a => !a.completed);
    
    const remindPromises = incompleteAssessments.map(async (assessment) => {
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateEmail: assessment.applicant_email,
          assessmentId: assessment.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send reminder to ${assessment.applicant_email}`);
      }
      return response.json();
    });

    await Promise.all(remindPromises);
    
    toast.success(`Sent reminders to ${incompleteAssessments.length} candidates`);
  };

  const handleBulkExport = async () => {
    const exportData = selectedAssessmentsData.map(assessment => ({
      id: assessment.id,
      email: assessment.applicant_email,
      status: assessment.completed ? 'Completed' : 'Incomplete',
      score: assessment.score || 'N/A',
      created_at: assessment.created_at,
      completed_at: assessment.ended_at || 'N/A',
      expires_at: assessment.expires_at,
    }));

    // Create CSV content
    const headers = ['ID', 'Email', 'Status', 'Score', 'Created At', 'Completed At', 'Expires At'];
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => [
        row.id,
        row.email,
        row.status,
        row.score,
        new Date(row.created_at).toLocaleString(),
        row.completed_at,
        new Date(row.expires_at).toLocaleString(),
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessments_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedAssessments.length} assessments to CSV`);
  };

  const handleBulkArchive = async () => {
    const archivePromises = selectedAssessments.map(async (assessmentId) => {
      const response = await fetch(`/api/assessments/${assessmentId}/archive`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to archive assessment ${assessmentId}`);
      }
      return response.json();
    });

    await Promise.all(archivePromises);
    
    toast.success(`Archived ${selectedAssessments.length} assessments`);
  };

  const selectAll = () => {
    if (selectedAssessments.length === assessments.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(assessments.map(a => a.id));
    }
  };

  const getOperationIcon = (op: typeof operation) => {
    switch (op) {
      case 'delete': return <Delete />;
      case 'remind': return <Email />;
      case 'export': return <Download />;
      case 'archive': return <Archive />;
      default: return null;
    }
  };

  const getOperationDescription = () => {
    switch (operation) {
      case 'delete':
        return confirmDelete 
          ? '⚠️ This action cannot be undone. All selected assessments will be permanently deleted.'
          : 'Delete selected assessments and all associated data.';
      case 'remind':
        return `Send reminder emails to ${incompleteCount} candidates with incomplete assessments.`;
      case 'export':
        return `Export ${selectedAssessments.length} assessments to CSV file for analysis.`;
      case 'archive':
        return 'Archive selected assessments. They will be hidden from the main view but can be restored later.';
      default:
        return '';
    }
  };

  const getOperationColor = () => {
    switch (operation) {
      case 'delete': return '#f44336';
      case 'remind': return '#ff9800';
      case 'export': return '#4caf50';
      case 'archive': return '#2196f3';
      default: return '#620045';
    }
  };

  return (
    <Box>
      {/* Bulk Actions Bar */}
      {selectedAssessments.length > 0 && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            background: 'rgba(98, 0, 69, 0.1)',
            border: '1px solid rgba(98, 0, 69, 0.3)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedAssessments.length === assessments.length}
                indeterminate={selectedAssessments.length > 0 && selectedAssessments.length < assessments.length}
                onChange={selectAll}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              />
            }
            label={`Select All (${selectedAssessments.length}/${assessments.length})`}
            sx={{ color: 'rgba(255,255,255,0.9)', minWidth: 200 }}
          />

          <Chip
            label={`${completedCount} completed`}
            size="small"
            sx={{ bgcolor: '#4caf50', color: 'white' }}
          />
          <Chip
            label={`${incompleteCount} incomplete`}
            size="small"
            sx={{ bgcolor: '#ff9800', color: 'white' }}
          />

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {incompleteCount > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Email />}
                onClick={() => handleBulkOperation('remind')}
                sx={{
                  borderColor: 'rgba(255,152,0,0.5)',
                  color: 'rgba(255,152,0,0.9)',
                  '&:hover': {
                    borderColor: 'rgba(255,152,0,0.8)',
                    bgcolor: 'rgba(255,152,0,0.1)',
                  },
                }}
              >
                Remind ({incompleteCount})
              </Button>
            )}

            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={() => handleBulkOperation('export')}
              sx={{
                borderColor: 'rgba(76,175,80,0.5)',
                color: 'rgba(76,175,80,0.9)',
                '&:hover': {
                  borderColor: 'rgba(76,175,80,0.8)',
                  bgcolor: 'rgba(76,175,80,0.1)',
                },
              }}
            >
              Export
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<Archive />}
              onClick={() => handleBulkOperation('archive')}
              sx={{
                borderColor: 'rgba(33,150,243,0.5)',
                color: 'rgba(33,150,243,0.9)',
                '&:hover': {
                  borderColor: 'rgba(33,150,243,0.8)',
                  bgcolor: 'rgba(33,150,243,0.1)',
                },
              }}
            >
              Archive
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<Delete />}
              onClick={() => handleBulkOperation('delete')}
              sx={{
                borderColor: 'rgba(244,67,54,0.5)',
                color: 'rgba(244,67,54,0.9)',
                '&:hover': {
                  borderColor: 'rgba(244,67,54,0.8)',
                  bgcolor: 'rgba(244,67,54,0.1)',
                },
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      )}

      {/* Bulk Operation Dialog */}
      <Dialog
        open={bulkDialogOpen}
        onClose={() => {
          if (!loading) {
            setBulkDialogOpen(false);
            setOperation(null);
            setConfirmDelete(false);
          }
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getOperationIcon(operation)}
            <Typography variant="h6">
              Bulk {operation?.charAt(0).toUpperCase() + operation?.slice(1)} Operation
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)' }}>
          <Alert severity={operation === 'delete' ? 'warning' : 'info'} sx={{ mb: 2 }}>
            {getOperationDescription()}
          </Alert>

          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
            Selected assessments ({selectedAssessments.length}):
          </Typography>

          <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1 }}>
            {selectedAssessmentsData.map((assessment, index) => (
              <ListItem key={assessment.id} divider={index < selectedAssessmentsData.length - 1}>
                <ListItemIcon>
                  <Checkbox
                    checked
                    disabled
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={assessment.applicant_email}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {assessment.completed ? 'Completed' : 'Incomplete'}
                      </Typography>
                      {assessment.completed && (
                        <Chip
                          label={assessment.score || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: getScoreColor(assessment.score || 0),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{ color: 'white' }}
                  secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => {
              setBulkDialogOpen(false);
              setOperation(null);
              setConfirmDelete(false);
            }}
            disabled={loading}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={executeBulkOperation}
            disabled={loading}
            variant="contained"
            sx={{
              bgcolor: getOperationColor(),
              '&:hover': { bgcolor: getOperationColor(), opacity: 0.8 },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              `${operation?.charAt(0).toUpperCase() + operation?.slice(1)} ${selectedAssessments.length} Items`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const getScoreColor = (score: number) => {
  if (score >= 8) return '#4caf50';
  if (score >= 6) return '#ff9800';
  return '#f44336';
};
