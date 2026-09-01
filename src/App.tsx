import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import NotFound from './pages/not-found';
import Survey from './pages/survey';
import Home from './pages/home';
import allSurveys from './assets/surveys.json';
import { UseFavicon } from 'asappy-web-shared-ui'

function AppRoutes() {
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
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
            {allSurveys.map((survey) => (
              <Route
                key={survey.link}
                path={survey.link}
                element={<Survey survey={survey} />}
              />
            ))}
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  UseFavicon("#195330")

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
