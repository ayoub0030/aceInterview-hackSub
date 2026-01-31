import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailNotificationRequest {
  candidateEmail: string;
  candidateName: string;
  assessmentId: string;
  assessmentType: string;
  score?: number;
  completedAt: string;
  companyName: string;
  adminEmail?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: EmailNotificationRequest = await request.json();
    
    console.log('[Notification] Sending completion notification for:', data.assessmentId);

    // Send notification to candidate
    const candidateEmailHtml = generateCandidateEmailHtml(data);
    const candidateEmailResponse = await resend.emails.send({
      from: `noreply@${process.env.COMPANY_DOMAIN || 'systema.com'}`,
      to: [data.candidateEmail],
      subject: `Your ${data.assessmentType} Assessment Results`,
      html: candidateEmailHtml,
    });

    // Send notification to admin (if provided)
    let adminEmailResponse = null;
    if (data.adminEmail) {
      const adminEmailHtml = generateAdminEmailHtml(data);
      adminEmailResponse = await resend.emails.send({
        from: `noreply@${process.env.COMPANY_DOMAIN || 'systema.com'}`,
        to: [data.adminEmail],
        subject: `Assessment Completed: ${data.candidateName}`,
        html: adminEmailHtml,
      });
    }

    console.log('[Notification] Emails sent successfully');
    
    return NextResponse.json({
      success: true,
      candidateEmailId: candidateEmailResponse.data?.id,
      adminEmailId: adminEmailResponse?.data?.id,
    });
  } catch (error: any) {
    console.error('[Notification] Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}

function generateCandidateEmailHtml(data: EmailNotificationRequest): string {
  const scoreColor = data.score ? (data.score >= 7 ? '#4caf50' : data.score >= 5 ? '#ff9800' : '#f44336') : '#757575';
  const scoreLabel = data.score ? (data.score >= 8 ? 'Excellent' : data.score >= 6 ? 'Good' : data.score >= 4 ? 'Average' : 'Needs Improvement') : 'Processing';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assessment Results</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #620045 0%, #3a1c2a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .score-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid ${scoreColor}; }
        .score { font-size: 48px; font-weight: bold; color: ${scoreColor}; margin: 10px 0; }
        .button { display: inline-block; background: #620045; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Assessment Completed!</h1>
          <p>Thank you for completing your ${data.assessmentType} assessment</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.candidateName},</p>
          <p>We're pleased to inform you that your assessment has been successfully completed and evaluated.</p>
          
          <div class="score-box">
            <h3>Your Overall Score</h3>
            <div class="score">${data.score ? data.score + '/10' : 'Processing...'}</div>
            <p style="color: ${scoreColor}; font-weight: bold;">${scoreLabel}</p>
          </div>
          
          <p><strong>Assessment Details:</strong></p>
          <ul>
            <li>Type: ${data.assessmentType}</li>
            <li>Completed: ${new Date(data.completedAt).toLocaleDateString()}</li>
            <li>Assessment ID: ${data.assessmentId}</li>
          </ul>
          
          <p>Your detailed results, including feedback and recommendations, are now available for review.</p>
          
          <a href="${process.env.APP_BASE_URL}/admin/results/${data.assessmentId}" class="button">
            View Full Results
          </a>
          
          <p>If you have any questions about your results or the assessment process, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>The ${data.companyName} Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent automatically. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminEmailHtml(data: EmailNotificationRequest): string {
  const urgency = data.score && data.score >= 8 ? 'high' : data.score && data.score >= 6 ? 'medium' : 'low';
  const urgencyColor = data.score && data.score >= 8 ? '#4caf50' : data.score && data.score >= 6 ? '#ff9800' : '#f44336';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assessment Completed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #620045 0%, #3a1c2a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor}; }
        .button { display: inline-block; background: #620045; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .badge { display: inline-block; background: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Assessment Completed</h1>
          <p>Candidate has finished their assessment</p>
        </div>
        
        <div class="content">
          <p>A candidate has completed their ${data.assessmentType} assessment. Here are the details:</p>
          
          <div class="info-box">
            <h3>Candidate Information</h3>
            <p><strong>Name:</strong> ${data.candidateName}</p>
            <p><strong>Email:</strong> ${data.candidateEmail}</p>
            <p><strong>Assessment Type:</strong> ${data.assessmentType}</p>
            <p><strong>Completed:</strong> ${new Date(data.completedAt).toLocaleString()}</p>
            <p><strong>Score:</strong> ${data.score ? data.score + '/10' : 'Processing...'}</p>
            <p><span class="badge">Priority: ${urgency}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_BASE_URL}/admin/results/${data.assessmentId}" class="button">
              View Full Results
            </a>
            <a href="${process.env.APP_BASE_URL}/admin/dashboard" class="button">
              Go to Dashboard
            </a>
          </div>
          
          <p><strong>Quick Actions:</strong></p>
          <ul>
            <li>Review detailed performance breakdown</li>
            <li>Compare with other candidates</li>
            <li>Send feedback to candidate</li>
            <li>Schedule follow-up interview if needed</li>
          </ul>
          
          <p>This is an automated notification from the ${data.companyName} assessment system.</p>
        </div>
        
        <div class="footer">
          <p>${data.companyName} Assessment Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
