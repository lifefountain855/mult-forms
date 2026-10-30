import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NotFound from './pages/not-found';
import Survey from './pages/survey';
import Home from './pages/home';
import AuthPage from './pages/auth';
import AdminPage from './pages/admin';
import Account from './pages/account';
import { useEffect, useState } from 'react';
import { UseFavicon } from 'asappy-web-shared-ui'
import { loadSurveys, type SurveyDefinition } from './lib/surveys';
import type { SurveyData } from './lib/User';

const DEFAULT_SURVEYS: SurveyDefinition[] = [
  {
    link: "test",
    name: "test",
    description: "Market research for a functional chemical resale company focused on students.",
    longDescription: "Market research for a functional chemical resale company focused on students.",
    author: "yours truly",
    visible: true,
    requiresScreen: true,
    allowedSubmits: 1,
    publishStamp: [2, 9, 2026],
    screen: [{"id": "q_US", "type": "radio", "allowed": ["yes"], "options": {"a": "yes", "f": "no"}, "question": "Do you live in the united states?"}, {"id": "q_IDFL", "type": "dropdown", "allowed": ["id", "fl"], "options": {"ak": "Alaska", "al": "Alabama", "ar": "Arkansas", "az": "Arizona", "ca": "California", "co": "Colorado", "ct": "Connecticut", "de": "Delaware", "fl": "Florida", "ga": "Georgia", "hi": "Hawaii", "ia": "Iowa", "id": "Idaho", "il": "Illinois", "in": "Indiana", "ks": "Kansas", "ky": "Kentucky", "la": "Louisiana", "ma": "Massachusetts", "md": "Maryland", "me": "Maine", "mi": "Michigan", "mn": "Minnesota", "mo": "Missouri", "ms": "Mississippi", "mt": "Montana", "nc": "North Carolina", "nd": "North Dakota", "ne": "Nebraska", "nh": "New Hampshire", "nj": "New Jersey", "nm": "New Mexico", "nv": "Nevada", "ny": "New York", "oh": "Ohio", "ok": "Oklahoma", "or": "Oregon", "pa": "Pennsylvania", "ri": "Rhode Island", "sc": "South Carolina", "sd": "South Dakota", "tn": "Tennessee", "tx": "Texas", "ut": "Utah", "va": "Virginia", "vt": "Vermont", "wa": "Washington", "wi": "Wisconsin", "wv": "West Virginia", "wy": "Wyoming"}, "question": "If yes, what state do you live in?", "dependsOn": {"value": "yes", "questionIndex": 0}}],
    questions:	[{"id": "q_often", "type": "multi", "question": "How often do you clean your apartment?", "subtypeM": "freq1"}, {"id": "q_7", "type": "multi", "question": "How often do you clean your apartment?", "subtypeM": "freq2"}]
  }
];

function AppRoutes({ surveys, databaseAvailable }: { surveys: SurveyDefinition[]; databaseAvailable: boolean }) {
  const location = useLocation();
  const [offlineSurveyStates, setOfflineSurveyStates] = useState<Record<string, SurveyData>>({});

  const isHome = location.pathname === '/';
  

  // Main Page (/): Enters from top (-y), exits to bottom (+y)
  // Subpages (*): Enter from bottom (+y), exit to top (-y)
  const pageVariants = {
    initial: {
      opacity: 0,
      y: isHome ? -80 : 80,
      filter: 'blur(7px)'
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)'
    },
    exit: {
      opacity: 0,
      y: isHome ? -80 : 80,
      filter: 'blur(7px)',
      backgroundColor: 'var(--color-primary-950)'
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-950)] text-primary-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.22, 0.75, 0.36, 1] }}
          className="min-h-screen bg-[var(--color-primary-950)]"
        >
          <Routes location={location}>
            <Route path="/" element={<Home surveys={surveys} databaseAvailable={databaseAvailable} />} />
            <Route path="/auth" element={databaseAvailable ? <AuthPage /> : <Navigate to="/" replace />} />
            <Route path="/admin/results" element={databaseAvailable ? <AdminPage surveys={surveys} /> : <Navigate to="/" replace />} />
            <Route path="/account" element={databaseAvailable ? <Account surveys={surveys} /> : <Navigate to="/" replace />} />
            {surveys.filter(survey=>survey.requiresScreen).map((survey) => (
              <Route
                key={`${survey.link}-screening`}
                path={`${survey.link}/screening`}
                element={
                  <Survey
                    survey={survey}
                    route="screening"
                    databaseAvailable={databaseAvailable}
                    offlineSurveyState={offlineSurveyStates[survey.link]}
                    onOfflineSurveyStateChange={(state) => setOfflineSurveyStates((current) => ({ ...current, [survey.link]: state }))}
                  />
                }
              />
            ))}
            {surveys.map((survey) => (
              <Route
                key={`${survey.link}-start`}
                path={`${survey.link}/start`}
                element={
                  <Survey
                    survey={survey}
                    route="start"
                    databaseAvailable={databaseAvailable}
                    offlineSurveyState={offlineSurveyStates[survey.link]}
                    onOfflineSurveyStateChange={(state) => setOfflineSurveyStates((current) => ({ ...current, [survey.link]: state }))}
                  />
                }
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  UseFavicon("#195330")
  const [surveys, setSurveys] = useState<SurveyDefinition[] | null>(null);
  const [databaseAvailable, setDatabaseAvailable] = useState(false);

  useEffect(() => {
    loadSurveys()
      .then((loadedSurveys) => {
        setSurveys(loadedSurveys);
        setDatabaseAvailable(true);
      })
      .catch(() => {
        setSurveys(DEFAULT_SURVEYS);
        setDatabaseAvailable(false);
      });
    }, []);

  if (!surveys) {
    return <div className="flex min-h-screen items-center justify-center p-8 text-primary-300">Loading surveys...</div>;
  }

  return (
    <BrowserRouter>
      <AppRoutes surveys={surveys} databaseAvailable={databaseAvailable} />
    </BrowserRouter>
  )
}

export default App
