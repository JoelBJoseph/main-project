import React from 'react';
import { File } from 'lucide-react';

interface FileDirectoryProps {
    files: Array<{
        name: string;
        type: 'c' | 'rust';
    }>;
}

const FileDirectory: React.FC<FileDirectoryProps> = ({ files }) => {
    return (
        <div className="space-y-2">
            {files.map((file, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white cursor-pointer p-2 hover:bg-red-900/20 rounded"
                >
                    <File className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-xs text-neutral-500 ml-auto">
            {file.type === 'c' ? '.c' : '.rs'}
          </span>
                </div>
            ))}
        </div>
    );
};

export default FileDirectory;
