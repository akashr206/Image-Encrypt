import { useState } from 'react'
import { Shield, LockOpen } from 'lucide-react'
import { Encryptor } from './components/Encryptor'
import { Decryptor } from './components/Decryptor'

function App() {
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');

  return (
    <div className="app-container">
      <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <Shield size={48} color="var(--primary-color)" />
        ImageVault
      </h1>
      <p className="subtitle">Military-grade client-side image encryption.</p>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'encrypt' ? 'active' : ''}`}
          onClick={() => setActiveTab('encrypt')}
        >
          Encrypt
        </button>
        <button 
          className={`tab-btn ${activeTab === 'decrypt' ? 'active' : ''}`}
          onClick={() => setActiveTab('decrypt')}
        >
          Decrypt
        </button>
      </div>

      {activeTab === 'encrypt' ? <Encryptor /> : <Decryptor />}
      
      <div style={{ marginTop: '3rem', color: '#555', fontSize: '0.85rem', textAlign: 'center' }}>
        <p><LockOpen size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> All encryption and decryption happens locally in your browser.</p>
        <p>Without the key, your data is mathematically impossible to recover.</p>
      </div>
    </div>
  )
}

export default App
