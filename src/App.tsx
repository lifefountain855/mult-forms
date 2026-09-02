import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import NotFound from './pages/not-found';
import Survey from './pages/survey';
import Home from './pages/home';
import AuthPage from './pages/auth';
import { useEffect, useState } from 'react';
import { UseFavicon } from 'asappy-web-shared-ui'
import { loadSurveys, type SurveyDefinition } from './lib/surveys';

function AppRoutes({ surveys }: { surveys: SurveyDefinition[] }) {
  const location = useLocation();

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
            <Route path="/" element={<Home surveys={surveys} />} />
            <Route path="/auth" element={<AuthPage />} />
            {surveys.filter(survey=>survey.requiresScreen).map((survey) => (
              <Route
                key={`${survey.link}-screening`}
                path={`${survey.link}/screening`}
                element={<Survey survey={survey} route="screening" />}
              />
            ))}
            {surveys.map((survey) => (
              <Route
                key={`${survey.link}-start`}
                path={`${survey.link}/start`}
                element={<Survey survey={survey} route="start" />}
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys()
      .then(setSurveys)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center p-8 text-red-300">{error}</div>;
  }

  if (!surveys) {
    return <div className="flex min-h-screen items-center justify-center p-8 text-primary-300">Loading surveys...</div>;
  }

  return (
    <BrowserRouter>
      <AppRoutes surveys={surveys} />
    </BrowserRouter>
  )
}

export default App
