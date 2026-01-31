import { NextRequest, NextResponse } from 'next/server'
import { GeminiGradingService } from '@/backend/gemini-grader'

interface GradingInput {
  problemDescription: string
  rubric: string
  transcript: string
  diagramJson: {
    nodes: Array<{ id: string; label: string; type?: string }>
    edges: Array<{ source: string; target: string; label?: string }>
  }
  assessment_id: string
}

// CORS headers for cross-origin requests from frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const input: GradingInput = await request.json()

    console.log('[API] Grading interview for assessment:', input.assessment_id)
    console.log('[API] Transcript length:', input.transcript.length)
    console.log('[API] Diagram nodes:', input.diagramJson.nodes.length)

    // Initialize Gemini grading service
    const grader = new GeminiGradingService()

    // Grade the interview
    const results = await grader.gradeInterview({
      problemDescription: input.problemDescription,
      rubric: input.rubric,
      transcript: input.transcript,
      diagramJson: input.diagramJson
    })

    console.log('[API] Grading completed, overall score:', results.overall_score)

    return NextResponse.json(results, { headers: corsHeaders })
  } catch (error: any) {
    console.error('[API] Grading error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to grade interview' },
      { status: 500, headers: corsHeaders }
    )
  }
}
