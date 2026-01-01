import { SignupForm } from "@/components/ui/signup"
export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-2 md:p-6">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}