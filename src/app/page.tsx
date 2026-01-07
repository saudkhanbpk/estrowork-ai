import { ConversationDemo } from "@/components/aiRoom/conversation"
import PromptInput from "@/components/aiRoom/input";


export default function Home() {
  return (
    <div className="bg-linear-to-br from-teal-50 via-white to-teal-50 min-h-screen pb-32">
      <ConversationDemo />

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-md">
          <PromptInput />
        </div>
      </div>

    </div>

  );
}
