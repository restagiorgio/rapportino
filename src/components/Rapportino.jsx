import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const Rapportino = () => {
    const [nome, setNome] = useState('');
    const [cognome, setCognome] = useState('');
    const [mese, setMese] = useState('');
    const [anno, setAnno] = useState(new Date().getFullYear());
    const [giorniLavorativi, setGiorniLavorativi] = useState([]);
    const [mostraTabella, setMostraTabella] = useState(false);
    const [nuovaAttivita, setNuovaAttivita] = useState('');
    const [attivitaPersonalizzate, setAttivitaPersonalizzate] = useState([]);

    console.log('Rapportino.jsx caricato');

    const mesi = [
        { value: '1', label: 'Gennaio' },
        { value: '2', label: 'Febbraio' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Aprile' },
        { value: '5', label: 'Maggio' },
        { value: '6', label: 'Giugno' },
        { value: '7', label: 'Luglio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Settembre' },
        { value: '10', label: 'Ottobre' },
        { value: '11', label: 'Novembre' },
        { value: '12', label: 'Dicembre' }
    ];

    const attivitaPossibili = [
        'Sviluppo Frontend',
        'Sviluppo Backend',
        'Testing',
        'Documentazione',
        'Meeting',
        'Supporto Cliente',
        ...attivitaPersonalizzate
    ];

    const festivita = {
        '1-1': 'Capodanno',
        '1-6': 'Epifania',
        '4-25': 'Festa della Liberazione',
        '5-1': 'Festa del Lavoro',
        '6-2': 'Festa della Repubblica',
        '8-15': 'Ferragosto',
        '11-1': 'Tutti i Santi',
        '12-8': 'Immacolata Concezione',
        '12-25': 'Natale',
        '12-26': 'Santo Stefano'
    };

    const formatDataEstesa = (data) => {
        const opzioni = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        return data.toLocaleDateString('it-IT', opzioni);
    };

    const isFestivo = (data) => {
        const giorno = data.getDate();
        const meseCorrente = data.getMonth() + 1;
        const chiaveFestivita = `${meseCorrente}-${giorno}`;
        const giornoSettimana = data.getDay();
        return festivita[chiaveFestivita] || giornoSettimana === 0 || giornoSettimana === 6;
    };

    const getTipoGiorno = (data) => {
        const giorno = data.getDate();
        const meseCorrente = data.getMonth() + 1;
        const chiaveFestivita = `${meseCorrente}-${giorno}`;
        const giornoSettimana = data.getDay();

        if (festivita[chiaveFestivita]) return festivita[chiaveFestivita];
        if (giornoSettimana === 0) return 'Domenica';
        if (giornoSettimana === 6) return 'Sabato';
        return 'Lavorativo';
    };

    const generaGiorniMese = () => {
        if (!mese) return;

        const numeroGiorni = new Date(anno, parseInt(mese), 0).getDate();
        const giorniDelMese = [];

        for (let i = 1; i <= numeroGiorni; i++) {
            const data = new Date(anno, parseInt(mese) - 1, i);
            const festivo = isFestivo(data);

            giorniDelMese.push({
                data: data,
                tipo: getTipoGiorno(data),
                oreLavorate: festivo ? 0 : '',
                attivita: festivo ? '' : '',
                festivo: festivo
            });
        }

        setGiorniLavorativi(giorniDelMese);
        setMostraTabella(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        generaGiorniMese();
    };

    const handleOreChange = (index, ore) => {
        const nuoviGiorni = [...giorniLavorativi];
        nuoviGiorni[index].oreLavorate = ore;
        setGiorniLavorativi(nuoviGiorni);
    };

    const handleAttivitaChange = (index, attivita) => {
        const nuoviGiorni = [...giorniLavorativi];
        if (attivita === 'nuova') {
            const nuova = prompt('Inserisci la nuova attività:');
            if (nuova && nuova.trim()) {
                setAttivitaPersonalizzate([...attivitaPersonalizzate, nuova.trim()]);
                nuoviGiorni[index].attivita = nuova.trim();
            }
        } else {
            nuoviGiorni[index].attivita = attivita;
        }
        setGiorniLavorativi(nuoviGiorni);
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
            ['RAPPORTINO ORE LAVORATE '+mesi.find(m => m.value === mese)?.label, ' '+ anno.toString()],
            [],
            ['Data', 'Tipo Giorno', 'Ore Lavorate', 'Attività', 'Note', ''],
        ]);

        // Unisci le celle del titolo
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];

        // Aggiungi i giorni
        const datiGiorni = giorniLavorativi.map(giorno => [
            giorno.data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }),
            giorno.tipo,
            giorno.festivo ? '' : (giorno.oreLavorate || ''),
            giorno.festivo ? '' : (giorno.attivita || ''),
            '',
            ''
        ]);

        // Aggiungi i dati dei giorni
        XLSX.utils.sheet_add_aoa(ws, datiGiorni, { origin: 'A6' });

        // Calcola i totali
        const totaleOre = giorniLavorativi.reduce((acc, curr) =>
            acc + (curr.oreLavorate ? parseFloat(curr.oreLavorate) : 0), 0);

        const giorniFeriali = giorniLavorativi.filter(g => !g.festivo && g.data.getDay() !== 0 && g.data.getDay() !== 6).length;
        const mediaOreGiornaliere = totaleOre / giorniLavorativi.length;

        // Aggiungi riepiloghi
        const rigaInizioRiepiloghi = giorniLavorativi.length + 8;
        XLSX.utils.sheet_add_aoa(ws, [
            [],
            ['', 'Totale Ore:', totaleOre.toFixed(2)],
            [],
            ['RESOCONTO MENSILE'],
            ['', 'Giorni Lavorativi:', giorniFeriali.toString()],
            ['', 'Totale Giorni:', giorniLavorativi.length.toString()],
            [],
            ['', 'Media Ore Giornaliere:', mediaOreGiornaliere.toFixed(2)],
            [],
            ['RESOCONTO ORE PER ATTIVITÀ']
        ], { origin: `A${rigaInizioRiepiloghi}` });

        // Calcola ore per attività
        const orePerAttivita = {};
        giorniLavorativi.forEach(giorno => {
            if (giorno.attivita && giorno.oreLavorate) {
                orePerAttivita[giorno.attivita] = (orePerAttivita[giorno.attivita] || 0) + parseFloat(giorno.oreLavorate);
            }
        });

        // Aggiungi resoconto attività
        const attivitaRows = Object.entries(orePerAttivita).map(([attivita, ore]) =>
            ['', attivita, ore.toFixed(2)]
        );
        XLSX.utils.sheet_add_aoa(ws, attivitaRows, { origin: `A${rigaInizioRiepiloghi + 15}` });

        // Imposta larghezza colonne
        ws['!cols'] = [
            { wch: 12 }, // Data
            { wch: 15 }, // Tipo Giorno
            { wch: 15 }, // Ore Lavorate
            { wch: 50 }, // Attività
            { wch: 20 }, // Note
            { wch: 10 }, // Spazio vuoto
            { wch: 15 }  // Legenda
        ];

        // Aggiungi il foglio al workbook e salva
        XLSX.utils.book_append_sheet(wb, ws, 'Rapportino');
        XLSX.writeFile(wb, `Rapportino ${mesi.find(m => m.value === mese)?.label} ${anno} ${nome} ${cognome}.xlsx`);
    };


    const formStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    };

    const inputStyle = {
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        color: '#333',
        fontWeight: '500'
    };

    const buttonStyle = {
        backgroundColor: '#1a237e',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontSize: '14px',
        fontWeight: '500'
    };

    const exportButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#2e7d32'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden'
    };

    const headerCellStyle = {
        backgroundColor: '#1a237e',
        color: 'white',
        padding: '12px 8px',
        textAlign: 'left',
        fontWeight: '500',
        fontSize: '14px'
    };

    const cellStyle = {
        border: '1px solid #e0e0e0',
        padding: '12px 8px',
        textAlign: 'left',
        fontSize: '14px'
    };

    const festivoStyle = {
        backgroundColor: '#f5f5f5'
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
    };

    const tableContainerStyle = {
        overflowX: 'auto',
        marginTop: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1px'
    };

    const inputNumberStyle = {
        ...inputStyle,
        marginBottom: 0,
        width: '80px',
        textAlign: 'center'
    };

    const selectStyle = {
        ...inputStyle,
        marginBottom: 0,
        backgroundColor: 'white'
    };


    return (
        <>
            <div style={formStyle}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Nome</label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Cognome</label>
                            <input
                                type="text"
                                value={cognome}
                                onChange={(e) => setCognome(e.target.value)}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Mese</label>
                            <select
                                value={mese}
                                onChange={(e) => setMese(e.target.value)}
                                style={inputStyle}
                                required
                            >
                                <option value="">Seleziona mese</option>
                                {mesi.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Anno</label>
                            <input
                                type="number"
                                value={anno}
                                onChange={(e) => setAnno(e.target.value)}
                                style={inputStyle}
                                min="2000"
                                max="2100"
                                required
                            />
                        </div>
                    </div>
                    <div style={buttonContainerStyle}>
                        <button type="submit" style={buttonStyle}>
                            Genera Rapportino
                        </button>
                        {mostraTabella && (
                            <button
                                type="button"
                                style={exportButtonStyle}
                                onClick={exportToExcel}
                            >
                                Esporta Excel
                            </button>
                        )}
                    </div>
                </form>

                {mostraTabella && (
                    <div style={tableContainerStyle}>
                        <table style={tableStyle}>
                            <thead>
                            <tr>
                                <th style={headerCellStyle}>Data</th>
                                <th style={headerCellStyle}>Tipo</th>
                                <th style={headerCellStyle}>Ore Lavorate</th>
                                <th style={headerCellStyle}>Attività</th>
                            </tr>
                            </thead>
                            <tbody>
                            {giorniLavorativi.map((giorno, index) => (
                                <tr key={index} style={giorno.festivo ? festivoStyle : {}}>
                                    <td style={cellStyle}>{formatDataEstesa(giorno.data)}</td>
                                    <td style={cellStyle}>{giorno.tipo}</td>
                                    <td style={cellStyle}>
                                        {!giorno.festivo && (
                                            <input
                                                type="number"
                                                min="0"
                                                max="24"
                                                value={giorno.oreLavorate}
                                                onChange={(e) => handleOreChange(index, e.target.value)}
                                                style={inputNumberStyle}
                                            />
                                        )}
                                    </td>
                                    <td style={cellStyle}>
                                        {!giorno.festivo && (
                                            <select
                                                value={giorno.attivita}
                                                onChange={(e) => handleAttivitaChange(index, e.target.value)}
                                                style={selectStyle}
                                            >
                                                <option value="">Seleziona attività</option>
                                                {attivitaPossibili.map((att) => (
                                                    <option key={att} value={att}>
                                                        {att}
                                                    </option>
                                                ))}
                                                <option value="nuova">+ Aggiungi nuova attività</option>
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default Rapportino;