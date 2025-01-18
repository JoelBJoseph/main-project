import React, { useState } from 'react';
import { FolderTree, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import FileDirectory from './file-directory.tsx';
import { geminiApi } from '../services/gemini-api.service';

interface SavedFile {
    name: string;
    content: string;
    type: 'c' | 'rust';
}

const CodeEditor = () => {
    const [cCode, setCCode] = useState('');
    const [rustCode, setRustCode] = useState('');
    const [fileName, setFileName] = useState('');
    const [showRustTab, setShowRustTab] = useState(false);
    const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
    const [isTranspiled, setIsTranspiled] = useState(false);
    const [isTranspiling, setIsTranspiling] = useState(false);

    const handleFileSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.c';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setFileName(file.name);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    setCCode(content);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleSave = () => {
        if (!fileName) {
            const name = prompt('Enter file name:');
            if (!name) return;
            setFileName(name);
        }

        setSavedFiles((prev) => [
            ...prev,
            {
                name: fileName,
                content: cCode,
                type: 'c',
            },
        ]);
    };

    const handleTranspile = async () => {
        setIsTranspiling(true);
        try {
            const result = await geminiApi.transpile({
                sourceCode: cCode,
                fileName: fileName || 'untitled.c',
            });

            if (result.success && result.rustCode) {
                setRustCode(result.rustCode);
                setShowRustTab(true);
                setIsTranspiled(true);
            } else if (result.errors) {
                alert('Transpilation failed:\n' + result.errors.join('\n'));
            }
        } catch (error) {
            alert('An error occurred during transpilation');
        } finally {
            setIsTranspiling(false);
        }
    };

    return (
        <div className="flex h-screen bg-neutral-900">
            <div className="w-64 border-r border-red-900 p-4 text-white">
                <div className="flex items-center gap-2 mb-4">
                    <FolderTree className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Directory</span>
                </div>
                <FileDirectory files={savedFiles} />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="bg-red-950 p-4 flex items-center justify-between">
                    <h1 className="text-white text-xl font-bold">MVP</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="bg-red-900 text-white hover:bg-red-800 border-red-700"
                            onClick={handleFileSelect}
                        >
                            + Add File
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-red-900 text-white hover:bg-red-800 border-red-700"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                        {!isTranspiled ? (
                            <Button
                                variant="outline"
                                className="bg-red-900 text-white hover:bg-red-800 border-red-700"
                                onClick={handleTranspile}
                                disabled={isTranspiling}
                            >
                                {isTranspiling ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Transpiling...
                                    </>
                                ) : (
                                    '1-Click Transpile'
                                )}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="bg-red-900 text-white hover:bg-red-800 border-red-700"
                            >
                                Repair and Compile
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 p-4">
                    <Tabs defaultValue="c" className="h-full">
                        <TabsList className="bg-red-950">
                            <TabsTrigger value="c" className="text-white data-[state=active]:bg-red-900">
                                C Code
                            </TabsTrigger>
                            {showRustTab && (
                                <TabsTrigger value="rust" className="text-white data-[state=active]:bg-red-900">
                                    Rust Code
                                </TabsTrigger>
                            )}
                        </TabsList>
                        <TabsContent value="c" className="h-[calc(100%-40px)]">
                            <Textarea
                                value={cCode}
                                onChange={(e) => setCCode(e.target.value)}
                                placeholder="Enter your C code here..."
                                className="h-full bg-neutral-800 text-white border-red-900 focus-visible:ring-red-900"
                            />
                        </TabsContent>
                        <TabsContent value="rust" className="h-[calc(100%-40px)]">
                            <Textarea
                                value={rustCode}
                                onChange={(e) => setRustCode(e.target.value)}
                                placeholder="Transpiled Rust code will appear here..."
                                className="h-full bg-neutral-800 text-white border-red-900 focus-visible:ring-red-900"
                                readOnly
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
