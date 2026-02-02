import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import Problems from "../../components/admin/Problems";
import Assessments from "../../components/admin/Assessments";
import AnalyticsDashboard from "../../components/admin/AnalyticsDashboard";
import CandidateComparison from "../../components/admin/CandidateComparison";
import BulkOperations from "../../components/admin/BulkOperations";
import TemplateManager from "../../components/admin/TemplateManager";
import AssessmentScheduler from "../../components/admin/AssessmentScheduler";
import DataExportImport from "../../components/admin/DataExportImport";
import NotificationCenter from "../../components/admin/NotificationCenter";
import CandidateFeedback from "../../components/admin/CandidateFeedback";
import AssessmentWorkflowAutomation from "../../components/admin/AssessmentWorkflowAutomation";
import CandidateCommunicationCenter from "../../components/admin/CandidateCommunicationCenter";
import AssessmentCalendar from "../../components/admin/AssessmentCalendar";
import AssessmentPerformanceInsights from "../../components/admin/AssessmentPerformanceInsights";
import AssessmentAnalyticsDashboard from "../../components/admin/AssessmentAnalyticsDashboard";
import { NotificationProvider } from "../../contexts/NotificationContext";
import {
  DesignProblem,
  DesignAssessment,
  fetchProblems,
  fetchAssessments,
  createAssessment,
} from "../../services/design.service";

