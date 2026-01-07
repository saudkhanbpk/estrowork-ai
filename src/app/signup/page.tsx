import { SignupForm } from "@/components/ui/signup"
export default function Page() {
  return (
    <div className="flex min-h-svh bg-gradient-to-br from-teal-50 via-white to-teal-50 w-full items-center justify-center p-2 md:p-6">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}