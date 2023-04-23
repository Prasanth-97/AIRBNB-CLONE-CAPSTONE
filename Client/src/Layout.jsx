import React from 'react'
import Header from './Header';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className='py-4 p-8 flex flex-col min-h-screen'>
        <Header />
        <Outlet />
    </div>
  )
}

export default Layout