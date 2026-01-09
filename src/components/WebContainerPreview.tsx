"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, RefreshCw, AlertCircle, Terminal, Play, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWebContainer } from '@/hooks/useWebContainer'

interface GeneratedFile {
  path: string
  content: string
}

interface WebContainerPreviewProps {
  files: GeneratedFile[]
  onTerminalOutput?: (output: string[]) => void
}

export function WebContainerPreview({ files, onTerminalOutput }: WebContainerPreviewProps) {
  const {
    isBooting,
    isReady,
    isInstalling,
    isRunning,
    error,
    previewUrl,
    terminalOutput,
    mountFiles,
    runDevServer,
    restart,
  } = useWebContainer()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [showTerminal, setShowTerminal] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const prevFilesRef = useRef<string>('')

  // Notify parent of terminal output changes
  useEffect(() => {
    onTerminalOutput?.(terminalOutput)
  }, [terminalOutput, onTerminalOutput])

  // Mount and run when files change
  useEffect(() => {
    if (files.length === 0) return

    // Create a hash of files to detect changes
    const filesHash = files.map(f => `${f.path}:${f.content?.length || 0}`).join('|')

    if (filesHash === prevFilesRef.current) return
    prevFilesRef.current = filesHash

    const initContainer = async () => {
      setHasStarted(true)
      await mountFiles(files)
      await runDevServer()
    }

    initContainer()
  }, [files, mountFiles, runDevServer])

  const handleRefresh = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl
    }
  }, [previewUrl])

  const handleRestart = useCallback(async () => {
    prevFilesRef.current = '' // Force remount
    await restart()
    if (files.length > 0) {
      await mountFiles(files)
      await runDevServer()
    }
  }, [files, restart, mountFiles, runDevServer])

  const handleOpenExternal = useCallback(() => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }, [previewUrl])

  // Loading state
  if (isBooting || (isInstalling && !previewUrl)) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-teal-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {isBooting ? 'Starting WebContainer...' : 'Installing dependencies...'}
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          {isBooting ? 'Booting Node.js environment in browser' : 'Running npm install'}
        </p>

        {/* Terminal output preview */}
        <div className="w-full max-w-2xl px-4">
          <div className="bg-black/50 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs">
            {terminalOutput.slice(-10).map((line, i) => (
              <div key={i} className="text-green-400 whitespace-pre-wrap">{line}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !previewUrl) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error</h3>
        <p className="text-sm text-slate-400 mb-4 text-center max-w-md">{error}</p>
        <Button onClick={handleRestart} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>

        {/* Terminal output for debugging */}
        <div className="w-full max-w-2xl mt-6">
          <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
            {terminalOutput.map((line, i) => (
              <div key={i} className="text-red-300 whitespace-pre-wrap">{line}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Waiting for files
  if (files.length === 0 || !hasStarted) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
        <Play className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-600">Preview Area</h3>
        <p className="text-sm text-slate-400 mt-1">Your generated app will run here</p>
        <p className="text-xs text-slate-400 mt-2">Enter a prompt to generate code</p>
      </div>
    )
  }

  // Preview iframe
  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Running
            </span>
          ) : isInstalling ? (
            <span className="flex items-center gap-1.5 text-xs text-yellow-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              Installing...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 bg-slate-400 rounded-full" />
              Idle
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={!previewUrl}
            className="h-7 px-2 text-slate-600"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            className="h-7 px-2 text-slate-600"
            title="Restart server"
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTerminal(!showTerminal)}
            className={`h-7 px-2 ${showTerminal ? 'text-teal-600 bg-teal-50' : 'text-slate-600'}`}
            title="Toggle terminal"
          >
            <Terminal className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenExternal}
            disabled={!previewUrl}
            className="h-7 px-2 text-slate-600"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className={`flex-1 ${showTerminal ? 'h-[60%]' : 'h-full'}`}>
        {previewUrl ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Waiting for server to start...</p>
            </div>
          </div>
        )}
      </div>

      {/* Terminal panel */}
      {showTerminal && (
        <div className="h-[40%] border-t bg-slate-900 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-medium text-slate-300">Terminal</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTerminal(false)}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              ×
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
            {terminalOutput.map((line, i) => (
              <div key={i} className="text-green-400 whitespace-pre-wrap leading-5">{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WebContainerPreview
