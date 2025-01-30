import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Aggiungi questa funzione per gestire il localStorage
const checkStorage = () => {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
};

// Pulisci il localStorage se siamo in produzione e c'è un problema
if (import.meta.env.PROD && !checkStorage()) {
    console.warn('Storage non disponibile in questo contesto');
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)