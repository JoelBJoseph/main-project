import React, { useState } from 'react';
import CodeEditor from '@/components/code-editor.tsx';
import FileDirectory from '@/components/file-directory';

interface SavedFile {
    name: string;
    content: string;
    type: 'c' | 'rust';
}

const App: React.FC = () => {
    const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

    const handleFileSave = (file: SavedFile) => {
        setSavedFiles((prev) => [...prev, file]);
    };

    return (
        <div className="flex h-screen bg-neutral-900">
            {/* File Directory Section */}
            <FileDirectory files={savedFiles} />

            {/* Code Editor Section */}
            <div className="flex-1">
                <CodeEditor onSave={handleFileSave} />
            </div>
        </div>
    );
};

export default App;
