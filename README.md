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

- **🆕 Advanced Assessment Analytics API**
  - Comprehensive API analytics dashboard with endpoint management
  - Real-time performance metrics monitoring (CPU, Memory, Disk, Network)
  - API health monitoring with uptime tracking and security status
  - Advanced analytics with response time distribution and usage patterns
  - Real-time activity feed with live status updates
  - API key management with secure key handling and lifecycle tracking
  - Endpoint testing functionality with live response testing
  - Professional UI with glassmorphism design and animations

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

- **Frontend**: React 19, TypeScript, TailwindCSS, Material-UI
- **Backend**: Next.js 16, Node.js
- **AI/ML**: Google Gemini API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: WebSockets
- **Email**: Resend
- **Infrastructure**: Vercel, Supabase
- **Analytics**: Custom API Analytics Dashboard
- **UI Components**: Material-UI Icons, Glassmorphism Design System

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

## 🆕 API Analytics Dashboard

Our comprehensive API analytics system provides:

### **Real-time Monitoring**
- **Performance Metrics**: CPU, Memory, Disk, and Network usage
- **Response Time Analysis**: Distribution with color-coded indicators
- **Request Methods Breakdown**: GET, POST, PUT, DELETE percentages
- **Peak Usage Hours**: Time-based usage patterns with trend indicators

### **API Management**
- **Endpoint Tracking**: Comprehensive endpoint management with usage statistics
- **Health Monitoring**: Uptime tracking and security status monitoring
- **Key Management**: Secure API key lifecycle management
- **Testing Tools**: Live endpoint testing with response validation

### **Advanced Analytics**
- **Activity Feed**: Real-time API activity monitoring with status updates
- **Usage Trends**: Detailed usage pattern analysis
- **Error Tracking**: Comprehensive error monitoring and alerting
- **Rate Limiting**: Monitor and manage API rate limits

### **Professional UI**
- **Glassmorphism Design**: Modern, animated interface
- **Responsive Layout**: Optimized for all screen sizes
- **Interactive Components**: Hover effects and smooth transitions
- **Color-coded Indicators**: Visual status representation

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

### ✅ Completed Features (Latest Updates)
- [x] **Advanced Assessment Analytics API** - Comprehensive API management dashboard
- [x] **Real-time Performance Monitoring** - CPU, Memory, Disk, Network metrics
- [x] **API Health Monitoring** - Uptime tracking and security status
- [x] **Advanced Analytics Dashboard** - Response time distribution and usage patterns
- [x] **Real-time Activity Feed** - Live API activity monitoring
- [x] **API Key Management** - Secure key lifecycle management
- [x] **Professional UI Enhancement** - Glassmorphism design with animations

### Q2 2024
- [ ] Implement MCQ module
- [ ] Add LeetCode integration
- [ ] Enhance HR reporting dashboard
- [ ] Add team collaboration features

### Q3 2024
- [ ] Mobile app development
- [ ] Advanced proctoring features
- [ ] Integration with popular ATS

## 🔄 Recent Updates

### **Version 2.1.0** - API Analytics Suite
- **Added**: Comprehensive API analytics dashboard with endpoint management
- **Enhanced**: Real-time performance metrics monitoring
- **Improved**: API health monitoring with uptime tracking
- **New**: Advanced analytics with response time distribution
- **Added**: Real-time activity feed with live status updates
- **Implemented**: API key management with secure handling
- **Enhanced**: Professional UI with glassmorphism design

### **Key Improvements**
- **Performance**: Optimized dashboard loading and real-time updates
- **Security**: Enhanced API key management and authentication
- **User Experience**: Modern glassmorphism UI with smooth animations
- **Monitoring**: Comprehensive API health and performance tracking
- **Analytics**: Advanced usage patterns and trend analysis

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For inquiries, please contact [your-email@example.com](mailto:your-email@example.com)
