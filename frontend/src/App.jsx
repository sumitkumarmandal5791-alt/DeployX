import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/home'
import UserLoginPage from './pages/userlogin'
import UserSignUpPage from './pages/usersignup'
import MapPage from './pages/MapPage'
import BinNavigatePage from './pages/BinNavigatePage'
import AdminDashboard from './pages/AdminDashboard'
import BadgesPage from './pages/BadgesPage'
import ScannerPage from './pages/ScannerPage'
import AnalysisPage from './pages/AnalysisPage'
import RecycleSuccessPage from './pages/RecycleSuccessPage'
import LearnMorePage from './pages/LearnMorePage'

import RewardsPage from './pages/RewardsPage'
import Layout from './components/Layout'
import { useThemeStore } from './store/themeStore'

function App() {
  const { isDark } = useThemeStore();

  // Apply dark class to document root for global dark mode
  useEffect(() => {
    console.log("App: isDark changed to:", isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Layout>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<UserLoginPage />} />
        <Route path="/usersignup" element={<UserSignUpPage />} />

        {/* Main App Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/map/navigate" element={<BinNavigatePage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/success" element={<RecycleSuccessPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/learn-more" element={<LearnMorePage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Layout>
  )
}

export default App
