import React from 'react';
import Editor, { OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    theme?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    code,
    onChange,
    language = "javascript",
    theme = "vs-dark"
}) => {
    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editor.updateOptions({
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
        });

        // Optional: Add custom types or validation here
    };

    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-gray-800 bg-[#1e1e1e]">
            <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                value={code}
                onChange={onChange}
                theme={theme}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    automaticLayout: true,
                    tabSize: 2,
                }}
            />
        </div>
    );
};
