import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setUserEmail(data.session?.user?.email ?? null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUserEmail(session?.user?.email ?? null);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const resetStatus = () => {
    setError(null);
    setMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setMessage('Signed in successfully.');
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setMessage('Account created. Check your inbox for confirmation email.');
    setEmail('');
    setPassword('');
    setFullName('');
    setLoading(false);
  };

  const handleSignOut = async () => {
    resetStatus();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
      return;
    }

    setUserEmail(null);
    setMessage('Signed out.');
  };

  if (userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 text-primary-100">
        <div className="w-full max-w-md rounded-2xl border border-primary-700 bg-primary-900 p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-300 hover:text-accent-300">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Signed in</h1>
            <p className="text-primary-300">{userEmail}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-600 bg-primary-800 px-4 py-3 font-medium text-primary-100 transition hover:border-accent-400 hover:text-accent-200"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 text-primary-100">
      <div className="w-full max-w-md rounded-2xl border border-primary-700 bg-primary-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
          <Link to="/" className="inline-flex items-center gap-2 text-primary-300 hover:text-accent-300">
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>

        <div className="mb-6 inline-flex rounded-lg border border-primary-700 bg-primary-950 p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded-md px-4 py-2 text-sm ${mode === 'signin' ? 'bg-accent-500 text-primary-950' : 'text-primary-300'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-md px-4 py-2 text-sm ${mode === 'signup' ? 'bg-accent-500 text-primary-950' : 'text-primary-300'}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-sm text-primary-300">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-primary-600 bg-primary-950 px-3 py-2 text-primary-100 outline-none placeholder:text-primary-500 focus:border-accent-400"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-primary-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-primary-600 bg-primary-950 px-3 py-2 text-primary-100 outline-none placeholder:text-primary-500 focus:border-accent-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-primary-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-primary-600 bg-primary-950 px-3 py-2 text-primary-100 outline-none placeholder:text-primary-500 focus:border-accent-400"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {message && <p className="text-sm text-accent-200">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 font-medium text-primary-950 transition hover:bg-accent-400 disabled:opacity-60"
          >
            <LogIn className="size-4" />
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
