import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, LogOut, ShieldAlert } from 'lucide-react';
import UserProfile from '../lib/User';
import { supabase } from '../lib/supabase';
import { loadSurveyResults, type SurveyResultRow } from '../lib/survey-results';
import type { SurveyDefinition } from '../lib/surveys';

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined || value === '') return 'No answer';
  return String(value);
}

export default function AdminPage({ surveys }: { surveys: SurveyDefinition[] }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [results, setResults] = useState<SurveyResultRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const nextProfile = await UserProfile.initLoad();
      if (!mounted) return;
      setProfile(nextProfile);
      setAuthChecked(true);
      if (!nextProfile.admin) return;
      try {
        setResults(await loadSurveyResults());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load survey results.');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const grouped = useMemo(() => surveys.map((survey) => {
    const surveyResults = results.filter((result) => result.survey_key === survey.link);
    const submitted = surveyResults.filter((result) => result.submitted);
    const answerCounts = new Map<string, Map<string, number>>();

    for (const result of submitted) {
      for (const question of survey.questions) {
        const key = question.id ?? `field_${survey.questions.indexOf(question)}`;
        const value = result.survey_data?.[key];
        if (value === undefined || value === null || value === '') continue;
        const questionCounts = answerCounts.get(key) ?? new Map<string, number>();
        const values = Array.isArray(value) ? value : [value];
        for (const answer of values) {
          const answerKey = formatAnswer(answer);
          questionCounts.set(answerKey, (questionCounts.get(answerKey) ?? 0) + 1);
        }
        answerCounts.set(key, questionCounts);
      }
    }

    return { survey, results: surveyResults, submitted, answerCounts };
  }), [results, surveys]);

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center text-primary-300">Checking admin access...</div>;
  }
  if (!profile?.id) return <Navigate to="/auth" replace />;
  if (!profile.admin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen px-5 py-8 text-primary-100 sm:px-10">
      <title>Asappy Surveys - Admin results</title>
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-300 hover:text-accent-300">
            <ArrowLeft className="size-4" /> Home
          </Link>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-600 px-4 py-2 text-sm hover:border-accent-400"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
        <div className="mb-8">
          <p className="mb-2 inline-flex items-center gap-2 text-sm text-accent-300"><BarChart3 className="size-4" /> Admin only</p>
          <h1 className="text-4xl sm:text-5xl">Survey results</h1>
          <p className="mt-2 max-w-2xl text-primary-400">Aggregated responses only. User identities and contact details are never displayed.</p>
        </div>
        {error && <p className="mb-6 rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-300">{error}</p>}
        <div className="space-y-6">
          {grouped.map(({ survey, results: surveyResults, submitted, answerCounts }) => (
            <section key={survey.link} className="rounded-2xl border border-primary-700 bg-primary-900/70 p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div><h2 className="text-2xl">{survey.name}</h2><p className="text-sm text-primary-400">{survey.link}</p></div>
                <div className="text-right text-sm text-primary-300">
                  <p><strong className="text-primary-100">{submitted.length}</strong> submitted</p>
                  <p><strong className="text-primary-100">{surveyResults.length}</strong> started</p>
                </div>
              </div>
              {survey.questions.length === 0 || submitted.length === 0 ? (
                <p className="text-primary-400">No submitted responses yet.</p>
              ) : (
                <div className="space-y-5">
                  {survey.questions.map((question, index) => {
                    const key = question.id ?? `field_${index}`;
                    const counts = answerCounts.get(key);
                    const isFreeText = question.type === 'text' || question.type === 'textarea';
                    return (
                      <div key={key} className="border-t border-primary-800 pt-4">
                        <p className="font-medium">{question.question}</p>
                        {isFreeText ? (
                          <p className="mt-1 text-sm text-primary-400">{[...counts?.values() ?? []].reduce((sum, count) => sum + count, 0)} responses (text content hidden)</p>
                        ) : counts && counts.size > 0 ? (
                          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                            {[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([answer, count]) => <li key={answer} className="flex justify-between rounded-lg bg-primary-800 px-3 py-2 text-sm"><span>{answer}</span><span className="text-accent-300">{count}</span></li>)}
                          </ul>
                        ) : <p className="mt-1 text-sm text-primary-500">No answers</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
        <p className="mt-8 inline-flex items-center gap-2 text-xs text-primary-500"><ShieldAlert className="size-4" /> Results are available only to accounts marked as administrators.</p>
      </div>
    </div>
  );
}
