import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

const Result = () => {
  const { 
    originalImage, 
    processedImage, 
    isLoading, 
    downloadImage, 
    resetProcessing 
  } = useAppContext();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not signed in or no processed image
    if (!isSignedIn || (!originalImage && !isLoading)) {
      navigate('/');
    }
  }, [isSignedIn, originalImage, isLoading, navigate]);

  const handleTryAnother = () => {
    resetProcessing();
    navigate('/');
  };

  const handleDownload = () => {
    if (processedImage) {
      downloadImage(processedImage, 'background-removed.png');
    }
  };

  if (!originalImage && !isLoading) {
    return (
      <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh] flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-600 mb-4'>No image to process</h2>
          <button 
            onClick={() => navigate('/')}
            className='px-8 py-2.5 text-white text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700'
          >
            Upload an Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>
      <div className='bg-white rounded-lg px-8 py-6 drop-shadow-sm'>

        {/*-------image container------*/}
        <div className='flex flex-col sm:grid grid-cols-2 gap-8'>

          <div>
            <p className='font-semibold text-gray-600 mb-2'>Original</p>
            {originalImage ? (
              <img 
                className='rounded-md border w-full h-auto max-h-96 object-contain' 
                src={originalImage} 
                alt="Original" 
              />
            ) : (
              <div className='rounded-md border border-gray-300 h-96 flex items-center justify-center bg-gray-50'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600'></div>
              </div>
            )}
          </div>

          <div className='flex flex-col'>
            <p className='font-semibold text-gray-600 mb-2'>Background removed</p>
            <div className='rounded-md border border-gray-300 h-full relative bg-layer overflow-hidden min-h-96'>
              {processedImage ? (
                <img 
                  className='w-full h-auto max-h-96 object-contain' 
                  src={processedImage} 
                  alt="Background removed" 
                />
              ) : (
                <div className='absolute right-1/2 bottom-1/2 transform translate-x-1/2 translate-y-1/2'>
                  <div className='border-4 border-violet-600 rounded-full h-12 w-12 border-t-transparent animate-spin'></div>
                  <p className='text-gray-600 text-sm mt-4 text-center'>Processing...</p>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className='flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-6'>
          <button 
            onClick={handleTryAnother}
            className='px-8 py-2.5 text-violet-600 text-sm border border-violet-600 rounded-full hover:scale-105 transition-all duration-700'
          >
            Try another Image
          </button>
          
          {processedImage ? (
            <button 
              onClick={handleDownload}
              className='px-8 py-2.5 text-white text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700'
            >
              Download
            </button>
          ) : (
            <button 
              disabled
              className='px-8 py-2.5 text-white text-sm bg-gray-400 rounded-full cursor-not-allowed'
            >
              Processing...
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default Result
