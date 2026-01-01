import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LucideMic, LucideArrowUp } from "lucide-react"

export default function SearchBar() {
    return (
        <div className="flex items-center w-full max-w-md mx-auto border rounded-full px-4 mb-4 py-2 shadow-sm bg-white">
            <span className="text-gray-400 mr-2">+</span>
            <Input
                placeholder="Ask anything"
                className="flex-1 border-none shadow-none focus:ring-0"
            />
            <Button variant="ghost" className="ml-1 p-2">
                <LucideMic className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="ml-2 p-2 bg-black hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
            >
                <LucideArrowUp className="h-5 w-5 text-white" />
            </Button>
        </div>
    )
}
