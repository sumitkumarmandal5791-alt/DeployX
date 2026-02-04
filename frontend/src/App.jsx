import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/home'
import UserLoginPage from './pages/userlogin'
import UserSignUpPage from './pages/usersignup'
import Entere from "./pages/Enterpage"
import MapPage from './pages/MapPage'
import BinNavigatePage from './pages/BinNavigatePage'
import AdminDashboard from './pages/AdminDashboard'
import BadgesPage from './pages/BadgesPage'

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage></HomePage>}></Route>
        <Route path="/enter" element={<Entere></Entere>}></Route>
        <Route path="/userlogin" element={<UserLoginPage></UserLoginPage>}></Route>
        <Route path="/map" element={<MapPage></MapPage>}></Route>
        <Route path="/map/navigate" element={<BinNavigatePage></BinNavigatePage>}></Route>
        <Route path="/admin" element={<AdminDashboard></AdminDashboard>}></Route>
        <Route path="/badges" element={<BadgesPage></BadgesPage>}></Route>
      </Routes>
    </>
  )
}

export default App
