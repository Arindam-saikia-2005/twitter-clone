import React from 'react'
// Pages
import HomePage from "./pages/Home/HomePage.jsx";
import SignInPage from './pages/Auth/signin/SignInPage.jsx';
import LoginPage from "./pages/Auth/Login/LoginPage.jsx";
import NotificationPage from './pages/notification/NotificationPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';

// components
import Sidebar from './components/common/Sidebar.jsx';
import RightPanel from './components/common/RightPanel.jsx';

import { Routes,Route, Navigate } from "react-router-dom"
import  { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';


function App() {

  const {data:authUser,isLoading } = useQuery({
    queryKey:['authUser'],
    queryFn:async () => {
      try {
        const res = await fetch("/api/auth/me",{
          method:"GET",
          credentials: "include", 
        });
        
        const data = await res.json()
        if(data.error) return null
        if(!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }
        console.log("auth user is here",data);
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    retry:false
  })

  if(isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
          <LoadingSpinner size='lg'/>
      </div>
    )
  }


  return (
    <div className='flex max-w-6xl mx-auto'>
       { authUser && <Sidebar/>}
       <Toaster/>
       <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login" />} />
        <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to="/" />}/>
        <Route path='/signin' element={!authUser ?<SignInPage/> : <Navigate to="/"/>}/>
        <Route path='/notifications' element={authUser ? <NotificationPage/> : <Navigate to="/login" />}/>
        <Route path='/profile/:username' element={authUser ? <ProfilePage/> : <Navigate to="/login" />}/>
        </Routes>
       {authUser && <RightPanel/>}
    </div>
  )
}

export default App