
import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import Navbar from './components/Navbar'

import Standings from './pages/Standings'
import TeamsMatches from './pages/TeamsMatches'
import Statistics from './pages/Statistics'

function App() {
  return (
    <>
      <Header />
      <Navbar />

      <Routes>
        <Route path="/" element={<Standings />} />
        <Route path="/teams" element={<TeamsMatches />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </>
  )
}

export default App
