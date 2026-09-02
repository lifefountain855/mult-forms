import { supabase } from './supabase';
import type { FormQuestion } from '../components/form';

export interface SurveyDefinition {
  link: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  author: string | null;
  visible: boolean;
  requiresScreen: boolean;
  allowedSubmits: number;
  publishStamp: [number, number, number];
  screen: FormQuestion[];
  questions: FormQuestion[];
}

interface SurveyRow {
  link: string;
  name: string;
  description: string | null;
  long_description: string | null;
  author: string | null;
  visible: boolean;
  requires_screen: boolean;
  allowed_submits: number;
  publish_year: number | null;
  publish_month: number | null;
  publish_day: number | null;
  screen: FormQuestion[] | null;
  questions: FormQuestion[] | null;
}

export async function loadSurveys(): Promise<SurveyDefinition[]> {
  const { data, error } = await supabase
    .from('surveys')
    .select('link,name,description,long_description,author,visible,requires_screen,allowed_submits,publish_year,publish_month,publish_day,screen,questions')
    .order('publish_year', { ascending: false })
    .order('publish_month', { ascending: false })
    .order('publish_day', { ascending: false });

  if (error) {
    throw new Error(`Failed to load surveys: ${error.message}`);
  }

  return ((data ?? []) as SurveyRow[]).map((row) => ({
    link: row.link,
    name: row.name,
    description: row.description,
    longDescription: row.long_description,
    author: row.author,
    visible: row.visible,
    requiresScreen: row.requires_screen,
    allowedSubmits: row.allowed_submits,
    publishStamp: [row.publish_day ?? 1, row.publish_month ?? 1, row.publish_year ?? 1970],
    screen: row.screen ?? [],
    questions: row.questions ?? [],
  }));
}
