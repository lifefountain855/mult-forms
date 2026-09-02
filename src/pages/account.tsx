import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import UserProfile, { type SurveyData } from '../lib/User';
import { supabase } from '../lib/supabase';
import type { SurveyDefinition } from '../lib/surveys';

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '');
}

function AnswerList({ answers, questions }: { answers: Record<string, any>; questions: SurveyDefinition['questions'] }) {
  const labels = new Map(questions.map((question, index) => [question.id ?? `field_${index}`, question.question]));
  const entries = Object.entries(answers);

  if (entries.length === 0) return <p className="text-sm text-primary-500">No answers recorded.</p>;

  return (
    <dl className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg border border-primary-800 bg-primary-950/60 p-3">
          <dt className="text-xs text-primary-400">{labels.get(key) ?? key}</dt>
          <dd className="mt-1 text-sm text-primary-100">{formatAnswer(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Account({ surveys }: { surveys: SurveyDefinition[] }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    Promise.all([UserProfile.initLoad(), supabase.auth.getSession()]).then(([profile, sessionResult]) => {
      if (!mounted) return;
      setUser(profile);
      setEmail(sessionResult.data.session?.user?.email ?? null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-primary-300">Loading account...</div>;
  if (!user?.id) return <Navigate to="/auth" replace />;

  const surveyByLink = new Map(surveys.map((survey) => [survey.link, survey]));
  const states = Object.values(user.surveyData ?? {});

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-10 text-primary-100">
      <title>Asappy Surveys - Account</title>
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-300 hover:text-accent-300"><ArrowLeft className="size-4" />Home</Link>
        <button type="button" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="inline-flex items-center gap-2 rounded-lg border border-primary-600 px-3 py-2 text-sm hover:border-accent-400 hover:text-accent-200"><LogOut className="size-4" />Sign out</button>
      </div>
      <header>
        <h1 className="text-4xl">Your account</h1>
        <p className="mt-2 text-primary-400">{email}</p>
      </header>
      <section className="space-y-5">
        <h2 className="text-2xl">Previous answers</h2>
        {states.length === 0 && <p className="text-primary-400">You have not submitted any surveys yet.</p>}
        {states.map((state: SurveyData) => {
          const survey = surveyByLink.get(state.id);
          return (
            <article key={state.id} className="rounded-2xl border border-primary-700 bg-primary-900 p-5 shadow-xl">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="text-xl">{survey?.name ?? state.id}</h3><p className="text-sm text-primary-500">{state.submitTimes} submission{state.submitTimes === 1 ? '' : 's'}</p></div>
                {survey && <Link to={`/${survey.link}/start`} className="text-sm text-accent-300 hover:text-accent-200">View survey</Link>}
              </div>
              {state.submittedScreen && survey?.requiresScreen && <div className="mb-4"><h4 className="mb-2 text-sm font-medium text-primary-300">Screening answers</h4><AnswerList answers={state.screenData ?? {}} questions={survey.screen} /></div>}
              {state.submitted && <div><h4 className="mb-2 text-sm font-medium text-primary-300">Survey answers</h4><AnswerList answers={state.data ?? {}} questions={survey?.questions ?? []} /></div>}
            </article>
          );
        })}
      </section>
    </div>
  );
}
