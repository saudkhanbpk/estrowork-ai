import { ServiceOptions } from "@/components/aiRoom/service-options";
import PromptInput from "@/components/aiRoom/input";


export default function Home() {
  return (
    <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50 min-h-screen pb-32">
      <h1 className="
        flex justify-center items-center text-teal-900
        font-bold
        px-4 py-8
        text-center
        text-2xl
        sm:text-3xl
        md:text-4xl
        lg:text-5xl
      ">
        What will you build?
      </h1>

      <div className="flex justify-center items-start pb-4">
        <ServiceOptions />
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-md">
          <PromptInput />
        </div>
      </div>
    </div>

  );
}
