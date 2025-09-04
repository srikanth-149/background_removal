import React, { useState } from 'react';

const BgRemove = () => {
  const [file, setFile] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResultUrl('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/image/process', {
        method: 'POST',
        headers: {
          // Add auth header if needed
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResultUrl(data.data.processedImageUrl);
      } else {
        alert(data.message || 'Failed to process image');
      }
    } catch (err) {
      alert('Error uploading image');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Remove Background</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button disabled={!file || loading} onClick={handleUpload}>
        {loading ? 'Processing...' : 'Upload & Remove Background'}
      </button>
      {resultUrl && (
        <div>
          <h3>Result:</h3>
          <img src={resultUrl} alt="Processed" style={{ maxWidth: 400 }} />
        </div>
      )}
    </div>
  );
};

export default BgRemove;