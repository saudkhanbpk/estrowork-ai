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
        <div className="flex h-[100dvh] w-full flex-col items-center bg-gray-50 p-2 sm:p-4 dark:bg-zinc-900">
            <Card className="flex h-full w-full max-w-4xl flex-col overflow-hidden border bg-white shadow-xl dark:bg-zinc-800">
                <div className="flex-1 overflow-hidden relative">
                    <Conversation className="h-full">
                        <ConversationContent className="space-y-4 pb-4">
                            {messages.length === 0 && !isLoading && !isStreaming ? (
                                <ConversationEmptyState
                                    icon={<Orb className="size-12" />}
                                    title="AI Requirements Analyst"
                                    description="Start describing your project..."
                                />
                            ) : (
                                <>
                                    {messages.map((message) => (
                                        <Message from={message.role} key={message.id}>
                                            <MessageContent>
                                                <Response>{message.content}</Response>
                                            </MessageContent>
                                            {message.role === "assistant" && (
                                                <div className="ring-border size-8 overflow-hidden rounded-full ring-1 ml-2">
                                                    <Orb className="h-full w-full" agentState={null} />
                                                </div>
                                            )}
                                        </Message>
                                    ))}

                                    {/* Loading State */}
                                    {isLoading && !isStreaming && (
                                        <div className="flex items-center gap-2 p-4">
                                            <div className="ring-border size-8 overflow-hidden rounded-full ring-1">
                                                <Orb className="h-full w-full" agentState="talking" />
                                            </div>
                                            <span className="text-sm text-muted-foreground animate-pulse">Thinking...</span>
                                        </div>
                                    )}

                                    {/* Streaming State */}
                                    {isStreaming && (
                                        <Message from="assistant" key="streaming">
                                            <MessageContent>
                                                <Response>{streamingContent || "\u200B"}</Response>
                                            </MessageContent>
                                            <div className="ring-border size-8 overflow-hidden rounded-full ring-1 ml-2">
                                                <Orb className="h-full w-full" agentState="talking" />
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
                <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                    <div className="relative">
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your requirements here or use speech..."
                            className="min-h-[80px] resize-none rounded-2xl px-4 py-3 pr-14 shadow-sm"
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
                    <div className="mt-2 text-xs text-muted-foreground text-center">
                        Press Enter to send, Shift+Enter for new line
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default function RequirementsIntakePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading interface...</div>}>
            <RequirementsIntakeContent />
        </Suspense>
    )
}
