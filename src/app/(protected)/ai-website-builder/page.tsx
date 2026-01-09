"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { ArrowUp, Menu, PanelLeft, Plus, Bot, User, X, FileText, ImageIcon, HardDrive, Notebook, ChevronRight, ChevronDown, File, Folder, Copy, Check, Loader2, CheckCircle2, Circle, Play, Save, Undo2, Download, Trash2, FilePlus, RotateCcw, Clock, ExternalLink, Code2, Terminal } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useGenerateCodeMutation, useListCodeGenerationsQuery, useGetCodeGenerationQuery, type GeneratedFile, type GenerationProgress, type CodeGenerationResponse } from "@/lib/features/api/apiSlice"

// Dynamically import Monaco Editor (client-side only)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

// Dynamically import WebContainerPreview (client-side only)
const WebContainerPreview = dynamic(
  () => import("@/components/WebContainerPreview"),
  { ssr: false }
)


// --- Types ---
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  type?: 'progress' | 'error' | 'success' | 'step'
}

interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileTreeNode[]
  file?: GeneratedFile
}

interface BuildStep {
  id: number
  name: string
  description: string
  status: 'pending' | 'active' | 'completed'
}

// --- Build steps definition ---
const BUILD_STEPS: Omit<BuildStep, 'status'>[] = [
  { id: 1, name: "Analyzing Prompt", description: "Understanding your requirements..." },
  { id: 2, name: "Selecting Tech Stack", description: "Choosing the best technologies..." },
  { id: 3, name: "Designing Architecture", description: "Planning the project structure..." },
  { id: 4, name: "Creating Implementation Plan", description: "Mapping out the code..." },
  { id: 5, name: "Generating Code", description: "Writing the source files..." },
  { id: 6, name: "Creating Tests", description: "Adding test coverage..." },
  { id: 7, name: "Assembling Project", description: "Putting it all together..." },
]

// --- Get file language for Monaco ---
function getFileLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'md': 'markdown',
    'py': 'python',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
  }
  return langMap[ext || ''] || 'plaintext'
}

// --- Build file tree from flat file list ---
function buildFileTree(files: GeneratedFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = []

  for (const file of files) {
    const parts = file.path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1
      const path = parts.slice(0, i + 1).join('/')

      let node = current.find(n => n.name === part)

      if (!node) {
        node = {
          name: part,
          path,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          file: isFile ? file : undefined
        }
        current.push(node)
      }

      if (!isFile && node.children) {
        current = node.children
      }
    }
  }

  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    }).map(node => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined
    }))
  }

  return sortNodes(root)
}

// --- Normalize file content (fix escaped newlines) ---
function normalizeFileContent(content: string): string {
  if (!content || typeof content !== 'string') return ''

  // Replace escaped newlines with actual newlines
  let normalized = content
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\')

  // Handle double-escaped content (e.g., \\n -> \n)
  if (normalized.includes('\\n')) {
    normalized = normalized.replace(/\\n/g, '\n')
  }

  return normalized
}

// --- Get file icon color ---
function getFileIconColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const colors: Record<string, string> = {
    'ts': 'text-blue-400',
    'tsx': 'text-blue-400',
    'js': 'text-yellow-400',
    'jsx': 'text-yellow-400',
    'json': 'text-yellow-600',
    'html': 'text-orange-400',
    'css': 'text-purple-400',
    'scss': 'text-pink-400',
    'md': 'text-slate-400',
  }
  return colors[ext || ''] || 'text-slate-400'
}

// --- SUB-COMPONENT: Build Progress Steps ---
const BuildProgressSteps = ({ steps, currentStep }: { steps: BuildStep[], currentStep: number }) => {
  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`flex items-start gap-3 p-2 rounded-lg transition-all duration-300 ${
            step.status === 'active'
              ? 'bg-teal-50 border border-teal-200'
              : step.status === 'completed'
                ? 'bg-green-50/50'
                : 'opacity-50'
          }`}
        >
          <div className="mt-0.5">
            {step.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : step.status === 'active' ? (
              <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              step.status === 'active' ? 'text-teal-700' :
              step.status === 'completed' ? 'text-green-700' : 'text-slate-400'
            }`}>
              {step.name}
            </p>
            {step.status === 'active' && (
              <p className="text-xs text-teal-600 mt-0.5 animate-pulse">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// --- SUB-COMPONENT: File Tree Node ---
const FileTreeItem = ({
  node,
  depth = 0,
  selectedFile,
  onSelectFile,
  expandedFolders,
  onToggleFolder
}: {
  node: FileTreeNode
  depth?: number
  selectedFile: string | null
  onSelectFile: (file: GeneratedFile) => void
  expandedFolders: Set<string>
  onToggleFolder: (path: string) => void
}) => {
  const isExpanded = expandedFolders.has(node.path)
  const isSelected = selectedFile === node.path

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => onToggleFolder(node.path)}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-[#2d3748] rounded transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
          <Folder className={`w-4 h-4 ${isExpanded ? 'text-teal-400' : 'text-slate-500'}`} />
          <span className="text-slate-300 truncate font-medium">{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map(child => (
              <FileTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => node.file && onSelectFile(node.file)}
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors ${
        isSelected ? 'bg-[#2d3748] text-white' : 'hover:bg-[#2d3748]/50 text-slate-400'
      }`}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <File className={`w-4 h-4 ${getFileIconColor(node.name)}`} />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