export default function Dashboard() {
  // Data
  const [problems, setProblems] = useState<DesignProblem[]>([]);
  const [assessments, setAssessments] = useState<DesignAssessment[]>([]);
  // UI
  const [problemSortBy, setProblemSortBy] = useState<"asc" | "desc">("asc");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);

  // Disable overscroll on mount
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = 'auto';
      document.documentElement.style.overscrollBehavior = 'auto';
    };
  }, []);

  // Load data
  const reloadProblems = async () => setProblems(await fetchProblems());
  const reloadAssessments = async () =>
    setAssessments(await fetchAssessments());

  useEffect(() => {
    reloadProblems();
    reloadAssessments();
  }, []);

  // Sorted problems
  const sortedProblems = useMemo(() => {
    const copy = [...problems];
    copy.sort((a, b) =>
      problemSortBy === "asc"
        ? a.difficulty - b.difficulty
        : b.difficulty - a.difficulty
    );
    return copy;
  }, [problems, problemSortBy]);

  // Split assessments
  const completed = useMemo(
    () =>
      assessments
        .filter((a) => a.completed)
        .sort(
          (a, b) =>
            new Date(b.ended_at ?? 0).getTime() -
            new Date(a.ended_at ?? 0).getTime()
        ),
    [assessments]
  );
  const incomplete = useMemo(
    () =>
      assessments
        .filter((a) => !a.completed)
        .sort(
          (a, b) =>
            new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
        ),
    [assessments]
  );

  // Actions
  const sendAssessment = async (problemId: string, email: string) => {
    setSendingId(problemId); // show loading state
    try {
      // Get current user (sender)
      const user = await authService.getUser();
      if (!user) throw new Error("Not authenticated");
      const senderId = user.id;

      // Create assessment in database and get the generated UUID
      const assessmentId = await createAssessment({
        problem_id: problemId,
        applicant_email: email,
        sender_id: senderId,
      });

      // Send email via backend API
      const response = await fetch('http://localhost:3000/api/send-interview-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: email,
          candidateName: email.split('@')[0], // Use email username as name
          assessmentId: assessmentId,
          company: 'Systema'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Reload assessments table
      await reloadAssessments();

      toast.success(`Assessment sent successfully to ${email}`, {
        description: `Assessment ID: ${assessmentId}`,
      });
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to send assessment', {
        description: e.message || String(e),
      });
    } finally {
      setSendingId(null); // reset loading state
    }
  };

  const handleLogout = () => authService.logout();

  return (
    <NotificationProvider>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          position: "relative",
          overflow: "auto",
          overscrollBehavior: "none",
        }}
      >
        {/* Animated Background */}
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(120,119,198,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,119,198,0.25) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(255,219,118,0.2) 0%, transparent 50%)",
            zIndex: 0,
            pointerEvents: "none",
            animation: "gradientShift 15s ease infinite",
            "@keyframes gradientShift": {
              "0%": { transform: "translate(0, 0) rotate(0deg)" },
              "33%": { transform: "translate(-20px, -20px) rotate(120deg)" },
              "66%": { transform: "translate(20px, -10px) rotate(240deg)" },
              "100%": { transform: "translate(0, 0) rotate(360deg)" },
            },
          }}
        />

        <Box sx={{ position: "relative", zIndex: 10 }}>
          <AppBar
            position="static"
            elevation={0}
            sx={{
              bgcolor: "rgba(15,12,41,0.8)",
              backdropFilter: "blur(25px)",
              borderBottom: "1px solid rgba(120,119,198,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <Toolbar sx={{ py: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                  gap: 2,
                }}
              >
                <img
                  src="/SystemaLogo.png"
                  alt="Systema Logo"
                  style={{ height: "45px", width: "auto" }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, letterSpacing: 0.5 }}
                  >
                    Systema
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Dashboard
                  </Typography>
                </Box>
              </Box>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  "&:hover": {
                    background: "linear-gradient(135deg, rgba(120,119,198,0.3) 0%, rgba(120,119,198,0.2) 100%)",
                    borderColor: "rgba(120,119,198,0.6)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(120,119,198,0.3)",
                  },
                }}
              >
                Logout
              </Button>
              <NotificationCenter />
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 5, mb: 6, px: 4 }}>
            {/* Dashboard Tabs */}
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'rgba(120,119,198,0.3)', 
              mb: 3,
              bgcolor: 'rgba(15,12,41,0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 1,
            }}>
              <Tabs
                value={activeTab}
                onChange={(_: any, newValue: number) => setActiveTab(newValue)}
                textColor="inherit"
                TabIndicatorProps={{ 
                  sx: { 
                    backgroundColor: 'rgba(120,119,198,0.8)',
                    height: 3,
                    borderRadius: 1,
                  } 
                }}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    minHeight: 48,
                    px: 2,
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: 'rgba(255,255,255,0.9)',
                      bgcolor: 'rgba(120,119,198,0.1)',
                    },
                    '&.Mui-selected': { 
                      color: 'white',
                      bgcolor: 'rgba(120,119,198,0.2)',
                    },
                  },
                }}
              >
                <Tab label="Overview" />
                <Tab label="Assessments" />
                <Tab label="Problems" />
                <Tab label="Templates" />
                <Tab label="Scheduler" />
                <Tab label="Calendar" />
                <Tab label="Data" />
                <Tab label="Feedback" />
                <Tab label="Automation" />
                <Tab label="Communication" />
                <Tab label="Insights" />
                <Tab label="Analytics Pro" />
                <Tab label="Analytics" />
                <Tab label="Compare" />
              </Tabs>
            </Box>
            {activeTab === 0 && (
              <Box
                sx={{
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'rgba(120,119,198,0.3)', 
            mb: 3,
            bgcolor: 'rgba(15,12,41,0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 1,
          }}>
            <Tabs
              value={activeTab}
              onChange={(_: any, newValue: number) => setActiveTab(newValue)}
              textColor="inherit"
              TabIndicatorProps={{ 
                sx: { 
                  backgroundColor: 'rgba(120,119,198,0.8)',
                  height: 3,
                  borderRadius: 1,
                } 
              }}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minHeight: 48,
                  px: 2,
                  borderRadius: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'rgba(255,255,255,0.9)',
                    bgcolor: 'rgba(120,119,198,0.1)',
                  },
                  '&.Mui-selected': { 
                    color: 'white',
                    bgcolor: 'rgba(120,119,198,0.2)',
                  },
                },
              }}
            >
              <Tab label="Overview" />
              <Tab label="Assessments" />
              <Tab label="Problems" />
              <Tab label="Templates" />
              <Tab label="Scheduler" />
              <Tab label="Calendar" />
              <Tab label="Data" />
              <Tab label="Feedback" />
              <Tab label="Automation" />
              <Tab label="Communication" />
              <Tab label="Insights" />
              <Tab label="Analytics Pro" />
              <Tab label="Analytics" />
              <Tab label="Compare" />
            </Tabs>
          </Box>
                  display: "flex",
                  gap: 4,
                  flexDirection: { xs: "column", lg: "row" },
                }}
              >
                {/* Problems */}
                <Box sx={{ flex: 1 }}>
                  <Problems
                    problems={sortedProblems}
                    total={problems.length}
                    sortBy={problemSortBy}
                    setSortBy={setProblemSortBy}
                    onSendProblem={sendAssessment}
                    sendingId={sendingId}
                  />
                </Box>

                {/* Assessments */}
                <Box sx={{ flex: 1 }}>
                  <BulkOperations
                    selectedAssessments={selectedAssessments}
                    assessments={assessments}
                    onSelectionChange={setSelectedAssessments}
                    onRefresh={reloadAssessments}
                  />
                  <Assessments 
                    completed={completed} 
                    incomplete={incomplete} 
                    selectedAssessments={selectedAssessments}
                    onSelectionChange={setSelectedAssessments}
                  />
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <>
                <BulkOperations
                  selectedAssessments={selectedAssessments}
                  assessments={assessments}
                  onSelectionChange={setSelectedAssessments}
                  onRefresh={reloadAssessments}
                />
                <Assessments 
                  completed={completed} 
                  incomplete={incomplete} 
                  selectedAssessments={selectedAssessments}
                  onSelectionChange={setSelectedAssessments}
                />
              </>
            )}

            {activeTab === 2 && (
              <Problems
                problems={sortedProblems}
                total={problems.length}
                sortBy={problemSortBy}
                setSortBy={setProblemSortBy}
                onSendProblem={sendAssessment}
                sendingId={sendingId}
              />
            )}

            {activeTab === 3 && (
              <TemplateManager />
            )}

            {activeTab === 4 && (
              <AssessmentScheduler />
            )}

            {activeTab === 5 && (
              <AssessmentCalendar />
            )}

            {activeTab === 6 && (
              <DataExportImport />
            )}

            {activeTab === 7 && (
              <CandidateFeedback />
            )}

            {activeTab === 8 && (
              <AssessmentWorkflowAutomation />
            )}

            {activeTab === 9 && (
              <CandidateCommunicationCenter />
            )}

            {activeTab === 10 && (
              <AssessmentAnalyticsDashboard />
            )}

            {activeTab === 11 && (
              <AnalyticsDashboard />
            )}

            {activeTab === 12 && (
              <CandidateComparison />
            )}
          </Container>
        </Box>
      </Box>
    </NotificationProvider>
  );
}