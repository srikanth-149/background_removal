import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {
  const { openSignIn } = useClerk()
  const { isSignedIn, user } = useUser()
  const { credits, getUserCredits } = useAppContext()

  useEffect(() => {
    if (isSignedIn) {
      getUserCredits()
    }
  }, [isSignedIn])

  return (
    <div className='flex items-center justify-between mx-4 py-3 lg:mx-44'>
      <Link to='/'><img className='w-32 sm:w-44' src={assets.logo} alt="" /></Link>
      
      {isSignedIn ? (
        <div className='flex items-center gap-4'>
          <Link 
            to='/Buy' 
            className='flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-sm text-blue-600 hover:bg-blue-200 transition-colors'
          >
            <img className='w-4' src={assets.credit_icon} alt="" />
            <span>Credits: {credits}</span>
          </Link>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      ) : (
        <button 
          onClick={() => openSignIn({})} 
          className='bg-zinc-800 text-white flex items-center gap-4 px-4 py-2 sm:px-8 sm:py-3 text-sm rounded-full hover:bg-zinc-700 transition-colors'
        >
          Get Started <img className='w-3 sm:w-4' src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  )
}

export default Navbar
