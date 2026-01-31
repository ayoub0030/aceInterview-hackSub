-- Add missing columns to design_assessment_results table for grading results

ALTER TABLE design_assessment_results
ADD COLUMN IF NOT EXISTS overall_score DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS weaknesses TEXT[] DEFAULT '{}';

-- Create index on assessment_id for faster queries
CREATE INDEX IF NOT EXISTS idx_design_assessment_results_assessment_id 
ON design_assessment_results(assessment_id);
