import { LoginForm } from "@/components/ui/login"
export default function Page() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
