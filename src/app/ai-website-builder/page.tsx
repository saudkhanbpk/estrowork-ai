
// "use client"

// import { useState, useEffect } from "react"
// import { ArrowUp } from "lucide-react"

// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Separator } from "@/components/ui/separator"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs"

// import {
//   Conversation,
//   ConversationContent,
//   ConversationEmptyState,
//   ConversationScrollButton,
// } from "@/components/ui/conversation"
// import { Message, MessageContent } from "@/components/ui/message"
// import { Response } from "@/components/ui/response"
// import { Orb } from "@/components/ui/orb"

// // ... (rest of the static messages and state hooks remain the same) ...
// const staticMessages = [
//   { id: "1", role: "user", content: "Hello AI, I want a landing page." },
//   {
//     id: "2",
//     role: "assistant",
//     content:
//       "Hi! Sure, I can generate a modern landing page for you with a hero section, navbar, and CTA button.",
//   },
// ]

// export default function AIBuilderPage() {
//   const [prompt, setPrompt] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [messages, setMessages] = useState<any[]>(staticMessages)
//   const [generatedCode, setGeneratedCode] = useState<string>("")
//   const [generatedHtml, setGeneratedHtml] = useState<string>("")

//   const handleSendPrompt = async () => {
//     // ... (handleSendPrompt function remains the same) ...
//     if (!prompt.trim()) return

//     setLoading(true)

//     // Add user message
//     setMessages((prev) => [
//       ...prev,
//       { role: "user", content: prompt },
//     ])

//     setPrompt("")

//     // TEMP MOCK RESPONSE
//     setTimeout(() => {
//       const aiResponse =
//         "I have generated a modern landing page with a hero section, navbar, and CTA."

//       const html = `
//         <html>
//           <body style="font-family: sans-serif; padding: 40px">
//             <h1>AI Generated Website</h1>
//             <p>This is a preview of your website.</p>
//             <button style="padding:10px 20px">Get Started</button>
//           </body>
//         </html>
//       `

//       // ---------------------- CHANGE 3: Add AI response ----------------------
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: aiResponse },
//       ])
//       // ---------------------------------------------------------------------

//       setGeneratedCode(html)
//       setGeneratedHtml(html)
//       setLoading(false)
//     }, 1500)
//   }


//   return (

//     <div className="flex flex-col md:flex-row h-screen bg-linear-to-br from-teal-50 via-white to-teal-50">

//       <Card className="w-full md:w-[35%] flex flex-col rounded-none border-b md:border-r md:border-b-0">
//         {/* Header */}
//         <div className="p-4 font-semibold text-lg">
//           AI Website Builder
//         </div>

//         <Separator />

//         {/* Conversation */}
//         {/* On mobile, conversation takes limited height to leave room for the prompt input */}
//         <Conversation className="flex-1 relative h-[50vh] md:h-auto">
//           <ConversationContent>
//             {messages.length === 0 && (
//               <ConversationEmptyState>
//                 Describe the website you want to build 🚀
//               </ConversationEmptyState>
//             )}

//             {messages.map((msg, index) =>
//               msg.role === "user" ? (
//                 <Message key={index} from="user">
//                   <MessageContent>{msg.content}</MessageContent>
//                 </Message>
//               ) : (
//                 <Message key={index} from="assistant">
//                   <MessageContent>{msg.content}</MessageContent>
//                 </Message>
//               )
//             )}
//             {loading && <Orb />}
//           </ConversationContent>

//           <ConversationScrollButton />
//         </Conversation>

//         {/* Prompt Input */}
//         <div className="p-4 border-t bg-background">
//           <div className="flex gap-2 items-center">
//             <Textarea
//               placeholder="Describe the website you want..."
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               className="resize-y"
//             />
//             <Button className="self-center"
//               onClick={handleSendPrompt}
//               disabled={loading}
//               size="icon"
//             >
//               <ArrowUp />
//             </Button>
//           </div>
//         </div>
//       </Card>

//       {/* RIGHT: PREVIEW PANEL */}
//       {/* CHANGE 3: On mobile, remove padding (p-0). On medium screens, add padding (md:p-4) */}
//       <div className="flex-1 p-0 md:p-4">
//         {/* Added margin-top on mobile screens for spacing */}
//         <Card className="h-full mt-4 md:mt-0">
//           <Tabs defaultValue="preview" className="h-full">
//             <TabsList className="m-2">
//               <TabsTrigger value="preview">Preview</TabsTrigger>
//               <TabsTrigger value="code">Code</TabsTrigger>
//             </TabsList>

