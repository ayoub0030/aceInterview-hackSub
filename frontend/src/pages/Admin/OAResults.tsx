import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Download,
  Print,
  Share,
  Visibility,
  ExpandMore,
  PictureAsPdf,
  Description,
} from "@mui/icons-material";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { supabase } from "@/lib/supabase";
import ProctoringSuspicionChart from "@/components/admin/ProctoringSuspicionChart";

// ---- Types ----
interface AssessmentResult {
  id: string;
  applicant_email: string;
  problem_id: string;
  reliability: number;
  scalability: number;
  availability: number;
  communication: number;
  tradeoff_analysis: number; // mapped from DB `trade_off_analysis`
  suspicion: number;
  summary: string;
  strengths?: string[];
  weaknesses?: string[];
  transcript?: string;
  diagram?: any;
  completed_at: string;
}

export default function OAResults() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const [diagramDialogOpen, setDiagramDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Disable overscroll on mount
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = "auto";
      document.documentElement.style.overscrollBehavior = "auto";
    };
  }, []);

  // Fetch assessment results from Supabase using interviewId (assessment_id)
  useEffect(() => {
    const fetchAssessmentResults = async () => {
      if (!interviewId) {
        console.error('No assessment ID provided');
        setLoading(false);
        return;
      }

      try {
        /**
         * We select from design_assessment_results and join the parent assessment via the FK `assessment_id`.
         * Route param `interviewId` corresponds to `design_assessments.id`.
         * We take the most recent result row for that assessment (order by created_at desc).
         */
        const { data, error: dbError } = await supabase
          .from("design_assessment_results")
          .select(
            `
              id,
              created_at,
              reliability,
              scalability,
              availability,
              communication,
              trade_off_analysis,
              suspicion,
              summary,
              transcript,
              diagram,
              design_assessments:assessment_id (
                id,
                applicant_email,
                problem_id,
                started_at,
                ended_at
              )
            `
          )
          .eq("assessment_id", interviewId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dbError) {
          console.error("Error fetching assessment results:", dbError);
          setError(dbError.message);
          const mockResult =
            mockResults[interviewId] || mockResults["assessment-1"];
          setResults(mockResult);
        } else if (data) {
          const transformed: AssessmentResult = {
            id: data.id,
            applicant_email:
              data.design_assessments?.applicant_email ?? "unknown@applicant",
            problem_id: data.design_assessments?.problem_id ?? "",
            reliability: Number(data.reliability ?? 0),
            scalability: Number(data.scalability ?? 0),
            availability: Number(data.availability ?? 0),
            communication: Number(data.communication ?? 0),
            tradeoff_analysis: Number(data.trade_off_analysis ?? 0),
            suspicion: Number(data.suspicion ?? 0),
            summary: data.summary || "No summary available",
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            transcript: data.transcript || "",
            diagram: data.diagram,
            completed_at: data.design_assessments?.ended_at ?? data.created_at,
          };
          setResults(transformed);
        } else {
          // No DB row; fallback
          const mockResult =
            mockResults[interviewId] || mockResults["assessment-1"];
          setResults(mockResult);
        }
      } catch (e: any) {
        console.error("Unexpected error:", e);
        setError(e?.message ?? "Unexpected error");
        const mockResult =
          mockResults[interviewId] || mockResults["assessment-1"];
        setResults(mockResult);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentResults();
  }, [interviewId]);

  // Utility functions
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4caf50'; // Green
    if (score >= 6) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Needs Improvement';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // In a real implementation, you would use a library like jsPDF
    alert('PDF export would be implemented here using jsPDF or similar library');
  };

  const handleExportExcel = () => {
    // In a real implementation, you would use a library like xlsx
    alert('Excel export would be implemented here using xlsx library');
  };

  const handleShare = async () => {
    const shareData = {
      title: `Assessment Results for ${results?.applicant_email}`,
      text: `Overall Score: ${overallScore}/10`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Results link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)",
        }}
      >
        <Typography variant="h5" sx={{ color: "white" }}>
          Loading assessment results...
        </Typography>
      </Box>
    );
  }

  if (!results) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)",
        }}
      >
        <Typography variant="h5" sx={{ color: "white" }}>
          No assessment results found
        </Typography>
      </Box>
    );
  }

  // Average the 5 score pillars
  const overallScore = Math.round(
    (results.reliability +
      results.scalability +
      results.availability +
      results.communication +
      results.tradeoff_analysis) /
      5
  );

  // Action buttons component
  const ActionButtons = () => (
    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
      <Tooltip title="Print Results">
        <IconButton
          onClick={handlePrint}
          sx={{
            bgcolor: 'rgba(98, 0, 69, 0.8)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
          }}
        >
          <Print />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Export Options">
        <IconButton
          onClick={() => setExportDialogOpen(true)}
          sx={{
            bgcolor: 'rgba(98, 0, 69, 0.8)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
          }}
        >
          <Download />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Share Results">
        <IconButton
          onClick={handleShare}
          sx={{
            bgcolor: 'rgba(98, 0, 69, 0.8)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
          }}
        >
          <Share />
        </IconButton>
      </Tooltip>
      
      {results.diagram && (
        <Tooltip title="View Diagram">
          <IconButton
            onClick={() => setDiagramDialogOpen(true)}
            sx={{
              bgcolor: 'rgba(98, 0, 69, 0.8)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
            }}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)",
        position: "relative",
        overflow: "auto",
        overscrollBehavior: "none",
      }}
    >
      {/* Subtle background pattern */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(98, 0, 69, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(98, 0, 69, 0.15) 0%, transparent 50%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 10 }}>
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/dashboard")}
            sx={{
              mb: 3,
              bgcolor: "rgba(98, 0, 69, 0.8)",
              backdropFilter: "blur(10px)",
              borderRadius: 1.5,
              px: 3,
              fontWeight: 500,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(98, 0, 69, 1)",
                transform: "scale(1.05)",
              },
            }}
          >
            ← Back to Dashboard
          </Button>

          <ActionButtons />

          {!!error && (
            <Typography variant="body2" sx={{ color: "#ffb3c7", mb: 1 }}>
              {error}
            </Typography>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: "rgba(20, 20, 25, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(98, 0, 69, 0.3)",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(98, 0, 69, 0.2)",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "white", fontWeight: 600, letterSpacing: 0.5 }}
            >
              Assessment Results
            </Typography>

            <Divider sx={{ my: 3, borderColor: "rgba(98, 0, 69, 0.3)" }} />

            {/* Main Content: Two Columns */}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", md: "row" },
                mb: 3,
              }}
            >
              {/* Left Column */}
              <Box
                sx={{
                  flex: "0 0 42%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {/* Candidate Info + Overall */}
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Candidate Information
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      <strong>Email:</strong> {results.applicant_email}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      <strong>Assessment Type:</strong> System Design
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      <strong>Completed:</strong>{" "}
                      {new Date(results.completed_at).toLocaleString()}
                    </Typography>
                    <Divider
                      sx={{ my: 2, borderColor: "rgba(98, 0, 69, 0.3)" }}
                    />
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Overall Score
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{ color: getScoreColor(overallScore), fontWeight: 600 }}
                    >
                      {overallScore}/10
                    </Typography>
                    <Chip
                      label={getScoreLabel(overallScore)}
                      sx={{
                        mt: 1,
                        bgcolor: getScoreColor(overallScore),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Score Breakdown */}
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Score Breakdown
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { label: 'Reliability', value: results.reliability },
                        { label: 'Scalability', value: results.scalability },
                        { label: 'Availability', value: results.availability },
                        { label: 'Communication', value: results.communication },
                        { label: 'Trade-off Analysis', value: results.tradeoff_analysis },
                      ].map((item) => (
                        <Box key={item.label}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                              {item.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: getScoreColor(item.value), fontWeight: 600 }}>
                              {item.value}/10
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                width: `${(item.value / 10) * 100}%`,
                                bgcolor: getScoreColor(item.value),
                                transition: 'width 0.5s ease',
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        mb: 3,
                        color: "white",
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      Performance Breakdown
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                        "& .MuiChartsLegend-series text": {
                          fill: "white !important",
                        },
                        "& .MuiChartsLegend-label": {
                          fill: "white !important",
                        },
                        "& .MuiChartsLegend-root": {
                          "& text": { fill: "white !important" },
                        },
                      }}
                    >
                      <RadarChart
                        height={450}
                        series={[
                          {
                            label: "Candidate Score",
                            data: [
                              results.reliability,
                              results.scalability,
                              results.availability,
                              results.communication,
                              results.tradeoff_analysis,
                            ],
                            color: "rgba(200, 50, 150, 0.9)",
                          },
                        ]}
                        radar={{
                          max: 10,
                          metrics: [
                            "Reliability",
                            "Scala-\nbility",
                            "Availability",
                            "Communication",
                            "Tradeoff\nAnalysis",
                          ],
                        }}
                        legend={{ hidden: true }} // <— easiest way to kill the warnings
                        sx={{
                          "& .MuiChartsAxis-tickLabel": {
                            fill: "white !important",
                          },
                          "& .MuiChartsLegend-root text": {
                            fill: "white !important",
                          },
                          "& text": { fill: "white !important" },
                          "& .MuiChartsAxis-label": {
                            fill: "white !important",
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Right Column */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {/* Strengths & Weaknesses */}
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Strengths & Weaknesses
                    </Typography>
                    
                    {(results.strengths?.length > 0 || results.weaknesses?.length > 0) ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {results.strengths?.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 600, mb: 1 }}>
                              Strengths:
                            </Typography>
                            {results.strengths.map((strength: string, index: number) => (
                              <Typography key={index} variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', ml: 2 }}>
                                • {strength}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        
                        {results.weaknesses?.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: '#f44336', fontWeight: 600, mb: 1 }}>
                              Areas for Improvement:
                            </Typography>
                            {results.weaknesses.map((weakness: string, index: number) => (
                              <Typography key={index} variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', ml: 2 }}>
                                • {weakness}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        No strengths or weaknesses data available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Summary
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        maxHeight: 215,
                        overflow: "auto",
                        bgcolor: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(98, 0, 69, 0.2)",
                        borderRadius: 1,
                        "&::-webkit-scrollbar": { width: "8px" },
                        "&::-webkit-scrollbar-track": {
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: 2,
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(98, 0, 69, 0.5)",
                          borderRadius: 2,
                          "&:hover": { background: "rgba(98, 0, 69, 0.7)" },
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          lineHeight: 1.6,
                        }}
                      >
                        {results.summary}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>

                {/* Suspicion Score Sparkline */}
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: "white",
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      Suspicion Score Over Time
                    </Typography>
                    <ProctoringSuspicionChart
                      assessmentId={interviewId}
                      height={510}
                      threshold={80}
                    />
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Bottom: Transcript and Diagram */}
            <Box>
              {/* Transcript Accordion */}
              {results.transcript && (
                <Accordion sx={{ bgcolor: 'rgba(98, 0, 69, 0.2)', '&:before': { display: 'none' } }}>
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                    sx={{ color: 'white', fontWeight: 500 }}
                  >
                    Interview Transcript
                  </AccordionSummary>
                  <AccordionDetails>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        maxHeight: 400,
                        overflow: "auto",
                        bgcolor: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(98, 0, 69, 0.2)",
                        borderRadius: 1,
                        "&::-webkit-scrollbar": { width: "8px" },
                        "&::-webkit-scrollbar-track": {
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: 2,
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(98, 0, 69, 0.5)",
                          borderRadius: 2,
                          "&:hover": { background: "rgba(98, 0, 69, 0.7)" },
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          whiteSpace: "pre-wrap",
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        {results.transcript}
                      </Typography>
                    </Paper>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle sx={{ bgcolor: 'rgba(98, 0, 69, 0.9)', color: 'white' }}>
          Export Options
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20, 20, 25, 0.95)', minWidth: 300 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              sx={{
                bgcolor: 'rgba(98, 0, 69, 0.8)',
                '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
              }}
            >
              Export as PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<Description />}
              onClick={handleExportExcel}
              sx={{
                bgcolor: 'rgba(98, 0, 69, 0.8)',
                '&:hover': { bgcolor: 'rgba(98, 0, 69, 1)' },
              }}
            >
              Export as Excel
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(20, 20, 25, 0.95)' }}>
          <Button onClick={() => setExportDialogOpen(false)} sx={{ color: 'white' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diagram Viewer Dialog */}
      <Dialog 
        open={diagramDialogOpen} 
        onClose={() => setDiagramDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98, 0, 69, 0.9)', color: 'white' }}>
          System Design Diagram
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20, 20, 25, 0.95)' }}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {results.diagram ? JSON.stringify(results.diagram, null, 2) : 'No diagram data available'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(20, 20, 25, 0.95)' }}>
          <Button onClick={() => setDiagramDialogOpen(false)} sx={{ color: 'white' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Mock data for fallback
const mockResults: Record<string, AssessmentResult> = {
  "assessment-1": {
    id: "assessment-1",
    applicant_email: "candidate@example.com",
    problem_id: "problem-1",
    reliability: 7,
    scalability: 8,
    availability: 6,
    communication: 9,
    tradeoff_analysis: 7,
    suspicion: 15,
    summary: "Candidate demonstrated strong understanding of system design principles with good communication skills. Showed solid approach to scalability and reliability, though could improve on availability considerations.",
    strengths: [
      "Excellent communication skills",
      "Good understanding of scalability patterns",
      "Solid approach to error handling",
      "Clear explanation of trade-offs"
    ],
    weaknesses: [
      "Limited discussion of availability patterns",
      "Could explore more caching strategies",
      "Missing consideration of edge cases"
    ],
    transcript: "Interview transcript would appear here...",
    diagram: { nodes: [], edges: [] },
    completed_at: new Date().toISOString(),
  },
};