// --- SUB-COMPONENT: Project History Card ---
const ProjectCard = ({
  project,
  onOpen
}: {
  project: CodeGenerationResponse
  onOpen: (project: CodeGenerationResponse) => void
}) => {
  const createdAt = new Date(project.createdAt)
  const timeAgo = getTimeAgo(createdAt)
  const fileCount = project.files?.length || 0
  const techStack = project.techStack?.frontend?.framework || 'React'

  return (
    <button
      onClick={() => onOpen(project)}
      className="group relative flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all text-left w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {project.analysis?.appName || 'Untitled Project'}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
        {project.analysis?.appDescription || project.prompt?.slice(0, 100) || 'No description'}
      </p>

      <div className="flex items-center gap-2 mt-auto">
        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
          {techStack}
        </span>
        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
          {fileCount} files
        </span>
        {project.status === 'completed' && (
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
            Completed
          </span>
        )}
      </div>
    </button>
  )
}

// --- Helper: Get time ago string ---
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// --- SUB-COMPONENT: File Preview Chips ---
const FilePreviewArea = ({ files, onRemove }: { files: File[], onRemove: (i: number) => void }) => {
  if (files.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 mb-2 px-2 animate-in fade-in slide-in-from-bottom-1">
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-medium">
          {file.type.startsWith('image/') ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
          <span className="max-w-[120px] truncate">{file.name}</span>
          <button onClick={() => onRemove(index)} className="hover:bg-teal-200 rounded-full p-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

// --- SUB-COMPONENT: Input Bar ---
const InputSection = ({
  prompt,
  setPrompt,
  onSend,
  loading,
  attachedFiles,
  onRemoveFile,
  onFileSelect,
  fileInputRef,
  isLanding = false
}: {
  prompt: string
  setPrompt: (value: string) => void
  onSend: () => void
  loading: boolean
  attachedFiles: File[]
  onRemoveFile: (index: number) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  isLanding?: boolean
}) => {
  return (
    <div className="w-full relative">
      <FilePreviewArea files={attachedFiles} onRemove={onRemoveFile} />
      <div className={`relative flex items-end gap-2 bg-white border-2 border-gray-200 p-2 shadow-sm transition-all focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10
        ${isLanding ? "rounded-2xl sm:rounded-3xl p-3 shadow-lg" : "rounded-2xl"}`}>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={onFileSelect}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-teal-600 hover:bg-teal-50 shrink-0 h-9 w-9">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56 p-2 mb-2 rounded-xl shadow-xl border-gray-100 bg-white">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="flex gap-3 py-2.5 cursor-pointer rounded-lg hover:bg-teal-50">
              <Plus className="w-4 h-4" /> Upload files
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-3 py-2.5 cursor-pointer rounded-lg hover:bg-teal-50">
              <HardDrive className="w-4 h-4" /> Add from Drive
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-3 py-2.5 cursor-pointer rounded-lg hover:bg-teal-50">
              <ImageIcon className="w-4 h-4" /> Photos
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-3 py-2.5 cursor-pointer rounded-lg border-t mt-1 pt-3 hover:bg-teal-50">
              <Notebook className="w-4 h-4" /> NotebookLM
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Textarea
          placeholder={isLanding ? "Describe the app you want to build... (e.g., 'Create a todo app with React')" : "Describe changes..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[44px] max-h-[200px] border-none focus-visible:ring-0 shadow-none resize-none py-3 text-base leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
        />

        <Button
          onClick={onSend}
          disabled={loading || (!prompt.trim() && attachedFiles.length === 0)}
          size="icon"
          className={`bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 rounded-xl shrink-0 transition-all ${isLanding ? "h-11 w-11 sm:rounded-2xl" : "h-9 w-9"}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>(
    BUILD_STEPS.map(s => ({ ...s, status: 'pending' as const }))
  )
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isBuilding, setIsBuilding] = useState(false)
  const [editedContent, setEditedContent] = useState<string>("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConsole, setShowConsole] = useState(true)
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const router = useRouter()

  const [generateCode, { isLoading }] = useGenerateCodeMutation()

  // Fetch previous projects
  const { data: previousProjectsData, isLoading: isLoadingProjects } = useListCodeGenerationsQuery(
    { limit: 6 },
    { skip: hasStarted } // Don't refetch when user starts building
  )
  const previousProjects = previousProjectsData?.data || []

  // Handler to open a previous project
  const openPreviousProject = useCallback((project: CodeGenerationResponse) => {
    setHasStarted(true)
    setGenerationId(project.id)
    setGeneratedFiles(project.files || [])

    // Set up the initial message showing the original prompt
    setMessages([
      { role: 'user', content: project.prompt },
      {
        role: 'assistant',
        content: `🎉 **${project.analysis?.appName || 'Your Application'}** loaded!\n\n📁 **Files:** ${project.files?.length || 0} files\n\n💡 You can continue making changes by describing what you'd like to update.`,
        type: 'success'
      }
    ])

    // Expand file tree
    if (project.files?.length) {
      const roots = new Set<string>()
      project.files.forEach((f: GeneratedFile) => {
        const firstPart = f.path.split('/')[0]
        if (firstPart) roots.add(firstPart)
      })
      setExpandedFolders(roots)
      setSelectedFile(project.files[0])
    }

    setActiveTab('code')
    setBuildSteps(BUILD_STEPS.map(s => ({ ...s, status: 'completed' as const })))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, shouldAutoScroll])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.target as HTMLDivElement
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100
    setShouldAutoScroll(isNearBottom)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setAttachedFiles((prev) => [...prev, ...Array.from(files)])
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const copyCode = useCallback(async () => {
    const content = hasUnsavedChanges ? editedContent : selectedFile?.content
    if (content) {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [selectedFile, editedContent, hasUnsavedChanges])

  // Handle editor content change
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined && selectedFile) {
      setEditedContent(value)
      setHasUnsavedChanges(value !== selectedFile.content)
    }
  }, [selectedFile])

  // Save changes to the file
  const saveChanges = useCallback(() => {
    if (selectedFile && hasUnsavedChanges) {
      setGeneratedFiles(prev => prev.map(f =>
        f.path === selectedFile.path
          ? { ...f, content: editedContent, lines: editedContent.split('\n').length }
          : f
      ))
      setSelectedFile(prev => prev ? { ...prev, content: editedContent, lines: editedContent.split('\n').length } : null)
      setHasUnsavedChanges(false)
    }
  }, [selectedFile, editedContent, hasUnsavedChanges])

  // Revert changes
  const revertChanges = useCallback(() => {
    if (selectedFile) {
      setEditedContent(normalizeFileContent(selectedFile.content))
      setHasUnsavedChanges(false)
    }
  }, [selectedFile])

  // Delete file
  const deleteFile = useCallback((path: string) => {
    setGeneratedFiles(prev => prev.filter(f => f.path !== path))
    if (selectedFile?.path === path) {
      setSelectedFile(null)
      setEditedContent("")
      setHasUnsavedChanges(false)
    }
  }, [selectedFile])

  // Create new file
  const createNewFile = useCallback(() => {
    if (!newFileName.trim()) return

    // Normalize path - ensure it doesn't start with / and has proper structure
    let filePath = newFileName.trim()
    if (filePath.startsWith('/')) filePath = filePath.slice(1)

    // Check if file already exists
    if (generatedFiles.some(f => f.path === filePath)) {
      return // File already exists
    }

    // Determine file type based on extension
    const ext = filePath.split('.').pop()?.toLowerCase() || ''
    let fileType: GeneratedFile['type'] = 'other'
    if (['tsx', 'jsx', 'ts', 'js'].includes(ext)) {
      if (filePath.includes('component') || filePath.includes('Component')) {
        fileType = 'component'
      } else if (filePath.includes('page') || filePath.includes('Page')) {
        fileType = 'page'
      } else if (filePath.includes('util') || filePath.includes('hook')) {
        fileType = 'util'
      } else {
        fileType = 'component'
      }
    } else if (['css', 'scss', 'sass'].includes(ext)) {
      fileType = 'style'
    } else if (['json'].includes(ext)) {
      fileType = 'config'
    } else if (filePath.includes('test') || filePath.includes('spec')) {
      fileType = 'test'
    }

    // Create default content based on file type
    let defaultContent = ''
    if (ext === 'tsx' || ext === 'jsx') {
      const componentName = filePath.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || 'NewComponent'
      defaultContent = `import React from 'react';\n\nexport default function ${componentName}() {\n  return (\n    <div>\n      <h1>${componentName}</h1>\n    </div>\n  );\n}\n`
    } else if (ext === 'ts' || ext === 'js') {
      defaultContent = `// ${filePath}\n\nexport {};\n`
    } else if (ext === 'css') {
      defaultContent = `/* ${filePath} */\n\n`
    } else if (ext === 'json') {
      defaultContent = `{\n  \n}\n`
    }

    const newFile: GeneratedFile = {
      path: filePath,
      content: defaultContent,
      type: fileType,
      lines: defaultContent.split('\n').length
    }

    setGeneratedFiles(prev => [...prev, newFile])
    setSelectedFile(newFile)
    setEditedContent(defaultContent)
    setHasUnsavedChanges(false)
    setIsCreatingFile(false)
    setNewFileName("")

    // Expand parent folders
    const parts = filePath.split('/')
    if (parts.length > 1) {
      const folders = new Set<string>()
      for (let i = 0; i < parts.length - 1; i++) {
        folders.add(parts.slice(0, i + 1).join('/'))
      }
      setExpandedFolders(prev => new Set([...prev, ...folders]))
    }
  }, [newFileName, generatedFiles])

  // Download single file
  const downloadFile = useCallback(() => {
    if (selectedFile) {
      const content = hasUnsavedChanges ? editedContent : selectedFile.content
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = selectedFile.path.split('/').pop() || 'file.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [selectedFile, editedContent, hasUnsavedChanges])

  // Download all files as ZIP (simplified - creates individual downloads)
  const downloadAllFiles = useCallback(() => {
    generatedFiles.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.path.replace(/\//g, '_')
      a.click()
      URL.revokeObjectURL(url)
    })
  }, [generatedFiles])

  // Start a new project (reset everything)
  const startNewProject = useCallback(() => {
    setMessages([])
    setGeneratedFiles([])
    setSelectedFile(null)
    setGenerationId(null)
    setHasStarted(false)
    setExpandedFolders(new Set())
    setEditedContent("")
    setHasUnsavedChanges(false)
    setBuildSteps(BUILD_STEPS.map(s => ({ ...s, status: 'pending' as const })))
    setCurrentStepIndex(-1)
    setIsBuilding(false)
    setActiveTab('preview')
  }, [])

  // Update edited content when selecting a new file
  useEffect(() => {
    if (selectedFile) {
      setEditedContent(normalizeFileContent(selectedFile.content))
      setHasUnsavedChanges(false)
    }
  }, [selectedFile?.path]) // Only run when path changes

  // Update build step based on step name from backend
  const updateBuildStep = useCallback((stepName: string) => {
    const stepMapping: Record<string, number> = {
      'analyzePrompt': 0,
      'Analyzing': 0,
      'selectTechStack': 1,
      'Selecting': 1,
      'generateArchitecture': 2,
      'Designing': 2,
      'generatePlan': 3,
      'Planning': 3,
      'generateCode': 4,
      'Generating': 4,
      'generateTests': 5,
      'Testing': 5,
      'assembleProject': 6,
      'Assembling': 6,
      'finalize': 6,
      'Finalizing': 6,
    }

    const stepIndex = stepMapping[stepName] ?? -1
    if (stepIndex >= 0) {
      setCurrentStepIndex(stepIndex)
      setBuildSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx < stepIndex ? 'completed' : idx === stepIndex ? 'active' : 'pending'
      })))
    }
  }, [])

  const subscribeToProgress = useCallback((id: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:4000/api"
    const eventSource = new EventSource(`${API_BASE}/generate/${id}/stream`)
    eventSourceRef.current = eventSource

    eventSource.addEventListener('connected', () => {
      console.log('SSE connected for generation:', id)
    })

    eventSource.addEventListener('progress', (event) => {
      try {
        const data = JSON.parse(event.data)
        const progress = data.data?.progress as GenerationProgress
        if (!progress) return

        updateBuildStep(progress.currentStepName)

        setMessages(prev => {
          const filtered = prev.filter(m => m.type !== 'step')
          return [...filtered, {
            role: 'system' as const,
            content: `${progress.currentStepName}: ${progress.message}`,
            type: 'step' as const
          }]
        })
      } catch (e) {
        console.error('Failed to parse progress event:', e)
      }
    })

    eventSource.addEventListener('step_complete', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.data?.step) {
          updateBuildStep(data.data.step)
        }
      } catch (e) {
        console.error('Failed to parse step_complete event:', e)
      }
    })

    eventSource.addEventListener('file_generated', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.data?.file?.path) {
          setMessages(prev => [...prev, {
            role: 'system' as const,
            content: `Created: ${data.data.file.path}`,
            type: 'progress' as const
          }])
        }
      } catch (e) {
        console.error('Failed to parse file_generated event:', e)
      }
    })

    eventSource.addEventListener('complete', (event) => {
      let data
      try {
        data = JSON.parse(event.data)
      } catch (e) {
        console.error('Failed to parse complete event:', e)
        setIsBuilding(false)
        eventSource.close()
        return
      }
      setIsBuilding(false)
      setBuildSteps(prev => prev.map(step => ({ ...step, status: 'completed' as const })))

      if (data.data.result) {
        const result = data.data.result
        const newFiles = result.files || []

        // Check if this is an update (we had previous files) or initial generation
        setGeneratedFiles(prevFiles => {
          if (prevFiles.length === 0) {
            // Initial generation - just set the files
            return newFiles
          } else {
            // Update - merge files (new files override existing, keep unchanged files)
            const fileMap = new Map(prevFiles.map(f => [f.path, f]))
            newFiles.forEach((f: GeneratedFile) => {
              fileMap.set(f.path, f)
            })
            return Array.from(fileMap.values())
          }
        })

        if (newFiles.length > 0) {
          const roots = new Set<string>()
          newFiles.forEach((f: GeneratedFile) => {
            const firstPart = f.path.split('/')[0]
            if (firstPart) roots.add(firstPart)
          })
          setExpandedFolders(prev => new Set([...prev, ...roots]))
          setSelectedFile(newFiles[0])
          setActiveTab('code')
        }

        // Build summary message - context-aware for initial vs update
        const analysis = result.analysis
        const techStack = result.techStack
        const files = newFiles

        // Check if this is an update based on whether we had messages before
        const isUpdate = messages.length > 2 // More than just initial user message + system responses

        let summaryMessage = ''

        if (isUpdate) {
          // Update message
          summaryMessage = `✅ **Updates Applied!**\n\n`
          summaryMessage += `📁 **Modified/Added:** ${files.length} files\n`

          files.slice(0, 5).forEach((f: GeneratedFile) => {
            summaryMessage += `• ${f.path}\n`
          })
          if (files.length > 5) {
            summaryMessage += `• ...and ${files.length - 5} more\n`
          }

          summaryMessage += `\n💡 You can continue making changes by describing what you'd like to update.`
        } else {
          // Initial generation message
          summaryMessage = `🎉 **${analysis?.appName || 'Your Application'}** is ready!\n\n`

          if (analysis?.appDescription) {
            summaryMessage += `📝 **Description:** ${analysis.appDescription}\n\n`
          }

          if (techStack) {
            summaryMessage += `🛠️ **Tech Stack:**\n`
            if (techStack.frontend) {
              summaryMessage += `• Framework: ${techStack.frontend.framework || 'React'}\n`
              summaryMessage += `• Styling: ${techStack.frontend.styling || 'CSS'}\n`
              if (techStack.frontend.stateManagement) {
                summaryMessage += `• State: ${techStack.frontend.stateManagement}\n`
              }
            }
            if (techStack.backend) {
              summaryMessage += `• Backend: ${techStack.backend.framework || 'Node.js'}\n`
              if (techStack.backend.database) {
                summaryMessage += `• Database: ${techStack.backend.database}\n`
              }
            }
            summaryMessage += '\n'
          }

          if (analysis?.features && analysis.features.length > 0) {
            summaryMessage += `✨ **Features:**\n`
            analysis.features.slice(0, 5).forEach((feature: { name: string; description?: string }) => {
              summaryMessage += `• ${feature.name}\n`
            })
            if (analysis.features.length > 5) {
              summaryMessage += `• ...and ${analysis.features.length - 5} more\n`
            }
            summaryMessage += '\n'
          }

          summaryMessage += `📁 **Generated Files:** ${files.length} files\n`

          // Group files by type
          const fileTypes: Record<string, number> = {}
          files.forEach((f: GeneratedFile) => {
            const ext = f.path.split('.').pop() || 'other'
            fileTypes[ext] = (fileTypes[ext] || 0) + 1
          })

          const typeLabels: Record<string, string> = {
            'tsx': 'TypeScript React',
            'ts': 'TypeScript',
            'jsx': 'React',
            'js': 'JavaScript',
            'css': 'Styles',
            'json': 'Config',
            'html': 'HTML',
            'md': 'Documentation'
          }

          Object.entries(fileTypes).slice(0, 4).forEach(([ext, count]) => {
            summaryMessage += `• ${count} ${typeLabels[ext] || ext.toUpperCase()} file${count > 1 ? 's' : ''}\n`
          })

          summaryMessage += `\n👉 Switch to the **Code** tab to explore your project!`
          summaryMessage += `\n💡 You can ask me to make changes or add features.`
        }

        setMessages(prev => prev.filter(m => m.type !== 'step').concat([{
          role: 'assistant',
          content: summaryMessage,
          type: 'success'
        }]))
      }
      eventSource.close()
    })

    eventSource.addEventListener('error', () => {
      setIsBuilding(false)
      eventSource.close()
    })

    eventSource.onerror = () => {
      eventSource.close()
    }
  }, [updateBuildStep, messages.length])

  const handleSendPrompt = async () => {
    if (!prompt.trim() && attachedFiles.length === 0) return
    if (isLoading) return

    const isFirstMessage = !hasStarted
    if (!hasStarted) setHasStarted(true)

    setShouldAutoScroll(true)
    const currentPrompt = prompt
    const fileNames = attachedFiles.map(f => f.name).join(", ")
    const displayContent = currentPrompt + (fileNames ? `\n\n[Attached: ${fileNames}]` : "")

    // Append to messages instead of replacing (preserve chat history)
    setMessages(prev => [...prev, { role: "user" as const, content: displayContent }])
    setPrompt("")
    setAttachedFiles([])

    // Only clear files on first message; for follow-ups, keep existing files
    if (isFirstMessage) {
      setGeneratedFiles([])
      setSelectedFile(null)
    }

    setIsBuilding(true)
    setCurrentStepIndex(0)
    setBuildSteps(BUILD_STEPS.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'active' : 'pending'
    })))

    // Build context from existing files for follow-up requests
    // Use summarized context to avoid hitting the 5000 char limit
    let fullPrompt = currentPrompt
    if (!isFirstMessage && generatedFiles.length > 0) {
      // Create a compact file summary (paths + first few lines) to stay under limit
      const fileList = generatedFiles.map(f => {
        const preview = f.content.split('\n').slice(0, 3).join(' ').slice(0, 100)
        return `- ${f.path} (${f.lines} lines): ${preview}...`
      }).join('\n')

      // Build context that fits within limit
      const contextPrefix = `Existing project structure:\n${fileList}\n\nUpdate request: `
      const maxPromptLength = 4500 // Leave buffer for backend processing

      if (contextPrefix.length + currentPrompt.length > maxPromptLength) {
        // If still too long, just send paths
        const shortList = generatedFiles.map(f => f.path).join(', ')
        fullPrompt = `Project files: ${shortList}\n\nUpdate: ${currentPrompt}`
      } else {
        fullPrompt = `${contextPrefix}${currentPrompt}\n\nModify only the necessary files while keeping the same structure.`
      }
    }

    try {
      const result = await generateCode({ prompt: fullPrompt }).unwrap()

      if (result.success && result.data) {
        const generation = result.data
        setGenerationId(generation.id)

        if (generation.status !== 'completed' && generation.status !== 'failed') {
          subscribeToProgress(generation.id)
        } else {
          setIsBuilding(false)
          setBuildSteps(prev => prev.map(step => ({ ...step, status: 'completed' as const })))
          setGeneratedFiles(generation.files || [])

          if (generation.files?.length > 0) {
            const roots = new Set<string>()
            generation.files.forEach((f: GeneratedFile) => {
              const firstPart = f.path.split('/')[0]
              if (firstPart) roots.add(firstPart)
            })
            setExpandedFolders(roots)
            setSelectedFile(generation.files[0])
            setActiveTab('code')
          }

          // Build detailed summary message
          const analysis = generation.analysis
          const techStack = generation.techStack
          const files = generation.files || []

          let summaryMessage = `🎉 **${analysis?.appName || 'Your Application'}** is ready!\n\n`

          if (analysis?.appDescription) {
            summaryMessage += `📝 **Description:** ${analysis.appDescription}\n\n`
          }

          if (techStack) {
            summaryMessage += `🛠️ **Tech Stack:**\n`
            if (techStack.frontend) {
              summaryMessage += `• Framework: ${techStack.frontend.framework || 'React'}\n`
              summaryMessage += `• Styling: ${techStack.frontend.styling || 'CSS'}\n`
              if (techStack.frontend.stateManagement) {
                summaryMessage += `• State: ${techStack.frontend.stateManagement}\n`
              }
            }
            if (techStack.backend) {
              summaryMessage += `• Backend: ${techStack.backend.framework || 'Node.js'}\n`
              if (techStack.backend.database) {
                summaryMessage += `• Database: ${techStack.backend.database}\n`
              }
            }
            summaryMessage += '\n'
          }

          if (analysis?.features && analysis.features.length > 0) {
            summaryMessage += `✨ **Features:**\n`
            analysis.features.slice(0, 5).forEach((feature: { name: string; description?: string }) => {
              summaryMessage += `• ${feature.name}\n`
            })
            if (analysis.features.length > 5) {
              summaryMessage += `• ...and ${analysis.features.length - 5} more\n`
            }
            summaryMessage += '\n'
          }

          summaryMessage += `📁 **Generated Files:** ${files.length} files\n`

          const fileTypes: Record<string, number> = {}
          files.forEach((f: GeneratedFile) => {
            const ext = f.path.split('.').pop() || 'other'
            fileTypes[ext] = (fileTypes[ext] || 0) + 1
          })

          const typeLabels: Record<string, string> = {
            'tsx': 'TypeScript React',
            'ts': 'TypeScript',
            'jsx': 'React',
            'js': 'JavaScript',
            'css': 'Styles',
            'json': 'Config',
            'html': 'HTML',
            'md': 'Documentation'
          }

          Object.entries(fileTypes).slice(0, 4).forEach(([ext, count]) => {
            summaryMessage += `• ${count} ${typeLabels[ext] || ext.toUpperCase()} file${count > 1 ? 's' : ''}\n`
          })

          summaryMessage += `\n👉 Switch to the **Code** tab to explore your project!`

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: summaryMessage,
            type: 'success'
          }])
        }
      }
    } catch (error: unknown) {
      console.error('Generation error:', error)
      setIsBuilding(false)
      setBuildSteps(BUILD_STEPS.map(s => ({ ...s, status: 'pending' as const })))
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message || 'Unknown error'
        : 'Failed to generate code'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        type: 'error'
      }])
    }
  }

  const fileTree = buildFileTree(generatedFiles)

  const inputProps = {
    prompt,
    setPrompt,
    onSend: handleSendPrompt,
    loading: isLoading || isBuilding,
    attachedFiles,
    onRemoveFile: removeFile,
    onFileSelect: handleFileSelect,
    fileInputRef
  }

  // Landing view
  if (!hasStarted) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-white">
        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-3xl space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-teal-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                  <div className="relative bg-teal-600 w-full h-full rounded-full flex items-center justify-center text-white shadow-lg">
                    <Bot className="w-8 h-8" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">What can I build for you?</h1>
              <p className="text-gray-500 text-lg">Describe your app and I&apos;ll generate the code automatically.</p>
            </div>

            <InputSection {...inputProps} isLanding={true} />

            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {['Create a todo app', 'Build a weather dashboard', 'Make a simple blog'].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="rounded-full text-gray-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all"
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Previous Projects Section */}
        {previousProjects.length > 0 && (
          <div className="w-full border-t bg-slate-50/50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  Your Recent Projects
                </h2>
                <span className="text-sm text-gray-500">{previousProjects.length} project{previousProjects.length > 1 ? 's' : ''}</span>
              </div>

              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previousProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpen={openPreviousProject}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main builder view
  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans animate-in fade-in duration-500">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white transition-all duration-300 border-r md:relative md:z-0 ${isSidebarOpen ? "w-[85vw] sm:w-[400px] md:w-[350px] lg:w-[400px]" : "w-0 -translate-x-full md:hidden"}`}>
        <div className="flex flex-col h-full w-full min-h-0">
          <div className="p-4 flex items-center justify-between">
            <span className="font-bold text-gray-800 text-lg">AI Builder</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={startNewProject}
                className="h-8 w-8 text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                title="New Project"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <PanelLeft className="h-5 w-5 text-teal-600" />
              </Button>
            </div>
          </div>
          <Separator />

          {/* Build Progress Steps */}
          {isBuilding && (
            <div className="p-4 border-b bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span className="text-sm font-medium text-slate-700">Building your app...</span>
              </div>
              <BuildProgressSteps steps={buildSteps} currentStep={currentStepIndex} />
            </div>
          )}

          <ScrollArea className="flex-1 min-h-0" onScrollCapture={handleScroll}>
            <div className="p-4 space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role !== 'system' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'}`}>
                      {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : msg.role === 'system'
                        ? msg.type === 'step'
                          ? 'bg-blue-50 text-blue-700 text-xs ml-11 border border-blue-100'
                          : 'bg-slate-100 text-slate-600 text-xs ml-11'
                        : msg.type === 'error'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : msg.type === 'success'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.content.split('\n').map((line, idx) => {
                      // Simple markdown-like parsing for bold text
                      const parts = line.split(/\*\*(.*?)\*\*/g)
                      return (
                        <span key={idx}>
                          {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                          )}
                          {idx < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-gray-50/30">
            <InputSection {...inputProps} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50 relative h-full">
        <header className="h-14 border-b bg-white flex items-center px-4 justify-between shrink-0 flex-none">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)} className="h-9 w-9 border-teal-200">
                <Menu className="h-5 w-5 text-teal-600" />
              </Button>
            )}
            <h2 className="text-sm font-medium text-gray-500">
              {generationId ? `Project` : 'Project Preview'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {generatedFiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAllFiles}
                className="h-8 px-3 text-teal-600 border-teal-200 hover:bg-teal-50"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download All
              </Button>
            )}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Play className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'code' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                Code {generatedFiles.length > 0 && `(${generatedFiles.length})`}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-3 overflow-hidden min-h-0">
          <Card className="h-full w-full overflow-hidden border-gray-200 shadow-sm">
            {activeTab === 'preview' ? (
              <div className="h-full w-full">
                <WebContainerPreview files={generatedFiles} />
              </div>
            ) : (
              <div className="flex h-full">
                {/* File tree sidebar */}
                <div className="w-60 border-r bg-[#1e1e1e] flex flex-col">
                  <div className="p-3 border-b border-[#333] flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Explorer</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCreatingFile(true)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-[#333]"
                      title="New File"
                    >
                      <FilePlus className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* New file input */}
                  {isCreatingFile && (
                    <div className="p-2 border-b border-[#333] bg-[#252526]">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') createNewFile()
                            if (e.key === 'Escape') {
                              setIsCreatingFile(false)
                              setNewFileName("")
                            }
                          }}
                          placeholder="src/components/File.tsx"
                          className="flex-1 bg-[#3c3c3c] text-slate-200 text-xs px-2 py-1.5 rounded border border-[#555] focus:border-teal-500 focus:outline-none"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={createNewFile}
                          className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-900/30"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsCreatingFile(false)
                            setNewFileName("")
                          }}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-[#333]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <ScrollArea className="flex-1">
                    <div className="py-2">
                      {fileTree.length > 0 ? (
                        fileTree.map(node => (
                          <FileTreeItem
                            key={node.path}
                            node={node}
                            selectedFile={selectedFile?.path || null}
                            onSelectFile={setSelectedFile}
                            expandedFolders={expandedFolders}
                            onToggleFolder={toggleFolder}
                          />
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          No files generated yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Code editor with terminal */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                  {selectedFile ? (
                    <>
                      {/* Editor toolbar */}
                      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333] bg-[#252526]">
                        <div className="flex items-center gap-2">
                          <File className={`w-4 h-4 ${getFileIconColor(selectedFile.path)}`} />
                          <span className="text-sm text-slate-300">{selectedFile.path.split('/').pop()}</span>
                          {hasUnsavedChanges && (
                            <span className="w-2 h-2 bg-orange-400 rounded-full" title="Unsaved changes" />
                          )}
                          <span className="text-xs text-slate-500 ml-2">{selectedFile.path}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasUnsavedChanges && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveChanges}
                                className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-900/30"
                                title="Save changes (Ctrl+S)"
                              >
                                <Save className="w-4 h-4" />
                                <span className="ml-1.5 text-xs">Save</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={revertChanges}
                                className="h-7 px-2 text-orange-400 hover:text-orange-300 hover:bg-orange-900/30"
                                title="Revert changes"
                              >
                                <Undo2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyCode}
                            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-[#333]"
                            title="Copy code"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={downloadFile}
                            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-[#333]"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFile(selectedFile.path)}
                            className="h-7 px-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="w-px h-5 bg-[#444] mx-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConsole(!showConsole)}
                            className={`h-7 px-2 ${showConsole ? 'text-teal-400 bg-teal-900/20' : 'text-slate-400'} hover:text-white hover:bg-[#333]`}
                            title="Toggle Terminal"
                          >
                            <Terminal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Monaco Editor - Fully Editable */}
                      <div className={showConsole ? "h-[60%]" : "flex-1"}>
                        <MonacoEditor
                          height="100%"
                          language={getFileLanguage(selectedFile.path)}
                          value={editedContent || normalizeFileContent(selectedFile.content)}
                          theme="vs-dark"
                          onChange={handleEditorChange}
                          options={{
                            readOnly: false,
                            minimap: { enabled: true },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            padding: { top: 16 },
                            automaticLayout: true,
                            tabSize: 2,
                            formatOnPaste: true,
                            formatOnType: true,
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: true,
                            folding: true,
                            foldingStrategy: 'indentation',
                            showFoldingControls: 'always',
                            bracketPairColorization: { enabled: true },
                            autoClosingBrackets: 'always',
                            autoClosingQuotes: 'always',
                            autoIndent: 'full',
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            smoothScrolling: true,
                            contextmenu: true,
                            mouseWheelZoom: true,
                          }}
                          onMount={(editor, monaco) => {
                            // Add Ctrl+S save shortcut
                            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                              saveChanges()
                            })
                          }}
                        />
                      </div>
                      {/* Terminal/Console section in code editor */}
                      {showConsole && generatedFiles.length > 0 && (
                        <div className="h-[40%] border-t border-[#333] flex flex-col bg-[#1e1e1e]">
                          <div className="flex items-center justify-between px-3 py-2 border-b border-[#333] bg-[#252526]">
                            <div className="flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-teal-400" />
                              <span className="text-xs font-medium text-slate-300">Console</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowConsole(false)}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-[#333]"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex-1 overflow-hidden p-3 font-mono text-xs text-green-400">
                            <p className="text-slate-500">Console output available in Preview tab terminal.</p>
                            <p className="text-slate-500 mt-2">Switch to Preview tab to see live server logs.</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                      <div className="text-center">
                        <File className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-sm text-slate-400">Select a file to view and edit</p>
                        <p className="text-xs text-slate-500 mt-2">Full VS Code editing experience</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
