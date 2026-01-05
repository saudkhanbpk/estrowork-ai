"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowUp, Menu, PanelLeft, Plus, Bot, User, X, FileText, ImageIcon, HardDrive, Notebook } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

// --- SUB-COMPONENT: Input Bar (Defined outside to prevent focus loss) ---
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
}: any) => {
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
          placeholder={isLanding ? "Ask me to build a landing page..." : "Describe changes..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[44px] max-h-[200px] border-none focus-visible:ring-0 shadow-none resize-none py-3 text-base leading-relaxed"
          onKeyDown={(e) => {
            // Check for Enter key without Shift
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
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
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [generatedHtml, setGeneratedHtml] = useState<string>("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading, shouldAutoScroll])

  const handleScroll = (e: any) => {
    const element = e.target
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

  const handleSendPrompt = async () => {
    if (!prompt.trim() && attachedFiles.length === 0) return
    if (loading) return 

    if (!hasStarted) setHasStarted(true)

    setLoading(true)
    setShouldAutoScroll(true)
    
    const currentPrompt = prompt
    const fileNames = attachedFiles.map(f => f.name).join(", ")
    const displayContent = currentPrompt + (fileNames ? `\n\n[Attached: ${fileNames}]` : "")

    setMessages((prev) => [...prev, { role: "user", content: displayContent }])
    setPrompt("")
    setAttachedFiles([]) 

    // Simulated AI Processing
    setTimeout(() => {
      const html = `<html><body style="font-family:sans-serif;padding:40px;display:flex;justify-content:center;align-items:center;height:80vh;background:#f0fdfa">
        <div style="text-align:center;border:2px solid #0d9488;padding:2rem;border-radius:1rem;background:white">
          <h1 style="color:#0d9488">Website Updated!</h1>
          <p>Request processed successfully.</p>
        </div>
      </body></html>`
      setMessages((prev) => [...prev, { role: "assistant", content: "I've processed your request and updated the preview!" }])
      setGeneratedCode(html)
      setGeneratedHtml(html)
      setLoading(false)
    }, 2000)
  }

  // Common props for InputSection
  const inputProps = {
    prompt,
    setPrompt,
    onSend: handleSendPrompt,
    loading,
    attachedFiles,
    onRemoveFile: removeFile,
    onFileSelect: handleFileSelect,
    fileInputRef
  }

  if (!hasStarted) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-4">
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
            <p className="text-gray-500 text-lg">Upload an image or describe your vision to get started.</p>
          </div>

          <InputSection {...inputProps} isLanding={true} />

          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {['SaaS Landing Page', 'Portfolio Website', 'E-commerce Store'].map((suggestion) => (
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
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans animate-in fade-in duration-500">
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white transition-all duration-300 border-r md:relative md:z-0 ${isSidebarOpen ? "w-[85vw] sm:w-[400px] md:w-[350px] lg:w-[400px]" : "w-0 -translate-x-full md:hidden"}`}>
        <div className="flex flex-col h-full w-full min-h-0">
          <div className="p-4 flex items-center justify-between">
            <span className="font-bold text-gray-800 text-lg">AI Builder</span>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <PanelLeft className="h-5 w-5 text-teal-600" />
            </Button>
          </div>
          <Separator />
          <ScrollArea className="flex-1 min-h-0" onScrollCapture={handleScroll}>
            <div className="p-4 space-y-6 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'}`}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[85%] mb-4 rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-gray-50/30">
            <InputSection {...inputProps} />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-14 border-b bg-white flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)} className="h-9 w-9 border-teal-200">
                <Menu className="h-5 w-5 text-teal-600" />
              </Button>
            )}
            <h2 className="text-sm font-medium text-gray-500">Project Preview</h2>
          </div>
          <Tabs defaultValue="preview" className="w-auto">
            <TabsList className="h-9">
              <TabsTrigger value="preview" className="text-sm">Preview</TabsTrigger>
              <TabsTrigger value="code" className="text-sm">Code</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        <div className="flex-1 p-3 overflow-hidden">
          <Card className="h-full w-full overflow-hidden border-gray-200 shadow-sm">
            <Tabs defaultValue="preview" className="h-full flex flex-col">
              <TabsContent value="preview" className="flex-1 m-0 p-0 bg-white">
                <iframe title="Preview" srcDoc={generatedHtml} className="w-full h-full border-none" />
              </TabsContent>
              <TabsContent value="code" className="flex-1 m-0 p-0 bg-[#0f172a]">
                <ScrollArea className="h-full">
                  <pre className="p-4 text-[13px] font-mono text-teal-300">
                    <code>{generatedCode || "// Your generated code will appear here..."}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  )
}
