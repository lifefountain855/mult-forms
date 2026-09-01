import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './pages/not-found';
import Survey from './pages/survey';
import Home from './pages/home';
import allSurveys from './assets/surveys.json';
import { UseFavicon } from 'asappy-web-shared-ui'
// import './App.css'

function App() {
  UseFavicon("#195330")
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        {allSurveys.map(((survey,i)=>(<Route path={survey.link} element={<Survey survey={survey}></Survey>}></Route>)))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
