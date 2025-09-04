import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useAuth } from "@clerk/clerk-react"; // or your auth provider

const Header = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedUrl, setProcessedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth(); // getToken returns a promise

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setProcessedUrl('');
  };

  // Handle upload and processing
  const handleProcess = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const token = await getToken(); // get the access token
      const res = await fetch('http://localhost:5000/api/image/process', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setProcessedUrl(data.data.processedImageUrl);
      } else {
        alert(data.message || 'Failed to process image');
      }
    } catch (err) {
      alert('Error uploading image');
    }
    setLoading(false);
  };

  // Handle download
  const handleDownload = async () => {
    if (!processedUrl) return;
    try {
      const response = await fetch(processedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'processed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download image');
    }
  };

  return (
    <div className='flex items-center justify-between max-sm:flex-col-reverse gap-y-10 px-4 mt-10 lg:px-44 sm:mt-20'>
      {/*------left-------*/}
      <div>
        <h1 className='text-4xl xl:text-5xl 2xl:text-6xl font-black text-neutral-700 leading-tight'>
          Remove the <br className='max-md:hidden' /> <span className='bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent'>Background</span> from <br className='max-md:hidden' /> images for free
        </h1>
        <p className='my-6 text-[15px] text-gray-500'>Lorem Ipsum is simply dummy text of the printing and typesetting industry.<br className='max-sm:hidden' /> Lorem Ipsum has been the industry's standard dummy text ever.</p>
        <div>
          <input type='file' id='upload1' hidden onChange={handleFileChange} />
          <label className='inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-violet-400 to-fuchsia-500 m-auto hover:scale-105 transition-all duration-700' htmlFor='upload1'>
            <img width={20} src={assets.upload_btn_icon} alt="" />
            <p className='text-white text-sm'>Upload your Image</p>
          </label>
          {selectedFile && (
            <button
              className='ml-4 px-6 py-2 rounded-full bg-violet-600 text-white'
              onClick={handleProcess}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Process Image'}
            </button>
          )}
        </div>
        {processedUrl && (
          <div className='mt-6'>
            <h3 className='mb-2'>Processed Image:</h3>
            <img src={processedUrl} alt="Processed" style={{ maxWidth: 400, background: 'transparent' }} />
            <button
              className='mt-4 px-6 py-2 rounded-full bg-fuchsia-500 text-white'
              onClick={handleDownload}
            >
              Download Image
            </button>
          </div>
        )}
      </div>
      {/*------right-------*/}
      <div className='w-full max-w-md'>
        <img src={assets.header_img} alt="" />
      </div>
    </div>
  );
};

export default Header;
