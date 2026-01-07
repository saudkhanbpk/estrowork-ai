import React, { useEffect, useRef, useState } from 'react';
import * as Babel from '@babel/standalone';

interface LivePreviewProps {
    code: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderPreview = () => {
            if (!iframeRef.current) return;
            setError(null);

            try {
                // Transform the code using Babel
                // We assume the input 'code' is a React module using "export default"
                let transformedCode = "";

                // Wrap code to mount the default export
                // Note: Babel 'env' preset turns 'import' into 'require'
                // We will provide a minimal 'require' shim.

                try {
                    const result = Babel.transform(code, {
                        presets: ['react', ['env', { modules: 'commonjs' }]],
                        filename: 'preview.tsx',
                    });
                    transformedCode = result.code || "";
                } catch (e: any) {
                    setError(e.message);
                    return;
                }

                const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <script src="https://cdn.tailwindcss.com"></script>
              <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
              <style>
                body { background-color: white; color: black; margin: 0; padding: 0; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script>
                // Basic CommonJS Shim
                var exports = {};
                var module = { exports: {} };
                
                // Mock Require
                function require(name) {
                    if (name === 'react') return window.React;
                    if (name === 'react-dom') return window.ReactDOM;
                    // TODO: Add more libs if needed, e.g. lucide-react
                    return window[name] || {}; 
                }

                window.onerror = function(message) {
                  window.parent.postMessage({ type: 'ERROR', message }, '*');
                };
              </script>
              <script>
                try {
                    // Execute the transformed code
                    (function() {
                        ${transformedCode}
                    })();

                    // Mount logic
                    // If the code assigned to module.exports or exports.default
                    const App = module.exports.default || exports.default || module.exports; // fallback

                    if (typeof App === 'function') {
                        const root = ReactDOM.createRoot(document.getElementById('root'));
                        root.render(React.createElement(App));
                    } else {
                        console.warn("No default export found (component) to render.");
                    }

                } catch (e) {
                    console.error(e);
                    window.parent.postMessage({ type: 'ERROR', message: e.message }, '*');
                }
              </script>
            </body>
          </html>
        `;

                const iframeDoc = iframeRef.current.contentDocument;
                if (iframeDoc) {
                    iframeDoc.open();
                    iframeDoc.write(html);
                    iframeDoc.close();
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message);
            }
        };

        const timeout = setTimeout(renderPreview, 1000); // 1s Debounce
        return () => clearTimeout(timeout);
    }, [code]);

    return (
        <div className="h-full w-full flex flex-col bg-white rounded-md overflow-hidden border border-gray-200 relative">
            {error && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-red-50 text-red-600 p-2 text-xs border-b border-red-100 break-words max-h-20 overflow-auto">
                    {error}
                </div>
            )}
            <iframe
                ref={iframeRef}
                title="Live Preview"
                className="flex-1 w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
};
