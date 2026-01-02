import Image from "next/image";
import { ConversationDemo } from "@/components/aiRoom/conversation"
import SearchBar from "@/components/aiRoom/input";


export default function Home() {
  return (
    <div className="bg-linear-to-br from-teal-50 via-white to-teal-50">
      <ConversationDemo />
      <SearchBar />

    </div>

  );
}
