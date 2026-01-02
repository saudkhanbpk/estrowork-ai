// "use client"

// import { useState } from "react"
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

// // ElevenLabs conversation components
// import {
//   Conversation,
//   ConversationContent,
//   ConversationEmptyState,
//   ConversationScrollButton,
// } from "@/components/ui/conversation"
// import { Message, MessageContent } from "@/components/ui/message"
// import { Response } from "@/components/ui/response"
// import { Orb } from "@/components/ui/orb"

// export default function AIBuilderPage() {
//   const [prompt, setPrompt] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [messages, setMessages] = useState<any[]>([])
//   const [generatedCode, setGeneratedCode] = useState<string>("")
//   const [generatedHtml, setGeneratedHtml] = useState<string>("")

//   const handleSendPrompt = async () => {
//     if (!prompt.trim()) return

//     setLoading(true)

//     // Add user message
//     setMessages((prev) => [
//       ...prev,
//       { role: "user", content: prompt },
//     ])

//     setPrompt("")

//     // 🔴 TEMP MOCK RESPONSE (replace with API later)
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

//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: aiResponse },
//       ])

//       setGeneratedCode(html)
//       setGeneratedHtml(html)
//       setLoading(false)
//     }, 1500)
//   }

//   return (
//     <div className="flex h-screen bg-background">
//       {/* LEFT: CONVERSATION PANEL */}
//       <Card className="w-[35%] flex flex-col rounded-none border-r">
//         {/* Header */}
//         <div className="p-4 font-semibold text-lg">
//           AI Website Builder
//         </div>

//         <Separator />

//         {/* Conversation */}
//         <Conversation className="flex-1 relative">
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
//           <div className="flex gap-2">
//             <Textarea
//               placeholder="Describe the website you want..."
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               className="resize-none"
//               rows={2}
//             />
//             <Button
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
//       <div className="flex-1 p-4">
//         <Card className="h-full">
//           <Tabs defaultValue="preview" className="h-full">
//             {/* Tabs Header */}
//             <TabsList className="m-2">
//               <TabsTrigger value="preview">Preview</TabsTrigger>
//               <TabsTrigger value="code">Code</TabsTrigger>
//             </TabsList>

//             {/* Preview Tab */}
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

//             {/* Code Tab */}
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

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { Response } from "@/components/ui/response"
import { Orb } from "@/components/ui/orb"

// ... (rest of the static messages and state hooks remain the same) ...
const staticMessages = [
  { id: "1", role: "user", content: "Hello AI, I want a landing page." },
  {
    id: "2",
    role: "assistant",
    content:
      "Hi! Sure, I can generate a modern landing page for you with a hero section, navbar, and CTA button.",
  },
]

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>(staticMessages)
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [generatedHtml, setGeneratedHtml] = useState<string>("")

  const handleSendPrompt = async () => {
    // ... (handleSendPrompt function remains the same) ...
    if (!prompt.trim()) return

    setLoading(true)

    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: prompt },
    ])

    setPrompt("")

    // TEMP MOCK RESPONSE
    setTimeout(() => {
      const aiResponse =
        "I have generated a modern landing page with a hero section, navbar, and CTA."

      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px">
            <h1>AI Generated Website</h1>
            <p>This is a preview of your website.</p>
            <button style="padding:10px 20px">Get Started</button>
          </body>
        </html>
      `

      // ---------------------- CHANGE 3: Add AI response ----------------------
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ])
      // ---------------------------------------------------------------------

      setGeneratedCode(html)
      setGeneratedHtml(html)
      setLoading(false)
    }, 1500)
  }


  return (
    // CHANGE 1: Use flex-col by default (mobile), md:flex-row for medium screens and up (desktop/tablet)
    <div className="flex flex-col md:flex-row h-screen bg-background">
      
      {/* LEFT: CONVERSATION PANEL */}
      {/* CHANGE 2: On mobile, left panel takes full width (w-full). On medium screens, it takes 35% (md:w-[35%]) */}
      <Card className="w-full md:w-[35%] flex flex-col rounded-none border-b md:border-r md:border-b-0">
        {/* Header */}
        <div className="p-4 font-semibold text-lg">
          AI Website Builder
        </div>

        <Separator />

        {/* Conversation */}
        {/* On mobile, conversation takes limited height to leave room for the prompt input */}
        <Conversation className="flex-1 relative h-[50vh] md:h-auto">
          <ConversationContent>
            {messages.length === 0 && (
              <ConversationEmptyState>
                Describe the website you want to build 🚀
              </ConversationEmptyState>
            )}

            {messages.map((msg, index) =>
              msg.role === "user" ? (
                <Message key={index} from="user">
                  <MessageContent>{msg.content}</MessageContent>
                </Message>
              ) : (
                <Message key={index} from="assistant">
                  <MessageContent>{msg.content}</MessageContent>
                </Message>
              )
            )}
            {loading && <Orb />}
          </ConversationContent>

          <ConversationScrollButton />
        </Conversation>

        {/* Prompt Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2 items-center">
            <Textarea
              placeholder="Describe the website you want..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="resize-y"
            />
            <Button className="self-center"
              onClick={handleSendPrompt}
              disabled={loading}
              size="icon"
            >
              <ArrowUp />
            </Button>
          </div>
        </div>
      </Card>

      {/* RIGHT: PREVIEW PANEL */}
      {/* CHANGE 3: On mobile, remove padding (p-0). On medium screens, add padding (md:p-4) */}
      <div className="flex-1 p-0 md:p-4">
        {/* Added margin-top on mobile screens for spacing */}
        <Card className="h-full mt-4 md:mt-0"> 
          <Tabs defaultValue="preview" className="h-full">
            <TabsList className="m-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="h-[calc(100%-48px)]">
              {generatedHtml ? (
                <iframe
                  title="Preview"
                  srcDoc={generatedHtml}
                  className="w-full h-full rounded-md border"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Preview will appear here
                </div>
              )}
            </TabsContent>

            <TabsContent value="code" className="h-[calc(100%-48px)]">
              <ScrollArea className="h-full p-4">
                <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                  <code>{generatedCode || "// Code will appear here"}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
