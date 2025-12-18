import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import LandingPage from "./pages/LandingPage"
import ChangePass from "./pages/ChangePassPage"
import ForgotPass from "./pages/ForgotPassPage"
import FindFlightPage from "./pages/FindFlightPage"
import AirportPage from "./pages/AirportPage"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/change" element={<ChangePass />} />
        <Route path="/forgot" element={<ForgotPass />} />
        <Route path="/find" element={<FindFlightPage />} />
        <Route path="/airports" element={<AirportPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
