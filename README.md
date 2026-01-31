# AceUp Interview Platform

A comprehensive technical interview platform with AI-powered proctoring, automated grading, and multiple assessment types for efficient technical hiring.

## 🚀 Features

### Current Features

- **AI-Powered System Design Interviews**
  - Interactive system design whiteboard
  - Real-time collaboration
  - AI-assisted guidance and feedback
  - Automated grading on 5 key pillars

- **AI Proctoring**
  - Real-time webcam monitoring
  - Suspicious activity detection
  - Tab switching detection
  - Behavioral analysis

- **Interview Management**
  - Candidate invitation system
  - Interview scheduling
  - Results dashboard
  - Detailed performance analytics

### Upcoming Features

- **Multiple Choice Questions (MCQ) Module**
  - Customizable question banks
  - Automated scoring
  - Time-limited assessments
  - Topic-wise performance analysis

- **LeetCode Integration**
  - Direct coding environment
  - Real-time code execution
  - Automated test case validation
  - Plagiarism detection

- **Enhanced HR Reporting**
  - Comprehensive candidate profiles
  - Skill gap analysis
  - Team/Department performance metrics
  - Exportable reports (PDF/Excel)
  - Customizable assessment templates

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: Next.js 16, Node.js
- **AI/ML**: Google Gemini API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: WebSockets
- **Email**: Resend
- **Infrastructure**: Vercel, Supabase

## 📊 Enhanced HR Reporting

Our upcoming HR reporting system will provide:

1. **Candidate Performance Dashboard**
   - Overall score breakdown
   - Time spent on each section
   - Comparison with other candidates
   - Strengths and weaknesses analysis

2. **Team Analytics**
   - Hiring funnel visualization
   - Time-to-hire metrics
   - Interviewer effectiveness
   - Question bank performance

3. **Exportable Reports**
   - Custom report generation
   - PDF/Excel export options
   - Scheduled report delivery
   - API access for HRIS integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/aceup-interview.git
   cd aceup-interview
   ```

2. Install dependencies
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
   
   # Gemini AI
   GEMINI_API_KEY=your-gemini-key
   
   # Email
   RESEND_API_KEY=your-resend-key
   
   # App
   APP_BASE_URL=http://localhost:3000
   COMPANY_NAME="Your Company"
   ```

4. Start the development server
   ```bash
   # From root directory
   npm run dev
   ```

## 📈 Roadmap

### Q2 2024
- [ ] Implement MCQ module
- [ ] Add LeetCode integration
- [ ] Enhance HR reporting dashboard
- [ ] Add team collaboration features

### Q3 2024
- [ ] Mobile app development
- [ ] Advanced proctoring features
- [ ] Integration with popular ATS

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For inquiries, please contact [your-email@example.com](mailto:your-email@example.com)
