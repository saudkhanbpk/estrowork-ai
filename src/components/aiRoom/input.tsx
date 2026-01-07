"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Ensure this is next/navigation for App Router
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucideMic, LucideArrowUp } from "lucide-react";

export default function PromptInput() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handlePrompt = () => {
        // Only redirect if there is actual text
        if (query.trim()) {
            // Option 1: Basic redirect
            router.push("/signup");

            // Option 2: Redirect and pass the prompt as a URL parameter
            // router.push(`/ai-website-builder?prompt=${encodeURIComponent(query)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handlePrompt();
        }
    };

    return (
        <div className="flex items-center w-full max-w-md mx-auto border rounded-full px-4 mb-4 py-2 shadow-sm bg-white focus-within:ring-1 focus-within:ring-gray-200 transition-all">
            <span className="text-gray-400 mr-2 text-xl select-none">+</span>
            <Input
                placeholder="Ask anything"
                className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button variant="ghost" size="icon" className="ml-1 hover:bg-transparent">
                <LucideMic className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
                size="icon"
                onClick={handlePrompt}
                // We change background based on whether query exists
                className={`ml-2 rounded-full transition-all duration-200 ${query.trim()
                    ? "bg-teal-700 hover:bg-teal-800 cursor-pointer"
                    : "bg-teal-600 cursor-not-allowed"
                    }`}
                disabled={!query.trim()}
            >
                <LucideArrowUp className={`h-5 w-5 ${query.trim() ? "text-white" : "text-white"}`} />
            </Button>
        </div>
    );
}