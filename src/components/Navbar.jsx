import React from 'react'
import { NavLink } from 'react-router-dom'
import { logo, menu, close } from '../assets'

const Navbar = () => {
  return (
    <header className="header">
      <NavLink to="/" className="w-20 h-10 rounded-lg bg-white
        items-center justify-center flex font-bold shadow-md">
        <img src={logo} alt="logo" className="w-7 h-7 object" />
        <p className="w-1"></p>
        <p className="blue-gradient_text_logo"> JLG</p>
      </NavLink>
      <nav className='flex text-lg gap-7 font-medium'>
        <NavLink to="/about" className="w-20 h-10 rounded-lg bg-white
        items-center justify-center flex  font-bold shadow-md">
          <p className="blue-gradient_text_logo"> About</p>
        </NavLink>
        <NavLink to="/projects" className="w-30 h-10 rounded-lg bg-white
        items-center justify-center flex font-bold shadow-md">
          <p className="blue-gradient_text_logo"> Projects</p>
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar