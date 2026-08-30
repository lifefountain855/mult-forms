import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './pages/not-found';
import Survey from './pages/survey';
import Home from './pages/home';
import allSurveys from './assets/surveys.json';
// import './App.css'

function App() {

  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/survey1" element={<GridDisplays allPages={allPages} title="Websites — Asappy" root="asappy.tech"/>} /> */}
        {/* <Route path="/about" element={<About />} /> */}
        <Route path="*" element={<NotFound />} />
        {allSurveys.map(((survey,i)=>(<Route path={survey.link} element={<Survey survey={survey}></Survey>}></Route>)))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
