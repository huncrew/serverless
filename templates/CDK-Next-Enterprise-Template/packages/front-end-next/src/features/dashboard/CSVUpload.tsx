"use client";
// src/features/dashboard/CSVUpload.tsx

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const { user } = useUser();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0] as any);
    }
  };

  const handleUpload = async () => {
    if (file && user) {
      const newJobId = uuidv4();

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AWS_API_URL}/upload-csv`, {
          method: 'POST',
          body: file,
          headers: {
            'X-Job-Id': newJobId,
            'X-User-Id': user.id,
            'Content-Type': 'text/csv',
          },
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        setUploadStatus(`Upload successful: ${newJobId}`);
        setFile(null); // Reset the file input after successful upload
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus('Upload failed');
      }
    }
  };

  return (
    <div className="bg-card p-4 rounded-md w-full">
      <h2 className="text-lg font-semibold text-primary">Upload CSV</h2>
      <div className="mt-2 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".csv"
          className="flex-1 text-sm text-muted-foreground
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-primary-foreground
            hover:file:bg-primary/80"
        />
        <button
          onClick={handleUpload}
          disabled={!file}
          className={`px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md 
            ${!file ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/80'}`}
        >
          Upload CSV
        </button>
      </div>
      {uploadStatus && (
        <p className="mt-2 text-sm text-muted-foreground">
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
