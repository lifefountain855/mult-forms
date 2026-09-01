import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import NotFound from './pages/not-found';
import Survey from './pages/survey';
import Home from './pages/home';
import allSurveys from './assets/surveys.json';
import { UseFavicon } from 'asappy-web-shared-ui'

function AppRoutes() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-mist-950)] text-primary-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)', backgroundColor: 'var(--color-mist-950)' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen bg-[var(--color-mist-950)]"
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
  )
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
