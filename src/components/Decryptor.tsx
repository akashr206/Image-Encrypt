import React, { useState, useRef } from 'react';
import { UploadCloud, Unlock, Eye, KeyRound } from 'lucide-react';
import { decryptData } from '../utils/crypto';

export const Decryptor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptedImageUrl, setDecryptedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.vault')) {
        setFile(droppedFile);
        setError(null);
        setDecryptedImageUrl(null);
      } else {
        setError('Please upload a valid .vault file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.vault')) {
        setFile(selectedFile);
        setError(null);
        setDecryptedImageUrl(null);
      } else {
        setError('Please upload a valid .vault file.');
      }
    }
  };

  const handleDecrypt = async () => {
    if (!file) {
      setError('Please select an encrypted file first.');
      return;
    }
    if (!password) {
      setError('Please enter the decryption key.');
      return;
    }

    try {
      setIsDecrypting(true);
      setError(null);
      
      const arrayBuffer = await file.arrayBuffer();
      const decryptedBuffer = await decryptData(arrayBuffer, password);
      
      // Assume it's an image
      const blob = new Blob([decryptedBuffer], { type: 'image/*' });
      const url = URL.createObjectURL(blob);
      setDecryptedImageUrl(url);
    } catch (err: any) {
      setError(err.message || 'Decryption failed. Incorrect password or corrupted file.');
      setDecryptedImageUrl(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {!decryptedImageUrl ? (
        <>
          <div 
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="icon" />
            <p>{file ? file.name : 'Drag & drop your .vault file here'}</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".vault" 
              style={{ display: 'none' }} 
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.9rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={16} /> Decryption Key
            </label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter the password used to encrypt"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

          <button 
            className="primary-btn" 
            onClick={handleDecrypt}
            disabled={!file || !password || isDecrypting}
          >
            <Unlock size={20} />
            {isDecrypting ? 'Decrypting...' : 'Decrypt Image'}
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <Eye size={24} />
            <h3 style={{ margin: 0 }}>Decrypted Successfully</h3>
          </div>
          <img src={decryptedImageUrl} alt="Decrypted file" className="preview-image" />
          <button 
            className="primary-btn" 
            style={{ marginTop: '2rem' }}
            onClick={() => {
              setDecryptedImageUrl(null);
              setFile(null);
              setPassword('');
            }}
          >
            Decrypt Another File
          </button>
        </div>
      )}
    </div>
  );
};
