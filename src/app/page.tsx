import Image from "next/image";
import {ConversationDemo} from "@/components/aiRoom/conversation"
import SearchBar from "@/components/aiRoom/input";


export default function Home() {
  return (
    <div>
      <ConversationDemo/>
      <SearchBar />
    
    </div>

  );
}
