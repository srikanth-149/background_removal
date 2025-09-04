import React, { useRef } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-toastify'

const Upload = () => {
  const fileInputRef = useRef(null);
  const { processImage, isLoading } = useAppContext();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!isSignedIn) {
      toast.error('Please sign in to upload images');
      return;
    }

    // Process the image
    const success = await processImage(file);
    if (success) {
      navigate('/Result');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    if (!isSignedIn) {
      toast.error('Please sign in to upload images');
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className='pb-16'>
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent py-6 md:py-16'>
        See the Magic. Try now
      </h1>

      <div className='text-center mb-24'>
        <input 
          ref={fileInputRef}
          type='file' 
          accept='image/*'
          onChange={handleFileSelect}
          hidden
        />
        <button 
          onClick={handleUploadClick}
          disabled={isLoading}
          className={`inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-violet-400 to-fuchsia-500 m-auto hover:scale-105 transition-all duration-700 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <p className='text-white text-sm'>Processing...</p>
            </>
          ) : (
            <>
              <img width={20} src={assets.upload_btn_icon} alt="" />
              <p className='text-white text-sm'>Upload your Image</p>
            </>
          )}
        </button>
        
        {!isSignedIn && (
          <p className='text-gray-500 text-sm mt-4'>
            Please sign in to upload and process images
          </p>
        )}
      </div>
    </div>
  )
}

export default Upload
