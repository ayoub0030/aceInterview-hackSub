# System Design Interview Grading Flow

## Overview

The grading system evaluates system design interviews on **5 pillars** using Google Gemini AI. Here's how it works end-to-end:

---

## **Step-by-Step Flow**

### **1. Interview Ends**
- User clicks "End Interview" or time runs out (45 minutes)
- Conversation with Eleven Labs agent ends
- Interview status marked as "complete" in database

### **2. Grading Initiated**
```
SystemDesignInterviewPage.tsx → submitInterview()
```
- Captures current diagram state
- Retrieves conversation ID from Eleven Labs
- Calls `orchestrateGrading(assessmentId, conversationId, diagramJson)`

### **3. Fetch Problem Details**
```
grading.service.ts → fetchProblemDetails()
```
- Queries Supabase for the problem description and rubric
- Example: "Design a URL shortening service"
- Includes requirements and constraints

### **4. Fetch Conversation Transcript**
```
grading.service.ts → fetchConversationTranscript()
```
- Calls Eleven Labs API to get the conversation transcript
- **Retry logic:** Waits up to 3 attempts (3 seconds between each)
- Reason: Transcript processing takes time on Eleven Labs side
- Returns full conversation text between user and agent

**Console logs:**
```
[Grading] Conversation status: processing
[Grading] Transcript not ready, waiting 3000ms before retry...
[Grading] Conversation status: done
[Grading] Transcript fetched successfully, length: 223
```

### **5. Normalize Diagram Data**
```
grading.service.ts → orchestrateGrading()
```
- Converts diagram format to standardized JSON:
```json
{
  "nodes": [
    { "id": "1", "label": "Load Balancer", "type": "load_balancer" },
    { "id": "2", "label": "API Server", "type": "server" }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "HTTP" }
  ]
}
```

### **6. Grade Interview**
```
grading.service.ts → gradeInterview()
```

**Primary method:** Next.js Backend API (`/api/grade-interview`)
- Sends all data to backend
- Backend uses `GeminiGradingService` to analyze

**Fallback method:** Supabase Edge Function
- If backend fails, tries Edge Function
- Ensures grading completes even if one method fails

**What Gemini evaluates:**

#### **1. Reliability (0-10)**
- Fault tolerance and error handling
- Data consistency strategies
- Failure recovery mechanisms
- Backup and restore plans

#### **2. Scalability (0-10)**
- Horizontal scaling strategy
- Load balancing implementation
- Database scaling (sharding, replicas)
- Caching layers
- Handles specified throughput

#### **3. Availability (0-10)**
- Redundancy and failover
- Service uptime strategies
- Geographic distribution
- Health checks and monitoring

#### **4. Communication (0-10)**
- Clarity of explanation
- Ability to justify design choices
- Responsiveness to feedback
- Understanding of trade-offs

#### **5. Trade-off Analysis (0-10)**
- Identifies competing concerns
- Justifies chosen approach
- Acknowledges limitations
- Discusses alternatives

**Output:**
```json
{
  "scores": {
    "reliability": 8,
    "scalability": 7,
    "availability": 8,
    "communication": 9,
    "trade_off_analysis": 7
  },
  "overall_score": 7.8,
  "summary": "Strong design with good scalability...",
  "strengths": ["Good load balancing", "Proper caching"],
  "weaknesses": ["Limited redundancy", "No monitoring"]
}
```

### **7. Save Results**
```
grading.service.ts → saveGradingResults()
```
- Saves to `design_assessment_results` table:
  - Scores for each pillar
  - Overall score
  - Summary and feedback
  - Transcript (for review)
  - Diagram JSON (for visualization)

### **8. Display Results**
```
SystemDesignInterviewPage.tsx → AssessmentFinishedPage
```
- Shows scores breakdown
- Displays strengths and weaknesses
- Shows transcript
- Shows diagram used

---

## **Data Flow Diagram**

```
Interview Ends
    ↓
Capture Diagram + Conversation ID
    ↓
Fetch Problem Details (Supabase)
    ↓
Fetch Transcript (Eleven Labs API)
    ↓
Normalize Diagram JSON
    ↓
Send to Grading Service
    ├→ Try: Backend API (/api/grade-interview)
    │   ├→ GeminiGradingService.grade()
    │   └→ Return scores
    │
    └→ Fallback: Supabase Edge Function
        └→ Return scores
    ↓
Save Results (Supabase)
    ↓
Display Results Page
```

---

## **Error Handling**

### **Transcript Fetch Fails (401 Error)**
- **Cause:** Eleven Labs API key doesn't have transcript permission
- **Solution:** Ensure API key has `read:transcripts` scope
- **Fallback:** Continues with empty transcript (grading still works)

### **Backend API Fails**
- **Cause:** Next.js server not running or API endpoint error
- **Solution:** Check backend is running, check logs
- **Fallback:** Tries Supabase Edge Function

### **Both Methods Fail**
- **Cause:** Gemini API key missing or invalid
- **Solution:** Check `GEMINI_API_KEY` in `.env`
- **Result:** Shows error page, user can retry

---

## **Configuration Required**

### **Environment Variables**

**Backend (.env):**
```
GEMINI_API_KEY=your_gemini_api_key
VITE_ELEVEN_API_KEY=your_eleven_labs_api_key
```

**Frontend (.env.local):**
```
VITE_ELEVEN_API_KEY=your_eleven_labs_api_key
VITE_ELEVEN_AGENT_ID=agent_your_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **Supabase Tables**

**design_assessment_results:**
```sql
- id (UUID)
- assessment_id (FK)
- reliability_score (0-10)
- scalability_score (0-10)
- availability_score (0-10)
- communication_score (0-10)
- trade_off_analysis_score (0-10)
- overall_score (0-100)
- summary (text)
- strengths (JSON array)
- weaknesses (JSON array)
- transcript (text)
- diagram_json (JSON)
- created_at (timestamp)
```

---

## **Testing the Grading**

### **Manual Test:**
1. Start an interview
2. Add components to diagram
3. Talk to agent about your design
4. End interview
5. Check console for grading logs
6. View results page

### **Console Logs to Watch:**
```
[Grading] Starting orchestration for assessment: ...
[Grading] Fetching problem details for assessment: ...
[Grading] Calling backend API to grade interview
[Grading] Interview graded successfully via backend API
[Grading] Results saved successfully
```

### **Troubleshooting:**
- Check backend server is running on port 3000
- Check Gemini API key is valid
- Check Eleven Labs API key has transcript permission
- Check Supabase connection
- Check database tables exist

---

## **Performance Notes**

- **Transcript fetch:** 3-9 seconds (with retries)
- **Grading:** 5-15 seconds (depends on Gemini response time)
- **Total grading time:** 10-30 seconds
- **User experience:** Loading spinner shown during grading

---

## **Files Involved**

- `frontend/src/services/grading.service.ts` - Orchestration logic
- `app/api/grade-interview/route.ts` - Backend API endpoint
- `backend/gemini-grader.ts` - Gemini grading service
- `supabase/functions/grade-interview/index.ts` - Edge Function (fallback)
- `frontend/src/pages/Interview/SystemDesignInterviewPage.tsx` - Interview page