//             <TabsContent value="preview" className="h-[calc(100%-48px)]">
//               {generatedHtml ? (
//                 <iframe
//                   title="Preview"
//                   srcDoc={generatedHtml}
//                   className="w-full h-full rounded-md border"
//                 />
//               ) : (
//                 <div className="h-full flex items-center justify-center text-muted-foreground">
//                   Preview will appear here
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="code" className="h-[calc(100%-48px)]">
//               <ScrollArea className="h-full p-4">
//                 <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
//                   <code>{generatedCode || "// Code will appear here"}</code>
//                 </pre>
//               </ScrollArea>
//             </TabsContent>
//           </Tabs>
//         </Card>
//       </div>
//     </div>
//   )
// }



"use client"

import { useState } from "react"
import { ArrowUp, Menu, X, Sidebar as SidebarIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { Orb } from "@/components/ui/orb"

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [generatedHtml, setGeneratedHtml] = useState<string>("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setMessages((prev) => [...prev, { role: "user", content: prompt }])
    setPrompt("")

    setTimeout(() => {
      const html = `<html><body style="font-family:sans-serif;padding:40px"><h1>Generated Content</h1></body></html>`
      setMessages((prev) => [...prev, { role: "assistant", content: "Done!" }])
      setGeneratedCode(html); setGeneratedHtml(html); setLoading(false)
    }, 1500)
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">

      {/* LEFT SIDEBAR - Responsive Logic */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white transition-all duration-300 border-r
          md:relative md:z-0
          ${isSidebarOpen ? "w-[85vw] md:w-[350px] lg:w-[400px] translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:hidden"}
        `}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              {/* <SidebarIcon className="h-5 w-5 text-teal-600" /> */}
              <span className="font-bold text-gray-800 truncate">AI Website Builder</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              {/* <X className="h-5 w-5" /> */}
              <SidebarIcon className="h-5 w-5 text-teal-600" />
            </Button>
          </div>

          <Separator />

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            <Conversation className="flex-1">
              <ConversationContent>
                {messages.length === 0 && <ConversationEmptyState title="What are we building today?" />}
                {messages.map((msg, i) => (
                  <Message key={i} from={msg.role}>
                    <MessageContent>{msg.content}</MessageContent>
                  </Message>
                ))}
                {loading && <div className="p-4"><Orb /></div>}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50/50">
            <div className="relative flex items-end gap-2 bg-white border rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20">
              <Textarea
                placeholder="Ask me to change colors, add sections..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[40px] max-h-[200px] border-none focus-visible:ring-0 shadow-none resize-none py-2"
              />
              <Button
                onClick={handleSendPrompt}
                disabled={loading || !prompt.trim()}
                size="icon"
                className="bg-teal-600 hover:bg-teal-700 rounded-lg shrink-0"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT PREVIEW - Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">

        {/* Top Navigation Bar for Preview */}
        <header className="h-14 border-b bg-white flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)} className="h-9 w-9 border-teal-200">
                <Menu className="h-5 w-5 text-teal-600" />
              </Button>
            )}
            <div className="hidden sm:block h-4 w-[1px] bg-gray-200 mx-1" />
            <h2 className="text-sm font-medium text-gray-500 hidden xs:block">Project Preview</h2>
          </div>

          <Tabs defaultValue="preview" className="w-auto">
            <TabsList className="h-9 bg-gray-100 p-1">
              <TabsTrigger value="preview" className="text-xs px-3">Preview</TabsTrigger>
              <TabsTrigger value="code" className="text-xs px-3">Code</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 p-2 md:p-4 overflow-hidden">
          <Card className="h-full w-full overflow-hidden border-gray-200 shadow-sm flex flex-col">
            <Tabs defaultValue="preview" className="h-full flex flex-col">
              <TabsContent value="preview" className="flex-1 m-0 p-0 bg-white">
                {generatedHtml ? (
                  <iframe title="Preview" srcDoc={generatedHtml} className="w-full h-full border-none" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <div className="p-4 rounded-full bg-teal-50">
                      <Orb className="size-10" />
                    </div>
                    <p className="text-sm animate-pulse">Waiting for your first prompt...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="code" className="flex-1 m-0 p-0 bg-[#0f172a]">
                <ScrollArea className="h-full">
                  <pre className="p-4 text-[13px] font-mono text-teal-300">
                    <code>{generatedCode || "// Code will appear here..."}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </main>
    </div>
  )
}