"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ui/conversation";
import { Message, MessageContent } from "@/components/ui/message";
import { Orb } from "@/components/ui/orb";
import { Response } from "@/components/ui/response";
import { Card } from "@/components/ui/card";
import { useAnalyzeRequirementMutation } from "@/lib/features/api/apiSlice";
import { Textarea } from "@/components/ui/textarea";
import {
    SpeechInput,
    SpeechInputCancelButton,
    SpeechInputPreview,
    SpeechInputRecordButton,
} from "@/components/ui/speech-input";
import { toast } from "sonner"; // Assuming sonner is available based on user snippet

type Role = "user" | "assistant";

interface ChatMessage {
    id: string;
    role: Role;
    content: string;
}

// Placeholder for missing server action
async function getToken() {
    // throw new Error("Speech token generation not implemented yet. Please configure the getScribeToken action.");
    return ""; // Return empty string to prevent immediate crash, let SpeechInput handle error or do nothing
}

function RequirementsIntakeContent() {
    const searchParams = useSearchParams();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [analyze, { isLoading }] = useAnalyzeRequirementMutation();
    const hasStartedRef = useRef(false);

    // Streaming state
    const [streamingContent, setStreamingContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    // Input state
    const [inputValue, setInputValue] = useState("");
    const valueAtStartRef = useRef("");

    useEffect(() => {
        if (hasStartedRef.current) return;

        const prompt = searchParams.get("prompt");
        const service = searchParams.get("service");

        let initialUserMessage = "";

        if (prompt) {
            initialUserMessage = prompt;
        } else if (service) {
            switch (service) {
                case "pos":
                    initialUserMessage = "I want to build a Point of Sale system.";
                    break;
                case "sales":
                    initialUserMessage = "I want to build a Sales Dashboard.";
                    break;
                case "ecommerce":
                    initialUserMessage = "I want to build an E-commerce Store.";
                    break;
                case "crm":
                    initialUserMessage = "I want to build a Customer CRM.";
                    break;
                default:
                    initialUserMessage = `I want to build a ${service.replace("-", " ")}.`;
            }
        }

        if (initialUserMessage) {
            hasStartedRef.current = true;
            addMessage("user", initialUserMessage);
            handleAnalysis(initialUserMessage);
        }
    }, [searchParams]);

    const addMessage = (role: Role, content: string) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                role: role,
                content: content,
            },
        ]);
    };

    const handleAnalysis = async (text: string) => {
        try {
            // Start streaming simulation (wait for API call first)
            setIsStreaming(true);
            setStreamingContent(""); // clear previous stream

            // Call the API
            const result = await analyze({ rawInput: text }).unwrap();
            const aiResponseText = result.message || result.reply || "I analyzed your requirements.";

            // Simulate streaming
            let currentContent = "";
            let charIndex = 0;
            const streamInterval = setInterval(() => {
                if (charIndex < aiResponseText.length) {
                    currentContent += aiResponseText[charIndex];
                    setStreamingContent(currentContent);
                    charIndex++;
                } else {
                    clearInterval(streamInterval);
                    setIsStreaming(false);
                    addMessage("assistant", aiResponseText);
                    setStreamingContent("");
                }
            }, 20);

        } catch (error) {
            console.error("Analysis failed:", error);
            setIsStreaming(false);
            addMessage("assistant", "Sorry, I encountered an error. Please try again.");
        }
    };

    const handleSubmit = () => {
        if (!inputValue.trim()) return;
        addMessage("user", inputValue);
        handleAnalysis(inputValue);
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex h-[100dvh] w-full flex-col items-center bg-gradient-to-br from-teal-50 via-white to-teal-50 p-2 sm:p-4">
            <Card className="flex h-full w-full max-w-4xl flex-col overflow-hidden border border-teal-100 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl">
                <div className="flex-1 overflow-hidden relative">
                    <Conversation className="h-full">
                        <ConversationContent className="space-y-4 pb-4">
                            {messages.length === 0 && !isLoading && !isStreaming ? (
                                <ConversationEmptyState
                                    icon={<Orb className="size-20" colors={["#5eead4", "#2dd4bf"]} />}
                                    title={<span className="text-xl font-bold text-teal-900">AI Requirements Analyst</span>}
                                    description={<span className="text-teal-600/80">Start describing your project...</span>}
                                />
                            ) : (
                                <>
                                    {messages.map((message) => (
                                        <Message from={message.role} key={message.id}>
                                            <MessageContent>
                                                <Response>{message.content}</Response>
                                            </MessageContent>
                                            {message.role === "assistant" && (
                                                <div className="ring-border size-8 overflow-hidden rounded-full ring-1 ring-teal-200 ml-2">
                                                    <Orb className="h-full w-full" agentState={null} colors={["#5eead4", "#2dd4bf"]} />
                                                </div>
                                            )}
                                        </Message>
                                    ))}

                                    {/* Loading State */}
                                    {isLoading && !isStreaming && (
                                        <div className="flex items-center gap-2 p-4">
                                            <div className="ring-border size-8 overflow-hidden rounded-full ring-1 ring-teal-200">
                                                <Orb className="h-full w-full" agentState="talking" colors={["#5eead4", "#2dd4bf"]} />
                                            </div>
                                            <span className="text-sm text-teal-600 animate-pulse font-medium">Thinking...</span>
                                        </div>
                                    )}

                                    {/* Streaming State */}
                                    {isStreaming && (
                                        <Message from="assistant" key="streaming">
                                            <MessageContent>
                                                <Response>{streamingContent || "\u200B"}</Response>
                                            </MessageContent>
                                            <div className="ring-border size-8 overflow-hidden rounded-full ring-1 ring-teal-200 ml-2">
                                                <Orb className="h-full w-full" agentState="talking" colors={["#5eead4", "#2dd4bf"]} />
                                            </div>
                                        </Message>
                                    )}
                                </>
                            )}
                        </ConversationContent>
                        <ConversationScrollButton />
                    </Conversation>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-teal-100 bg-white/60 backdrop-blur-md">
                    <div className="relative">
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your requirements here or use speech..."
                            className="min-h-[80px] resize-none rounded-2xl px-5 py-4 pr-14 shadow-inner border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white/50 text-teal-900 placeholder:text-teal-400/70 transition-all duration-300"
                        />
                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                            <SpeechInput
                                size="sm"
                                getToken={getToken}
                                onStart={() => {
                                    valueAtStartRef.current = inputValue;
                                }}
                                onChange={({ transcript }) => {
                                    setInputValue(valueAtStartRef.current + transcript);
                                }}
                                onStop={({ transcript }) => {
                                    setInputValue(valueAtStartRef.current + transcript);
                                }}
                                onCancel={() => {
                                    setInputValue(valueAtStartRef.current);
                                }}
                                onError={(error) => {
                                    toast.error("Speech error: " + String(error));
                                    console.error("Speech Input Error:", error);
                                }}
                            >
                                <SpeechInputCancelButton />
                                <SpeechInputPreview placeholder="Listening..." />
                                <SpeechInputRecordButton />
                            </SpeechInput>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-teal-600/60 text-center font-medium">
                        Press Enter to send, Shift+Enter for new line
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default function RequirementsIntakePage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-teal-50 via-white to-teal-50 gap-4">
                <div className="size-16 ring-1 ring-teal-200 rounded-full overflow-hidden shadow-lg shadow-teal-100">
                    <Orb className="h-full w-full" colors={["#5eead4", "#2dd4bf"]} />
                </div>
                <div className="text-teal-600 animate-pulse font-medium">Loading interface...</div>
            </div>
        }>
            <RequirementsIntakeContent />
        </Suspense>
    )
}
