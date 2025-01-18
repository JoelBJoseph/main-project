import React, { useState } from 'react';
import './App.css';

const App = () => {
    const [currentTab, setCurrentTab] = useState<'c-code' | 'rust-code'>('c-code');
    const [cCode, setCCode] = useState('');
    const [rustCode, setRustCode] = useState('');
    const [directory, setDirectory] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');

    const handleAddFile = () => {
        const newFileName = prompt('Enter file name:');
        if (newFileName) {
            setFileName(newFileName);
            setDirectory((prev) => [...prev, newFileName]);
        }
    };

    const handleSave = () => {
        const blob = new Blob([
            currentTab === 'c-code' ? cCode : rustCode
        ], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.${currentTab === 'c-code' ? 'c' : 'rs'}`;
        link.click();
    };

    const handleTranspile = async () => {
        try {
            const response = await fetch("https://api.generativeai.googleapis.com/v1/models/text-bison-001:generateText", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer YOUR_API_KEY`,
                },
                body: JSON.stringify({
                    prompt: `Convert the following C code to safe Rust:\n${cCode}`,
                    maxTokens: 1000,
                    temperature: 0.1,
                }),
            });

            const data = await response.json();
            if (data && data.text) {
                setRustCode(data.text);
                setCurrentTab('rust-code');
            } else {
                alert("Failed to generate Rust code.");
            }
        } catch (error) {
            console.error("Error during transpilation:", error);
            alert("An error occurred during transpilation. Please try again.");
        }
    };

    const handleCompile = () => {
        alert('Repair and compile feature is not implemented yet!');
    };

    return (
        <div className="app" style={{
            backgroundColor: '#640202',
            color: '#FFF',
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}>
            <header className="app-header" style={{ padding: '10px', display: 'flex', gap: '10px', backgroundColor: '#1E1E1E' }}>
                <button onClick={handleAddFile}>+</button>
                <button onClick={() => setCurrentTab('c-code')}>C Code</button>
                {currentTab === 'rust-code' && (
                    <button onClick={handleCompile}>Repair and Compile</button>
                )}
                {currentTab === 'c-code' && (
                    <button onClick={handleTranspile}>1-Click Transpile</button>
                )}
                <button onClick={handleSave}>Save</button>
            </header>

            <div className="content" style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
                border: '2px solid #3A2727',
                margin: 0,
                padding: 0,
                boxSizing: 'border-box'
            }}>
                <aside className="directory" style={{
                    width: '200px',
                    backgroundColor: '#1e1e1e',
                    padding: '10px',
                    overflowY: 'auto'
                }}>
                    <h3>Directory</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#FFF' }}>
                        {directory.map((file, index) => (
                            <li key={index}>{file}</li>
                        ))}
                    </ul>
                </aside>

                <main className="editor" style={{
                    flex: 1,
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {currentTab === 'c-code' ? (
                        <textarea
                            value={cCode}
                            onChange={(e) => setCCode(e.target.value)}
                            placeholder="Write your C code here..."
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#1e1e1e',
                                color: '#FFF',
                                border: 'none',
                                resize: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    ) : (
                        <textarea
                            value={rustCode}
                            readOnly
                            placeholder="Rust code will appear here..."
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#1e1e1e',
                                color: '#FFF',
                                border: 'none',
                                resize: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
