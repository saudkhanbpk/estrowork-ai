"use client"

import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { Orb } from "@/components/ui/orb"
import { Response } from "@/components/ui/response"

const allMessages = [
  {
    id: "1",
    role: "user" as const,
    parts: [
      {
        type: "text",
        text:
          "I want to build a digital product and need expert guidance on strategy, design, development, cost, and delivery timeline.",
      },
    ],
  },
  {
    id: "2",
    role: "assistant" as const,
    parts: [
      {
        type: "text",
        tokens: [
          "Excellent",
          " decision.",
          " I’ll",
          " help",
          " you",
          " turn",
          " your",
          " idea",
          " into",
          " a",
          " well-defined,",
          " execution-ready",
          " product",
          " plan.",
          "\n\n",
          "This",
          " workspace",
          " blends",
          " AI-powered",
          " planning",
          " with",
          " access",
          " to",
          " skilled",
          " human",
          " designers,",
          " engineers,",
          " and",
          " project",
          " managers",
          " who",
          " can",
          " build,",
          " iterate,",
          " and",
          " maintain",
          " your",
          " product.",
          "\n\n",
          "To",
          " get",
          " started,",
          " please",
          " answer",
          " a",
          " few",
          " questions:",
          "\n",
          "1️⃣",
          " What",
          " type",
          " of",
          " product",
          " are",
          " you",
          " building?",
          " (Web",
          " app,",
          " mobile",
          " app,",
          " SaaS,",
          " internal",
          " platform,",
          " etc.)",
          "\n",
          "2️⃣",
          " Who",
          " is",
          " the",
          " intended",
          " audience",
          " or",
          " customer?",
          "\n",
          "3️⃣",
          " How",
          " would",
          " you",
          " like",
          " to",
          " proceed?",
          " (AI-only",
          " planning,",
          " AI",
          "+",
          " human",
          " execution,",
          " or",
          " a",
          " fully",
          " managed",
          " delivery",
          " team)",
          "\n",
          "4️⃣",
          " Are",
          " you",
          " primarily",
          " looking",
          " for",
          " estimates",
          " and",
          " technical",
          " guidance,",
          " or",
          " full",
          " product",
          " development",
          " with",
          " ongoing",
          " support?",
          "\n\n",
          "Based",
          " on",
          " your",
          " answers,",
          " I’ll",
          " create",
          " a",
          " customized",
          " roadmap,",
          " recommend",
          " the",
          " right",
          " tech",
          " stack,",
          " outline",
          " costs",
          " and",
          " timelines,",
          " and",
          " match",
          " you",
          " with",
          " verified",
          " talent",
          " if",
          " needed.",
        ],
        text:
          "Excellent decision. I’ll help you turn your idea into a well-defined, execution-ready product plan.\n\n" +
          "This workspace blends AI-powered planning with access to skilled human designers, engineers, and project managers who can build, iterate, and maintain your product.\n\n" +
          "To get started, please answer a few questions:\n" +
          "1️⃣ What type of product are you building? (Web app, mobile app, SaaS, internal platform, etc.)\n" +
          "2️⃣ Who is the intended audience or customer?\n" +
          "3️⃣ How would you like to proceed? (AI-only planning, AI + human execution, or a fully managed delivery team)\n" +
          "4️⃣ Are you primarily looking for estimates and technical guidance, or full product development with ongoing support?\n\n" +
          "Based on your answers, I’ll create a customized roadmap, recommend the right tech stack, outline costs and timelines, and match you with verified talent if needed.",
      },
    ],
  },
]





export const ConversationDemo = () => {
  const [messages, setMessages] = useState<typeof allMessages>([])
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null)
  const [streamingContent, setStreamingContent] = useState("")

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []
    const intervals: NodeJS.Timeout[] = []
    let currentMessageIndex = 0

    const addNextMessage = () => {
      if (currentMessageIndex >= allMessages.length) return

      const message = allMessages[currentMessageIndex]
      const part = message.parts[0]

      if (message.role === "assistant" && "tokens" in part && part.tokens) {
        setStreamingMessageIndex(currentMessageIndex)
        setStreamingContent("")

        let currentContent = ""
        let tokenIndex = 0

        const streamInterval = setInterval(() => {
          if (tokenIndex < part.tokens.length) {
            currentContent += part.tokens[tokenIndex]
            setStreamingContent(currentContent)
            tokenIndex++
          } else {
            clearInterval(streamInterval)
            setMessages((prev) => [...prev, message])
            setStreamingMessageIndex(null)
            setStreamingContent("")
            currentMessageIndex++
            timeouts.push(setTimeout(addNextMessage, 500))
          }
        }, 100)

        intervals.push(streamInterval)
      } else {
        setMessages((prev) => [...prev, message])
        currentMessageIndex++
        timeouts.push(setTimeout(addNextMessage, 800))
      }
    }

    timeouts.push(setTimeout(addNextMessage, 1000))

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
      intervals.forEach((interval) => clearInterval(interval))
    }
  }, [])

  return (
    <div>
      <h1 className="
  flex justify-center items-center text-gray-700
  font-bold
  px-4 py-6
  text-center
  text-2xl
  sm:text-3xl
  md:text-4xl
  lg:text-5xl
">
        What will you build?
      </h1>
      <div className="flex justify-center items-start pb-4">

        {/* <Card className="w-1/2  h-[70vh] py-0 px-2 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent "> */}
        <Card className="  w-full
      max-w-3xl
      h-[70vh]
      py-0
      px-2
      [&::-webkit-scrollbar]:w- 
  [&::-webkit-scrollbar]:h-
  [&::-webkit-scrollbar-thumb]:bg-gray-400 
  [&::-webkit-scrollbar-thumb]:rounded-full 
  [&::-webkit-scrollbar-track]:bg-transparent
    " >
          <div className="flex h-full flex-col">
            <Conversation>
              <ConversationContent>
                {messages.length === 0 && streamingMessageIndex === null ? (
                  <ConversationEmptyState
                    icon={<Orb className="size-12" />}
                    title="Start a conversation"
                    description="This is a simulated conversation"
                  />
                ) : (
                  <>
                    {messages.map((message) => (
                      <Message from={message.role} key={message.id}>
                        <MessageContent>
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case "text":
                                return (
                                  <Response key={`${message.id}-${i}`}>
                                    {part.text}
                                  </Response>
                                )
                              default:
                                return null
                            }
                          })}
                        </MessageContent>
                        {message.role === "assistant" && (
                          <div className="ring-border size-8 overflow-hidden rounded-full ring-1">
                            <Orb className="h-full w-full" agentState={null} />
                          </div>
                        )}
                      </Message>
                    ))}
                    {streamingMessageIndex !== null && (
                      <Message
                        from={allMessages[streamingMessageIndex].role}
                        key={`streaming-${streamingMessageIndex}`}
                      >
                        <MessageContent>
                          <Response>{streamingContent || "\u200B"}</Response>
                        </MessageContent>
                        {allMessages[streamingMessageIndex].role === "assistant" && (
                          <div className="ring-border size-8 overflow-hidden rounded-full ring-1">
                            <Orb className="h-full w-full" agentState="talking" />
                          </div>
                        )}
                      </Message>
                    )}
                  </>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>
        </Card>
      </div>
    </div >
  )
}


