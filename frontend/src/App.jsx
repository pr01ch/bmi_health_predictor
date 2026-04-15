import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './components/HomePage'
import BMICalculator from './components/BMICalculator'
import GeneralSurvey from './components/GeneralSurvey'
import DynamicSurvey from './components/DynamicSurvey'
import Results from './components/Results'
import Chatbot from './components/Chatbot'
import './index.css'

function AppRoutes() {
  const [userData, setUserData] = useState({})

  const updateData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }))
  }

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assess" element={<BMICalculator updateData={updateData} />} />
          <Route path="/survey" element={<GeneralSurvey updateData={updateData} data={userData} />} />
          <Route path="/dynamic-survey" element={<DynamicSurvey updateData={updateData} data={userData} />} />
          <Route path="/results" element={<Results data={userData} />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
