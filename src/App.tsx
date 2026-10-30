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
    link: "hi2.3",
    name: "hi2.3",
    description: "Market research for a functional chemical resale company focused on students.",
    longDescription: "Market research for a functional chemical resale company focused on students.",
    author: "yours truly",
    visible: true,
    requiresScreen: false,
    allowedSubmits: 1,
    publishStamp: [2, 9, 2026],
    screen: [],
    questions: [
      {
        id: "q_12",
        type: "multi",
        question: "How often do you clean your apartment?",
        subtypeM: "freq1"
      }
    ]
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
