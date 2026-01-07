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
            router.push(`/requirements-intake?prompt=${encodeURIComponent(query)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handlePrompt();
        }
    };

    return (
        <div className="flex items-center w-full max-w-md mx-auto border border-teal-100 rounded-full px-4 mb-4 py-2 shadow-sm bg-white/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-200 transition-all">
            <span className="text-teal-400 mr-2 text-xl select-none">+</span>
            <Input
                placeholder="Ask anything"
                className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-teal-900 placeholder:text-teal-900/40"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button variant="ghost" size="icon" className="ml-1 hover:bg-teal-50 text-teal-600 hover:text-teal-700">
                <LucideMic className="h-5 w-5" />
            </Button>
            <Button
                size="icon"
                onClick={handlePrompt}
                // We change background based on whether query exists
                className={`ml-2 rounded-full transition-all duration-200 ${query.trim()
                    ? "bg-teal-600 hover:bg-teal-700 cursor-pointer shadow-md shadow-teal-200"
                    : "bg-teal-200 cursor-not-allowed"
                    }`}
                disabled={!query.trim()}
            >
                <LucideArrowUp className={`h-5 w-5 ${query.trim() ? "text-white" : "text-white"}`} />
            </Button>
        </div>
    );
}