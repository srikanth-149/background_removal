import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { getToken, isSignedIn, user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Get user credits
  const getUserCredits = async () => {
    try {
      if (!isSignedIn) return;
      
      const token = await getToken();
      const response = await fetch(`${backendUrl}/api/user/credits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCredits(data.data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Process image
  const processImage = async (imageFile) => {
    try {
      if (!isSignedIn) {
        toast.error('Please sign in to process images');
        return false;
      }

      if (credits < 1) {
        toast.error('Insufficient credits. Please purchase more credits.');
        return false;
      }

      setIsLoading(true);
      const token = await getToken();
      
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${backendUrl}/api/image/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setOriginalImage(data.data.originalImageUrl);
        setProcessedImage(data.data.processedImageUrl);
        setCredits(data.data.remainingCredits);
        toast.success('Background removed successfully!');
        return true;
      } else {
        toast.error(data.message || 'Failed to process image');
        return false;
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Download processed image
  const downloadImage = (imageUrl, filename = 'processed-image.png') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset processing state
  const resetProcessing = () => {
    setProcessedImage(null);
    setOriginalImage(null);
  };

  const value = {
    credits,
    isLoading,
    processedImage,
    originalImage,
    isSignedIn,
    user,
    getUserCredits,
    processImage,
    downloadImage,
    resetProcessing,
    backendUrl
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

