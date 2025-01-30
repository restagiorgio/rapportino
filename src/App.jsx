import React from 'react'
import Rapportino from './components/Rapportino'

function App() {
    const headerStyle = {
        backgroundColor: '#1a237e',
        color: 'white',
        padding: '1rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    return (
        <div>
            <header style={headerStyle}>
                <h1 style={{margin: 0, fontSize: '24px'}}>Rapportino Ore Lavorate</h1>
            </header>
            <Rapportino/>
        </div>
    )
}

export default App