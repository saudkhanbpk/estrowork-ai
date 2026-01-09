"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { WebContainer, FileSystemTree } from '@webcontainer/api'

interface GeneratedFile {
  path: string
  content: string
}

interface UseWebContainerReturn {
  isBooting: boolean
  isReady: boolean
  isInstalling: boolean
  isRunning: boolean
  error: string | null
  previewUrl: string | null
  terminalOutput: string[]
  mountFiles: (files: GeneratedFile[]) => Promise<void>
  runDevServer: () => Promise<void>
  restart: () => Promise<void>
}

// Global singleton state - survives component remounts
const globalState = {
  instance: null as WebContainer | null,
  bootPromise: null as Promise<WebContainer> | null,
  isBooted: false,
  listeners: new Set<() => void>(),
}

// Notify all listeners when state changes
function notifyListeners() {
  globalState.listeners.forEach(listener => listener())
}

// Teardown function to reset state (call this before page unload or on error)
export function teardownWebContainer() {
  if (globalState.instance) {
    globalState.instance.teardown()
  }
  globalState.instance = null
  globalState.bootPromise = null
  globalState.isBooted = false
  notifyListeners()
}

// Register teardown on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', teardownWebContainer)
}

export function useWebContainer(): UseWebContainerReturn {
  const [isBooting, setIsBooting] = useState(false)
  const [isReady, setIsReady] = useState(globalState.isBooted)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])

  const mountedRef = useRef(true)

  // Subscribe to global state changes
  useEffect(() => {
    const listener = () => {
      if (mountedRef.current) {
        setIsReady(globalState.isBooted)
      }
    }
    globalState.listeners.add(listener)
    return () => {
      mountedRef.current = false
      globalState.listeners.delete(listener)
    }
  }, [])

  const addTerminalOutput = useCallback((text: string) => {
    if (mountedRef.current) {
      setTerminalOutput(prev => [...prev.slice(-100), text])
    }
  }, [])

  // Boot WebContainer - proper singleton with teardown support
  const bootContainer = useCallback(async (): Promise<WebContainer> => {
    // Return existing instance immediately
    if (globalState.instance && globalState.isBooted) {
      setIsReady(true)
      setIsBooting(false)
      addTerminalOutput('Using existing WebContainer instance')
      return globalState.instance
    }

    // Return pending boot promise if one exists
    if (globalState.bootPromise) {
      addTerminalOutput('Waiting for WebContainer boot...')
      return globalState.bootPromise
    }

    globalState.bootPromise = (async () => {
      setIsBooting(true)
      setError(null)
      addTerminalOutput('Booting WebContainer...')

      try {
        const instance = await WebContainer.boot({
          coep: 'credentialless'
        })

        globalState.instance = instance
        globalState.isBooted = true

        // Listen for server-ready event
        instance.on('server-ready', (port, url) => {
          if (mountedRef.current) {
            addTerminalOutput(`Server ready on port ${port}`)
            setPreviewUrl(url)
            setIsRunning(true)
          }
        })

        instance.on('error', (err) => {
          if (mountedRef.current) {
            addTerminalOutput(`Error: ${err.message}`)
            setError(err.message)
          }
        })

        if (mountedRef.current) {
          setIsBooting(false)
          setIsReady(true)
          addTerminalOutput('WebContainer ready!')
        }

        notifyListeners()
        return instance
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to boot WebContainer'

        // Handle multiple instances error - try teardown and retry once
        if (message.includes('Unable to create more instances') || message.includes('already booted')) {
          addTerminalOutput('Detected stale instance, attempting cleanup...')

          // Reset global state
          globalState.instance = null
          globalState.bootPromise = null
          globalState.isBooted = false

          if (mountedRef.current) {
            setError('Please refresh the page - WebContainer needs a fresh start.')
            addTerminalOutput('Please refresh the page to continue.')
          }
        } else {
          if (mountedRef.current) {
            setError(message)
            addTerminalOutput(`Boot error: ${message}`)
          }
        }

        if (mountedRef.current) {
          setIsBooting(false)
        }

        globalState.bootPromise = null
        throw err
      }
    })()

    return globalState.bootPromise
  }, [addTerminalOutput])

  // Convert flat file list to WebContainer file tree
  const convertToFileTree = useCallback((files: GeneratedFile[]): FileSystemTree => {
    const tree: FileSystemTree = {}

    for (const file of files) {
      let filePath = file.path
      if (filePath.startsWith('/')) filePath = filePath.slice(1)

      const parts = filePath.split('/')
      let current: FileSystemTree = tree

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]

        if (i === parts.length - 1) {
          current[part] = {
            file: {
              contents: file.content || ''
            }
          }
        } else {
          if (!current[part]) {
            current[part] = { directory: {} }
          }
          current = (current[part] as { directory: FileSystemTree }).directory
        }
      }
    }

    return tree
  }, [])

  // Create package.json for Vite React project
  const createPackageJson = useCallback((files: GeneratedFile[]): string => {
    const hasTypeScript = files.some(f => f.path.endsWith('.tsx') || f.path.endsWith('.ts'))
    const allContent = files.map(f => f.content || '').join('\n')

    const deps: Record<string, string> = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
    }

    const devDeps: Record<string, string> = {
      'vite': '^5.0.0',
      '@vitejs/plugin-react': '^4.2.0',
    }

    if (hasTypeScript) {
      devDeps['typescript'] = '^5.0.0'
      devDeps['@types/react'] = '^18.2.0'
      devDeps['@types/react-dom'] = '^18.2.0'
    }

    const depPatterns: Record<string, string> = {
      'react-router-dom': '^6.20.0',
      'axios': '^1.6.0',
      'zustand': '^4.4.0',
      'lucide-react': '^0.294.0',
      'framer-motion': '^10.16.0',
      'date-fns': '^2.30.0',
      'clsx': '^2.0.0',
      'tailwind-merge': '^2.0.0',
    }

    for (const [pkg, version] of Object.entries(depPatterns)) {
      if (allContent.includes(`from '${pkg}'`) || allContent.includes(`from "${pkg}"`)) {
        deps[pkg] = version
      }
    }

    return JSON.stringify({
      name: 'vite-react-app',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: deps,
      devDependencies: devDeps
    }, null, 2)
  }, [])

  // Create vite.config.js
  const createViteConfig = useCallback((): string => {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  }
})`
  }, [])

  // Mount files to WebContainer
  const mountFiles = useCallback(async (files: GeneratedFile[]) => {
    if (files.length === 0) return

    try {
      const container = await bootContainer()

      addTerminalOutput('Mounting files...')
      setIsInstalling(true)
      setPreviewUrl(null)
      setIsRunning(false)

      // Determine main entry file extension
      const hasMainTsx = files.some(f => f.path.includes('main.tsx'))
      const hasMainJsx = files.some(f => f.path.includes('main.jsx'))
      const hasTsx = files.some(f => f.path.endsWith('.tsx'))
      const hasJsx = files.some(f => f.path.endsWith('.jsx'))

      let mainExt = 'jsx'
      if (hasMainTsx) {
        mainExt = 'tsx'
      } else if (hasMainJsx) {
        mainExt = 'jsx'
      } else if (hasTsx && !hasJsx) {
        mainExt = 'tsx'
      }

      // Create file tree from generated files
      const srcFiles = convertToFileTree(files)

      const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${mainExt}"></script>
  </body>
</html>`

      // Get src directory contents
      const srcDir = srcFiles.src as { directory: FileSystemTree } | undefined
      const srcContents: FileSystemTree = srcDir?.directory || srcFiles

      // Build complete file tree
      const fileTree: FileSystemTree = {
        'package.json': {
          file: { contents: createPackageJson(files) }
        },
        'vite.config.js': {
          file: { contents: createViteConfig() }
        },
        'index.html': {
          file: { contents: indexHtml }
        },
        'src': {
          directory: srcContents
        }
      }

      // Ensure index.css exists
      const srcNode = fileTree.src as { directory: FileSystemTree }
      if (!srcNode.directory['index.css']) {
        srcNode.directory['index.css'] = {
          file: {
            contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}`
          }
        }
      }

      await container.mount(fileTree)
      addTerminalOutput('Files mounted successfully')

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mount files'
      setError(message)
      addTerminalOutput(`Mount error: ${message}`)
      setIsInstalling(false)
    }
  }, [bootContainer, convertToFileTree, createPackageJson, createViteConfig, addTerminalOutput])

  // Run npm install and dev server
  const runDevServer = useCallback(async () => {
    if (!globalState.instance) {
      setError('WebContainer not ready')
      return
    }

    try {
      setIsInstalling(true)
      addTerminalOutput('Installing dependencies...')

      const installProcess = await globalState.instance.spawn('npm', ['install'])

      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          addTerminalOutput(data)
        }
      }))

      const installExitCode = await installProcess.exit

      if (installExitCode !== 0) {
        throw new Error(`npm install failed with code ${installExitCode}`)
      }

      addTerminalOutput('Dependencies installed!')
      setIsInstalling(false)
      addTerminalOutput('Starting dev server...')

      const devProcess = await globalState.instance.spawn('npm', ['run', 'dev'])

      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          addTerminalOutput(data)
        }
      }))

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run dev server'
      setError(message)
      addTerminalOutput(`Dev server error: ${message}`)
      setIsInstalling(false)
    }
  }, [addTerminalOutput])

  // Restart - remount files and restart server
  const restart = useCallback(async () => {
    setPreviewUrl(null)
    setIsRunning(false)
    setTerminalOutput([])
    setError(null)
    addTerminalOutput('Ready for new files...')
  }, [addTerminalOutput])

  return {
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
  }
}
