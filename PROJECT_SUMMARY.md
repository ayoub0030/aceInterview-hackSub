# AceUp Interview - Complete Project Summary

## 🎯 Project Overview

**Name:** AceUp Interview (sherm-team-6)  
**Purpose:** AI-powered system design interview platform with real-time proctoring  
**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Gemini AI, Eleven Labs, TailwindCSS

---

## 🏗️ Architecture

### **Backend (Next.js Server - Port 3000)**
Located in `/app` directory

**API Endpoints:**
- `POST /api/grade-interview` - Grades interviews using Gemini AI
- `POST /api/proctoring/analyze` - Analyzes webcam frames for cheating detection
- `POST /api/proctoring/violation` - Records proctoring violations
- `POST /api/send-interview-link` - Sends email invitations via Resend

**Key Services:**
- `backend/gemini-grader.ts` - Grades on 5 pillars (reliability, scalability, availability, communication, trade-off analysis)
- `backend/proctoring-analyzer.ts` - Analyzes webcam frames using Gemini vision

### **Frontend (Vite/React - Port 5173)**
Located in `/frontend` directory

**Pages:**
- `Login/Register` - Admin authentication
- `Dashboard` - Admin panel for managing assessments
- `PreInterview` - Consent & setup before interview
- `SystemDesignInterviewPage` - Main interview with diagram editor & Eleven Labs voice agent
- `AssessmentFinishedPage` - Results display with scores and feedback

**Key Components:**
- `Canvas.tsx` - ReactFlow-based diagram editor
- `Proctoring monitor` - Real-time webcam monitoring
- `Timer` - 45-minute interview countdown

### **Database (Supabase)**

**Tables:**
- `design_assessments` - Interview problems and metadata
- `design_assessment_results` - Grading results (scores, feedback, transcript, diagram)
- `proctoring_frames` - Webcam frames and suspicion scores
- `proctoring_violations` - Tab switches and other violations

---

## 🔄 How the System Works

### **1. Interview Flow**

```
Admin Creates Assessment
    ↓
Candidate Receives Email Link
    ↓
Pre-Interview Page (Consent + Webcam Check)
    ↓
Interview Starts (45 minutes)
    ├─ Eleven Labs Voice Agent Connects
    ├─ Candidate Designs System (Diagram Editor)
    ├─ Real-time Proctoring (Every 1 minute)
    └─ Agent Sees Diagram Updates in Real-time
    ↓
Interview Ends (Time or Manual)
    ↓
Grading Process Starts
    ↓
Results Page Displays Scores & Feedback
```

### **2. Grading Process (Complete Flow)**

```
Interview Ends
    ↓
1. Capture Diagram State
2. Get Conversation ID from Eleven Labs
    ↓
3. Fetch Problem Details from Supabase
   (Problem description, rubric, requirements)
    ↓
4. Fetch Conversation Transcript from Eleven Labs API
   (With retry logic: up to 3 attempts, 3 seconds apart)
    ↓
5. Normalize Diagram JSON to Standard Format
    ↓
6. Send to Backend API: POST /api/grade-interview
   ├─ Input: Problem description, rubric, transcript, diagram
   └─ Uses: GeminiGradingService (Gemini 2.0 Flash)
    ↓
7. Gemini Grades on 5 Pillars (0-10 each):
   • Reliability - Fault tolerance, error handling, data consistency
   • Scalability - Horizontal scaling, load balancing, caching
   • Availability - Redundancy, failover, geographic distribution
   • Communication - Clarity, justification of choices
   • Trade-off Analysis - Competing concerns, alternatives
    ↓
8. Calculate Overall Score = Average of 5 pillars
    ↓
9. Save Results to Database:
   - Individual scores for each pillar
   - Overall score
   - Summary and feedback
   - Strengths and weaknesses
   - Full transcript
   - Diagram JSON
    ↓
10. Display Results Page
```

### **3. Proctoring Process**

```
Interview Running
    ↓
Every 1 Minute:
    ├─ Capture Webcam Frame
    ├─ Send to Backend: POST /api/proctoring/analyze
    ├─ Gemini Analyzes Frame (Vision)
    ├─ Returns Suspicion Score (0-100)
    └─ If Score > 70: Log Violation
    ↓
Tab Switch Detected:
    ├─ Log as "tab_switch" violation
    └─ Increment suspicion counter
    ↓
Results Saved to Supabase
```

### **4. Eleven Labs Integration**

