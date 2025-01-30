import React, { useState } from 'react';

import ExcelJS from 'exceljs';
const Rapportino = () => {
    const [nome, setNome] = useState('');
    const [cognome, setCognome] = useState('');
    const [mese, setMese] = useState('');
    const [anno, setAnno] = useState(new Date().getFullYear());
    const [giorniLavorativi, setGiorniLavorativi] = useState([]);
    const [mostraTabella, setMostraTabella] = useState(false);
    const [attivitaPersonalizzate, setAttivitaPersonalizzate] = useState([]);

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
        'Miglioramento delle performance e della scalabilità',
        'Implementazione di pattern di resilienza e fault tolerance',
        'Ottimizzazione dei flussi di comunicazione tra i servizi',
        'Progettazione e implementazione di nuovi microservizi',
        'Implementazione di validazioni e controlli di business',
        'Integrazione con il sistema di autenticazione',
        'Ottimizzazione degli schemi e delle strutture delle tabelle',
        'Configurazione ambiente Kubernetes',
        'Definizione dei deployment manifest',
        'Implementazione di strategie di scaling automatico',
        'Configurazione degli Ingress e dei file di Secret',
        'Setup del monitoring e logging',
        'Refactor e ottimizzazione del codice',
        'Preparazione ambiente per poc Nutanix',
        'Sviluppo microservizio Protocollo Webarch',
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

    const validazioneCompletezza = () => {
        const giorniConOreMancantiSolamente = giorniLavorativi.filter(giorno =>
            !giorno.festivo &&
            (!giorno.oreLavorate || giorno.oreLavorate === '') &&
            giorno.attivita // ha l'attività ma non le ore
        );

        const giorniConAttivitaMancantiSolamente = giorniLavorativi.filter(giorno =>
            !giorno.festivo &&
            giorno.oreLavorate && // ha le ore ma non l'attività
            (!giorno.attivita || giorno.attivita === '')
        );

        const giorniConEntrambiMancanti = giorniLavorativi.filter(giorno =>
            !giorno.festivo &&
            (!giorno.oreLavorate || giorno.oreLavorate === '') &&
            (!giorno.attivita || giorno.attivita === '')
        );

        let messaggi = [];

        if (giorniConOreMancantiSolamente.length > 0) {
            const date = giorniConOreMancantiSolamente
                .map(g => g.data.toLocaleDateString('it-IT'))
                .join(', ');
            messaggi.push(`Mancano le ore per i giorni: ${date}`);
        }

        if (giorniConAttivitaMancantiSolamente.length > 0) {
            const date = giorniConAttivitaMancantiSolamente
                .map(g => g.data.toLocaleDateString('it-IT'))
                .join(', ');
            messaggi.push(`Manca l'attività per i giorni: ${date}`);
        }

        /*if (giorniConEntrambiMancanti.length > 0) {
            const date = giorniConEntrambiMancanti
                .map(g => g.data.toLocaleDateString('it-IT'))
                .join(', ');
            messaggi.push(`Mancano sia ore che attività per i giorni: ${date}`);
        }*/

        if (messaggi.length > 0) {
            alert(messaggi.join('\n\n'));
            return false;
        }

        return true;
    };


    const exportToExcel = async () => {
        if (!validazioneCompletezza()) {
            return; // Interrompe l'esportazione se la validazione fallisce
        }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rapportino');

        // Imposta il titolo
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'RAPPORTINO ORE LAVORATE ' + mesi.find(m => m.value === mese)?.label + ' ' + anno.toString();
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center' };

        // Aggiungi righe vuote
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Aggiungi intestazioni
        const headers = ['Data', 'Tipo Giorno', 'Ore Lavorate', 'Attività', 'Note'];
        const headerRow = worksheet.addRow(headers);

        // Stile intestazioni
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1A237E' } // FF all'inizio per l'opacità
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Aggiungi i dati dei giorni
        giorniLavorativi.forEach(giorno => {
            const row = worksheet.addRow([
                giorno.data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }),
                giorno.tipo,
                giorno.festivo ? '' : (giorno.oreLavorate || ''),
                giorno.festivo ? '' : (giorno.attivita || ''),
                '',
            ]);

            // Aggiungi stile alle celle
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle' };
            });

            // Aggiungi sfondo grigio per i giorni festivi
            if (giorno.festivo) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFB0B0B0' }
                    };
                });
            }
        });

        // Calcola i totali
        const totaleOre = giorniLavorativi.reduce((acc, curr) =>
            acc + (curr.oreLavorate ? parseFloat(curr.oreLavorate) : 0), 0);

        const giorniFeriali = giorniLavorativi.filter(g => !g.festivo && g.data.getDay() !== 0 && g.data.getDay() !== 6).length;
        const mediaOreGiornaliere = totaleOre / giorniLavorativi.length;

        // Aggiungi riga vuota
        worksheet.addRow([]);

        // Aggiungi riepiloghi
        //worksheet.mergeCells('B37:C37');
        const totOre = worksheet.getCell('B37');
        totOre.value = 'Totale Ore: ' + totaleOre.toFixed(2);
        totOre.font = { bold: true, size: 14 };
        totOre.alignment = { horizontal: 'center' };

        //worksheet.addRow(['', 'Totale Ore:', totaleOre.toFixed(2)]);
        worksheet.addRow([]);
        const rowResocontoMensile = worksheet.addRow(['RESOCONTO MENSILE']);
        rowResocontoMensile.font = { bold: true };
        for(let i = 1; i <= 3; i++) {
            const cell = rowResocontoMensile.getCell(i);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF7FB5C5' }
            };
            // Se vuoi applicare anche altri stili alla cella
            cell.font = { bold: true };
        }
        worksheet.mergeCells(`A${rowResocontoMensile.number}:C${rowResocontoMensile.number}`);

        worksheet.addRow(['', 'Giorni Lavorativi:', parseFloat(giorniFeriali).toFixed(2)]);
        worksheet.addRow(['', 'Totale Giorni:', parseFloat(giorniLavorativi.length).toFixed(2)]);
        worksheet.addRow([]);
        worksheet.addRow(['', 'Media Ore Giornaliere:', mediaOreGiornaliere.toFixed(2)]);
        worksheet.addRow([]);

        const rowResocontoAttivita = worksheet.addRow(['RESOCONTO ORE PER ATTIVITÀ']);
        rowResocontoAttivita.font = { bold: true };
        for(let i = 1; i <= 3; i++) {
            const cell = rowResocontoAttivita.getCell(i);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF7FB5C5' }
            };
            // Se vuoi applicare anche altri stili alla cella
            cell.font = { bold: true };
        }
        worksheet.mergeCells(`A${rowResocontoAttivita.number}:C${rowResocontoAttivita.number}`);

        // Calcola e aggiungi ore per attività
        const orePerAttivita = {};
        giorniLavorativi.forEach(giorno => {
            if (giorno.attivita && giorno.oreLavorate) {
                orePerAttivita[giorno.attivita] = (orePerAttivita[giorno.attivita] || 0) + parseFloat(giorno.oreLavorate);
            }
        });

        Object.entries(orePerAttivita).forEach(([attivita, ore]) => {
            worksheet.addRow(['', attivita, ore.toFixed(2)]);
        });

        // Imposta larghezza colonne
        worksheet.columns = [
            { width: 12 }, // Data
            { width: 15 }, // Tipo Giorno
            { width: 15 }, // Ore Lavorate
            { width: 50 }, // Attività
            { width: 20 }, // Note
        ];

        // Genera il file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rapportino ${mesi.find(m => m.value === mese)?.label} ${anno} ${nome} ${cognome}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
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
        fontSize: '17px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        color: '#333',
        fontWeight: '500',
        fontSize: '17px'
    };

    const buttonStyle = {
        backgroundColor: '#1a237e',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontSize: '17px',
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
        fontSize: '20px'
    };

    const cellStyle = {
        border: '1px solid #e0e0e0',
        padding: '12px 8px',
        textAlign: 'left',
        fontSize: '17px'
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