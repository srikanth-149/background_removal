import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-toastify'

const Buycredit = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const { backendUrl, getUserCredits } = useAppContext()
  const { getToken, isSignedIn } = useAuth()

  // Fetch credit packages from backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/payment/packages`)
        const data = await response.json()
        
        if (data.success) {
          // Convert backend packages to frontend format
          const formattedPackages = Object.entries(data.data).map(([key, pkg]) => ({
            id: pkg.name,
            desc: pkg.description,
            price: pkg.price / 100, // Convert cents to dollars
            credits: pkg.credits,
            packageType: key
          }))
          setPackages(formattedPackages)
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
        // Fallback to static packages if API fails
        setPackages([
          {
            id: 'Basic Package',
            price: 5,
            credits: 10,
            desc: 'Best for personal use.',
            packageType: 'basic'
          },
          {
            id: 'Standard Package',
            price: 10,
            credits: 25,
            desc: 'Best for business use.',
            packageType: 'standard'
          },
          {
            id: 'Premium Package',
            price: 18,
            credits: 50,
            desc: 'Best for enterprise use.',
            packageType: 'premium'
          },
          {
            id: 'Enterprise Package',
            price: 30,
            credits: 100,
            desc: 'Best for large scale use.',
            packageType: 'enterprise'
          }
        ])
      }
    }

    fetchPackages()
  }, [backendUrl])

  const handlePurchase = async (packageType) => {
    if (!isSignedIn) {
      toast.error('Please sign in to purchase credits')
      return
    }

    try {
      setLoading(true)
      const token = await getToken()
      
      const response = await fetch(`${backendUrl}/api/payment/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageType })
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.data.url
      } else {
        toast.error(data.message || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      toast.error('Failed to process payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle successful payment (called from URL params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    
    if (sessionId) {
      const handlePaymentSuccess = async () => {
        try {
          const token = await getToken()
          const response = await fetch(`${backendUrl}/api/payment/success`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
          })

          const data = await response.json()
          
          if (data.success) {
            toast.success(`Payment successful! ${data.data.credits} credits added to your account.`)
            getUserCredits() // Refresh credits
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname)
          } else {
            toast.error(data.message || 'Payment verification failed')
          }
        } catch (error) {
          console.error('Error verifying payment:', error)
          toast.error('Payment verification failed')
        }
      }

      if (isSignedIn) {
        handlePaymentSuccess()
      }
    }
  }, [isSignedIn, getToken, backendUrl, getUserCredits])

  return (
    <div className='min-h-[80vh] text-center pt-14 mb-10'>
      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>Our plans</button>
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent mb-6 sm:mb-10'>
        Choose the right plan that's right for you
      </h1>
      
      {!isSignedIn && (
        <div className='mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto'>
          <p className='text-yellow-800 text-sm'>Please sign in to purchase credits</p>
        </div>
      )}

      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {packages.map((item, index) => (
          <div className='bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-700 hover:scale-105 transition-all' key={index}>
            <img width={40} src={assets.logo_icon} alt="" />
            <p className='mt-3 font-semibold'>{item.id}</p>
            <p className='text-sm'>{item.desc}</p>
            <p className='mt-6'>
              <span className='text-3xl font-medium'>${item.price}</span>/{item.credits} credits
            </p>
            <button 
              onClick={() => handlePurchase(item.packageType)}
              disabled={loading || !isSignedIn}
              className={`w-full mt-8 text-sm rounded-md py-2.5 min-w-52 transition-colors ${
                loading || !isSignedIn 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {loading ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Buycredit