```
Interview Starts
    ↓
useConversation Hook Connects to Eleven Labs Agent
    ├─ Agent ID: Configurable via VITE_ELEVEN_AGENT_ID
    ├─ Connection Type: WebRTC
    └─ Status: "connected"
    ↓
Diagram Updates Detected
    ↓
useDiagramElevenSync Hook:
    ├─ Debounces changes (500ms)
    ├─ Sends diagram JSON via sendContextualUpdate()
    └─ Agent receives as "diagram_json" variable
    ↓
Agent Can See & Discuss Diagram
    ↓
Conversation Recorded
    ↓
Interview Ends
    ↓
Transcript Fetched from Eleven Labs API
```

---

## 🔐 Security Features

### **Prompt Injection Detection**
The Gemini grader detects suspicious keywords in transcripts:
- "ignore previous", "ignore all", "new instructions"
- "act as", "pretend you are", "system prompt"
- "give me a 10", "perfect score", "maximum score"

**If detected:** Returns all scores as 0 and marks interview as invalidated

### **Proctoring Violations**
- Tab switches detected and logged
- Webcam monitoring for multiple people
- Suspicion scoring based on engagement

---

## 📊 Grading Rubric (5 Pillars)

### **1. Reliability (0-10)**
**High Score (8-10):**
- Identifies and handles failure scenarios
- Error handling mechanisms (retries, circuit breakers)
- Data consistency strategies (transactions, eventual consistency)
- Graceful degradation when components fail
- Backup and restore strategies

**Low Score (0-4):**
- No failure handling discussed
- No error consideration
- System fails completely on any error

### **2. Scalability (0-10)**
**High Score (8-10):**
- Horizontal scaling strategy clear
- Load balancing implemented
- Database scaling (sharding, partitioning, read replicas)
- Caching layers to reduce load
- Stateless services for easy scaling

**Low Score (0-4):**
- No scaling strategy
- Single server/database only
- Cannot handle specified load

### **3. Availability (0-10)**
**High Score (8-10):**
- Eliminates single points of failure
- Redundancy in critical components
- Active-active or active-passive failover
- Health checks and monitoring
- Multi-region/multi-zone deployment

**Low Score (0-4):**
- Single point of failure
- No redundancy
- No failover mechanism

### **4. Communication (0-10)**
**High Score (8-10):**
- Clear explanation of architecture
- Justifies design choices
- Responds to feedback
- Understands trade-offs
- Explains reasoning

**Low Score (0-4):**
- Unclear or vague explanations
- No justification for choices
- Doesn't address questions

### **5. Trade-off Analysis (0-10)**
**High Score (8-10):**
- Explicitly discusses trade-offs
- Compares alternatives (SQL vs NoSQL, sync vs async)
- Understands CAP theorem implications
- Acknowledges limitations
- Justifies technology choices

**Low Score (0-4):**
- No trade-offs discussed
- No alternatives considered
- Claims approach is "perfect"

---

## 🛠️ Environment Variables Required

### **Backend (.env)**
```
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
APP_BASE_URL=http://localhost:5173
COMPANY_NAME=Your Company Name
```

