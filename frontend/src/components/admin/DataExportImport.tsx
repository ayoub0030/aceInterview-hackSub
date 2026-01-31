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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Upload,
  Download,
  FileUpload,
  CheckCircle,
  Error,
  Info,
  Refresh,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ExportImportData {
  assessments?: any[];
  templates?: any[];
  results?: any[];
  candidates?: any[];
}

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors?: string[];
  warnings?: string[];
}

export default function DataExportImport() {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'assessments' | 'templates' | 'results'>('all');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async () => {
    setExportDialogOpen(true);
    setExportProgress(0);
  };

  const executeExport = async () => {
    try {
      let data: ExportImportData = {};

      // Fetch data based on export type
      if (exportType === 'all' || exportType === 'assessments') {
        setExportProgress(25);
        const { data: assessments } = await supabase
          .from('design_assessments')
          .select('*');
        data.assessments = assessments || [];
      }

      if (exportType === 'all' || exportType === 'templates') {
        setExportProgress(50);
        const { data: templates } = await supabase
          .from('assessment_templates')
          .select('*');
        data.templates = templates || [];
      }

      if (exportType === 'all' || exportType === 'results') {
        setExportProgress(75);
        const { data: results } = await supabase
          .from('design_assessment_results')
          .select('*');
        data.results = results || [];
      }

      setExportProgress(90);

      // Create JSON file
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aceup_export_${exportType}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExportProgress(100);
      toast.success(`Export completed: ${Object.keys(data).length} data types exported`);
      
      setTimeout(() => {
        setExportDialogOpen(false);
        setExportProgress(0);
      }, 1000);
    } catch (error: any) {
      toast.error('Export failed', {
        description: error.message,
      });
      setExportDialogOpen(false);
      setExportProgress(0);
    }
  };

  const handleImport = () => {
    setImportDialogOpen(true);
    setImportResult(null);
    setImportFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const executeImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const fileContent = await importFile.text();
      const data: ExportImportData = JSON.parse(fileContent);

      let imported = 0;
      let errors: string[] = [];
      let warnings: string[] = [];

      // Import assessments
      if (data.assessments && Array.isArray(data.assessments)) {
        setImportProgress(25);
        for (const assessment of data.assessments) {
          try {
            // Remove id and timestamps for new records
            const { id, created_at, updated_at, ...cleanAssessment } = assessment;
            
            const { error } = await supabase
              .from('design_assessments')
              .insert({
                ...cleanAssessment,
                created_at: new Date().toISOString(),
              });

            if (error) {
              errors.push(`Assessment ${assessment.applicant_email}: ${error.message}`);
            } else {
              imported++;
            }
          } catch (error: any) {
            errors.push(`Assessment ${assessment.applicant_email}: ${error.message}`);
          }
        }
      }

      // Import templates
      if (data.templates && Array.isArray(data.templates)) {
        setImportProgress(50);
        for (const template of data.templates) {
          try {
            const { id, created_at, updated_at, ...cleanTemplate } = template;
            
            const { error } = await supabase
              .from('assessment_templates')
              .insert({
                ...cleanTemplate,
                created_at: new Date().toISOString(),
              });

            if (error) {
              errors.push(`Template ${template.name}: ${error.message}`);
            } else {
              imported++;
            }
          } catch (error: any) {
            errors.push(`Template ${template.name}: ${error.message}`);
          }
        }
      }

      // Import results
      if (data.results && Array.isArray(data.results)) {
        setImportProgress(75);
        for (const result of data.results) {
          try {
            const { id, created_at, ...cleanResult } = result;
            
            const { error } = await supabase
              .from('design_assessment_results')
              .insert({
                ...cleanResult,
                created_at: new Date().toISOString(),
              });

            if (error) {
              errors.push(`Result for assessment ${result.assessment_id}: ${error.message}`);
            } else {
              imported++;
            }
          } catch (error: any) {
            errors.push(`Result for assessment ${result.assessment_id}: ${error.message}`);
          }
        }
      }

      setImportProgress(100);

      setImportResult({
        success: errors.length === 0,
        message: errors.length === 0 
          ? 'Import completed successfully' 
          : `Import completed with ${errors.length} errors`,
        imported,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      });

      if (errors.length === 0) {
        toast.success(`Import completed: ${imported} records imported`);
      } else {
        toast.error(`Import completed with errors: ${imported} imported, ${errors.length} failed`);
      }
    } catch (error: any) {
      toast.error('Import failed', {
        description: error.message,
      });
      setImportResult({
        success: false,
        message: 'Import failed',
        imported: 0,
        errors: [error.message],
      });
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const downloadTemplate = () => {
    const template = {
      assessments: [
        {
          applicant_email: "candidate@example.com",
          problem_id: "problem-1",
          sender_id: "user-1",
          completed: false,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ],
      templates: [
        {
          name: "Sample Template",
          description: "A sample assessment template",
          type: "system-design",
          difficulty: "medium",
          duration: 60,
          problem_ids: ["problem-1", "problem-2"],
          settings: {
            allowRetake: false,
            showResults: true,
            randomizeQuestions: false,
            timeLimit: true,
            proctoringEnabled: true,
          },
        }
      ],
      results: [
        {
          assessment_id: "assessment-1",
          reliability: 7,
          scalability: 8,
          availability: 6,
          communication: 9,
          trade_off_analysis: 7,
          overall_score: 7.4,
          summary: "Good performance overall",
          strengths: ["Clear communication", "Good technical knowledge"],
          weaknesses: ["Could improve on availability considerations"],
        }
      ]
    };

    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aceup_import_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Template downloaded');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 600, mb: 4 }}>
        Data Export & Import
      </Typography>

      <Grid container spacing={3}>
        {/* Export Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Download />
                Export Data
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Export your assessment data in JSON format for backup or migration purposes.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExport}
                  sx={{
                    bgcolor: 'rgba(98, 0, 69, 0.8)',
                    '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
                  }}
                >
                  Export Data
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<FileUpload />}
                  onClick={downloadTemplate}
                  sx={{
                    borderColor: 'rgba(98, 0, 69, 0.5)',
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': {
                      borderColor: 'rgba(98, 0, 69, 0.8)',
                      bgcolor: 'rgba(98, 0, 69, 0.1)',
                    },
                  }}
                >
                  Download Template
                </Button>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Export includes: Assessments, Templates, Results, and all related data.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Import Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Upload />
                Import Data
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Import assessment data from a JSON file. Use the template to ensure proper format.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={handleImport}
                sx={{
                  bgcolor: 'rgba(76, 175, 80, 0.8)',
                  '&:hover': { bgcolor: 'rgba(76, 175, 80, 1)' },
                }}
              >
                Import Data
              </Button>

              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Supported formats: JSON files exported from this system or following the template format.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Quick Actions & Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={<Download />}
                    label="Export All Data"
                    variant="outlined"
                    onClick={() => { setExportType('all'); handleExport(); }}
                    sx={{
                      borderColor: 'rgba(98, 0, 69, 0.5)',
                      color: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'rgba(98, 0, 69, 0.8)',
                        bgcolor: 'rgba(98, 0, 69, 0.1)',
                      },
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={<Upload />}
                    label="Import Template"
                    variant="outlined"
                    onClick={downloadTemplate}
                    sx={{
                      borderColor: 'rgba(76, 175, 80, 0.5)',
                      color: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'rgba(76, 175, 80, 0.8)',
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                      },
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', color: 'white' }}>
                  <Typography variant="body2">
                    💡 <strong>Tip:</strong> Always backup your data before importing. The import process will add new records without overwriting existing ones.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Export Data
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)' }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Export Type</InputLabel>
            <Select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
              }}
            >
              <MenuItem value="all">All Data</MenuItem>
              <MenuItem value="assessments">Assessments Only</MenuItem>
              <MenuItem value="templates">Templates Only</MenuItem>
              <MenuItem value="results">Results Only</MenuItem>
            </Select>
          </FormControl>

          {exportProgress > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                Exporting... {exportProgress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={exportProgress}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'rgba(98,0,69,0.8)',
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setExportDialogOpen(false)}
            disabled={exportProgress > 0 && exportProgress < 100}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={executeExport}
            disabled={exportProgress > 0}
            variant="contained"
            sx={{
              bgcolor: 'rgba(98,0,69,0.8)',
              '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Import Data
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)' }}>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="import-file-input"
            />
            <label htmlFor="import-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<FileUpload />}
                sx={{
                  borderColor: 'rgba(98,0,69,0.5)',
                  color: 'rgba(255,255,255,0.9)',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'rgba(98,0,69,0.8)',
                    bgcolor: 'rgba(98,0,69,0.1)',
                  },
                }}
              >
                Select JSON File
              </Button>
            </label>

            {importFile && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </Typography>
              </Box>
            )}

            {importing && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                  Importing... {importProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={importProgress}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'rgba(76,175,80,0.8)',
                    },
                  }}
                />
              </Box>
            )}

            {importResult && (
              <Box sx={{ mt: 3 }}>
                <Alert
                  severity={importResult.success ? 'success' : 'error'}
                  sx={{ backgroundColor: importResult.success ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)' }}
                >
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {importResult.message}
                  </Typography>
                  {importResult.imported > 0 && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Records imported: {importResult.imported}
                    </Typography>
                  )}
                </Alert>

                {importResult.errors && importResult.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                      Errors:
                    </Typography>
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <Typography key={index} variant="caption" sx={{ color: 'rgba(255,100,100,0.9)', ml: 2 }}>
                        • {error}
                      </Typography>
                    ))}
                    {importResult.errors.length > 5 && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', ml: 2 }}>
                        ... and {importResult.errors.length - 5} more errors
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setImportDialogOpen(false)}
            disabled={importing}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Close
          </Button>
          <Button
            onClick={executeImport}
            disabled={!importFile || importing}
            variant="contained"
            sx={{
              bgcolor: 'rgba(76,175,80,0.8)',
              '&:hover': { bgcolor: 'rgba(76,175,80,1)' },
            }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
