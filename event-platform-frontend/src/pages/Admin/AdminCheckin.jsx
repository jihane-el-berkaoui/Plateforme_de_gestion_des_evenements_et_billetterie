import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminCheckin.css';

const AdminCheckin = () => {
    const [uniqueCode, setUniqueCode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [checkins, setCheckins] = useState([]);
    const [loadingCheckins, setLoadingCheckins] = useState(true);
    const [showHistory, setShowHistory] = useState(true);
    
    const extractUniqueCode = (text) => {
        const evtPattern = /EVT-[A-Z0-9]{5}-[A-Z0-9]{5}/;
        const match = text.match(evtPattern);
        return match ? match[0] : text.trim();
    };
    
    const loadCheckins = async () => {
        try {
            setLoadingCheckins(true);
            const response = await fetch('http://localhost:8080/api/checkins/recent?limit=10');
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setCheckins(data);
            } else if (data && Array.isArray(data.checkins)) {
                setCheckins(data.checkins);
            } else if (data && Array.isArray(data.content)) {
                setCheckins(data.content);
            } else {
                console.warn('Format de données inattendu:', data);
                setCheckins([]);
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement historique:', error);
            toast.error('Erreur chargement historique');
            setCheckins([]);
        } finally {
            setLoadingCheckins(false);
        }
    };
    
    useEffect(() => {
        loadCheckins();
    }, []);
    
    const handleScan = async () => {
        const extractedCode = extractUniqueCode(uniqueCode);
        
        if (!extractedCode) {
            toast.error('Aucun code valide trouvé');
            return;
        }
        
        setScanning(true);
        setScanResult(null);
        
        try {
            const scanUrl = `http://localhost:8080/api/qr-codes/scan-unique/${encodeURIComponent(extractedCode)}?scannerId=ADMIN_001`;
            
            const response = await fetch(scanUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success(`✅ ${result.message}`);
                setScanResult(result);
                
                loadCheckins();
                
                setTimeout(() => {
                    setUniqueCode('');
                    setScanResult(null);
                }, 5000);
            } else {
                toast.error(`❌ ${result.message}`);
            }
            
        } catch (error) {
            console.error('❌ Scan error:', error);
            toast.error(`❌ Erreur: ${error.message}`);
        } finally {
            setScanning(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleScan();
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');
        } catch (error) {
            return dateString;
        }
    };
    
    const safeCheckins = Array.isArray(checkins) ? checkins : [];
    
    return (
        <div className="admin-checkin-container">
            <ToastContainer />
            
            <header className="admin-header">
                <h1>🎫 Scanner de billets - Admin</h1>
                <p>Scannez les codes uniques (EVT-XXXXX-XXXXX) des billets</p>
            </header>
            
            <div className="scanner-section">
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Collez le code unique du billet (EVT-XXXXX-XXXXX)"
                        value={uniqueCode}
                        onChange={(e) => setUniqueCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="code-input"
                        autoFocus
                    />
                    <button
                        onClick={handleScan}
                        disabled={scanning || !uniqueCode.trim()}
                        className="btn btn-scan"
                    >
                        {scanning ? '⌛ Scanning...' : '🔍 Scanner'}
                    </button>
                </div>
                
                <div className="instructions">
                    <p><strong>💡 Instructions:</strong></p>
                    <ul>
                        <li>Copiez le code unique depuis l'email du billet</li>
                        <li>Le format est : EVT-XXXXX-XXXXX</li>
                        <li>Collez-le dans le champ ci-dessus</li>
                        <li>Cliquez sur Scanner ou appuyez sur Entrée</li>
                    </ul>
                </div>
                
                {scanResult && scanResult.success && (
                    <div className="scan-result success">
                        <div className="result-header">
                            <span className="icon">✅</span>
                            <h3>CHECK-IN RÉUSSI !</h3>
                        </div>
                        <div className="result-details">
                            <div className="detail-row">
                                <span className="label">Code:</span>
                                <span className="value">{scanResult.uniqueCode}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Événement:</span>
                                <span className="value">{scanResult.eventName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Utilisateur:</span>
                                <span className="value">{scanResult.userName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Nombre de billets:</span>
                                <span className="value">{scanResult.quantity}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Scanner:</span>
                                <span className="value">{scanResult.scannerId}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Heure:</span>
                                <span className="value">
                                    {new Date(scanResult.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                        <div className="result-footer">
                            <p className="auto-clear">Le champ sera réinitialisé dans 5 secondes...</p>
                        </div>
                    </div>
                )}
                
                {scanResult && !scanResult.success && (
                    <div className="scan-result error">
                        <div className="result-header">
                            <span className="icon">❌</span>
                            <h3>ÉCHEC DU CHECK-IN</h3>
                        </div>
                        <div className="result-details">
                            <p>{scanResult.message}</p>
                        </div>
                    </div>
                )}
            </div>
            
       
          
        </div>
    );
};

export default AdminCheckin;