### **Frontend (.env.local)**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ELEVEN_API_KEY=your_eleven_labs_api_key
VITE_ELEVEN_AGENT_ID=agent_your_agent_id
```

---

## 📁 Project Structure

```
/
├── app/                          # Next.js backend
│   ├── api/
│   │   ├── grade-interview/      # Grading endpoint (NEW)
│   │   ├── proctoring/
│   │   └── send-interview-link/
│   └── layout.tsx
│
├── frontend/                      # Vite/React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Interview/
│   │   │   ├── Dashboard/
│   │   │   └── AssessmentFinished/
│   │   ├── services/
│   │   │   ├── grading.service.ts    # Orchestrates grading (MODIFIED)
│   │   │   ├── interview.service.ts
│   │   │   └── api.ts
│   │   ├── hooks/
│   │   │   └── useDiagramElevenSync.ts  # Syncs diagram with agent
│   │   └── components/
│   │       └── Canvas.tsx              # Diagram editor
│   └── .env.local
│
├── backend/
│   ├── gemini-grader.ts          # Grading engine
│   └── proctoring-analyzer.ts    # Proctoring engine
│
├── supabase/
│   ├── migrations/
│   │   ├── create_proctoring_frames_table.sql
│   │   ├── add_assessment_id_to_proctoring_frames.sql
│   │   ├── add_status_and_duration_to_design_assessments.sql
│   │   └── add_grading_columns_to_design_assessment_results.sql (NEW)
│   └── functions/
│       └── grade-interview/      # Edge Function (fallback)
│
├── types/                        # TypeScript interfaces
├── lib/                          # Shared utilities
└── .env                          # Backend env variables
```

---

## 🚀 Running the Project

### **Start Backend (Port 3000)**
```bash
npm run dev
```

### **Start Frontend (Port 5173)**
```bash
cd frontend
npm run dev
```

### **Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 🔧 Recent Fixes (Session Summary)

### **Issue 1: Grading Edge Function Failed**
- **Problem:** Supabase Edge Function not accessible (401 error)
- **Solution:** Created backend API endpoint `/api/grade-interview` with fallback to Edge Function
- **File:** `app/api/grade-interview/route.ts`

### **Issue 2: CORS Error**
- **Problem:** Frontend (port 5173) couldn't call backend (port 3000)
- **Solution:** Added CORS headers and OPTIONS handler to API endpoint
- **File:** `app/api/grade-interview/route.ts`

### **Issue 3: Missing Database Columns**
- **Problem:** `design_assessment_results` table missing `overall_score`, `strengths`, `weaknesses`
- **Solution:** Created migration to add missing columns
- **File:** `supabase/migrations/add_grading_columns_to_design_assessment_results.sql`

### **Issue 4: Incorrect Column Names**
- **Problem:** Code using `reliability_score` but table has `reliability`
- **Solution:** Updated `saveGradingResults()` to use correct column names
- **File:** `frontend/src/services/grading.service.ts`

---

## ✅ Current Status

**All Features Working:**
- ✅ Eleven Labs voice agent integration
- ✅ Real-time diagram synchronization with agent
- ✅ Interview grading with Gemini AI
- ✅ Results saved to database
- ✅ Proctoring with webcam monitoring
- ✅ Security: Prompt injection detection
- ✅ Email invitations via Resend

**Console Logs to Verify:**
```
[Grading] Calling backend API to grade interview
[Grading] Interview graded successfully via backend API
[Grading] Saving results to database for assessment: ...
[Grading] Results saved successfully
[Grading] Orchestration completed successfully
[Interview] Grading completed successfully
```

---

## 📝 Key Concepts

### **Gemini Grading Service**
- Uses `gemini-2.0-flash-exp` model
- Temperature: 0.2 (deterministic)
- Response format: JSON
- Security: Detects prompt injection attempts

### **Eleven Labs Integration**
- Voice agent with WebRTC connection
- Real-time diagram updates via `sendContextualUpdate()`
- Transcript fetching with retry logic (3 attempts)
- Agent can see and discuss diagram

### **Supabase Database**
- Real-time updates
- Row-level security (RLS)
- Storage bucket for proctoring frames
- Edge Functions for serverless logic

### **Proctoring System**
- Analyzes frames every 1 minute
- Suspicion scoring (0-100)
- Detects: multiple people, phone visibility, engagement
- Tab switch detection
- Violation logging

---

## 🎓 Interview Flow Example

1. **Admin** creates assessment with problem: "Design a URL Shortener"
2. **Candidate** receives email with interview link
3. **Candidate** clicks link → Pre-interview page
4. **Candidate** grants webcam permission
5. **Interview starts** → Eleven Labs agent connects
6. **Candidate** designs system using diagram editor
7. **Agent** sees diagram in real-time and discusses it
8. **Proctoring** monitors every 1 minute
9. **45 minutes** pass or candidate ends interview
10. **Grading starts:**
    - Fetches transcript from Eleven Labs
    - Sends to Gemini for grading
    - Saves results to database
11. **Results page** shows:
    - Scores for each pillar
    - Overall score
    - Strengths and weaknesses
    - Transcript
    - Diagram

---

## 🐛 Troubleshooting

### **Grading Fails**
- Check `GEMINI_API_KEY` is set in `.env`
- Ensure backend server running on port 3000
- Check browser console for error details

### **Transcript Not Fetching**
- Verify `VITE_ELEVEN_API_KEY` has transcript permission
- Check Eleven Labs API key is valid
- Retry logic waits 3 seconds between attempts

### **Diagram Not Syncing**
- Verify `VITE_ELEVEN_AGENT_ID` is correct
- Check agent has `diagram_json` variable configured
- Look for `[DiagramSync]` logs in console

### **Proctoring Issues**
- Check webcam permission granted
- Verify `GEMINI_API_KEY` for vision analysis
- Check suspicion scores in console

---

## 📚 Additional Resources

- **Gemini Grading:** `backend/gemini-grader.ts`
- **Grading Flow:** `GRADING_FLOW.md`
- **Eleven Labs Setup:** `frontend/ELEVEN_LABS_SETUP.md`
- **Proctoring:** `backend/proctoring-analyzer.ts`

---

## 🎯 Next Steps / Future Improvements

1. Deploy to production (Vercel + Supabase)
2. Add admin dashboard for viewing results
3. Implement candidate feedback system
4. Add more interview problems
5. Enhance proctoring with ML models
6. Add analytics and reporting
7. Implement retake functionality
8. Add interview scheduling system

---

**Last Updated:** October 30, 2025  
**Status:** ✅ Fully Functional
