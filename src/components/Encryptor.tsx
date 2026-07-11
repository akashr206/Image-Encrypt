import React, { useState, useRef } from 'react';
import { UploadCloud, Lock, FileKey } from 'lucide-react';
import { encryptData, validatePassword } from '../utils/crypto';

export const Encryptor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload an image file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload an image file.');
      }
    }
  };

  const handleEncrypt = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password is too weak.');
      return;
    }

    try {
      setIsEncrypting(true);
      setError(null);
      
      const arrayBuffer = await file.arrayBuffer();
      const encryptedBuffer = await encryptData(arrayBuffer, password);
      
      const blob = new Blob([encryptedBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.vault`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setFile(null);
      setPassword('');
    } catch (err) {
      setError('Encryption failed. Please try again.');
      console.error(err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const isPasswordValid = validatePassword(password);

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      <div 
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="icon" />
        <p>{file ? file.name : 'Drag & drop an image here, or click to select'}</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
      </div>

      <div className="form-group">
        <label style={{ fontSize: '0.9rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={16} /> Encryption Key
        </label>
        <input 
          type="password" 
          className="input-field" 
          placeholder="Enter a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password.length > 0 && !isPasswordValid && (
          <span className="error-text">
            Needs 8+ chars, upper, lower, number & special char.
          </span>
        )}
      </div>

      {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

      <button 
        className="primary-btn" 
        onClick={handleEncrypt}
        disabled={!file || !isPasswordValid || isEncrypting}
      >
        <FileKey size={20} />
        {isEncrypting ? 'Encrypting...' : 'Encrypt & Download'}
      </button>
    </div>
  );
};
