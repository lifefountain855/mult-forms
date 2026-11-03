import { supabase } from './supabase';

export interface SurveyResultRow {
  survey_key: string;
  submitted: boolean;
  submit_times: number;
  submitted_screen: boolean;
  passed_screen: boolean;
  survey_data: Record<string, unknown> | null;
}

export async function loadSurveyResults(): Promise<SurveyResultRow[]> {
  const { data, error } = await supabase
    .from('survey_state')
    .select('survey_key,submitted,submit_times,submitted_screen,passed_screen,survey_data');

  if (error) {
    throw new Error(`Failed to load survey results: ${error.message}`);
  }

  return (data ?? []) as SurveyResultRow[];
}
