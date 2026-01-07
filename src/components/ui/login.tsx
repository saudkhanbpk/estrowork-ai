"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
// Re-checking imports. The file path is `src/lib/features/api/apiSlice.ts`.
import { useLoginMutation } from "@/lib/features/api/apiSlice"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [login, { isLoading: loading, error: mutationError }] = useLoginMutation();
  // We can still select user/error from auth slice if needed, but mutation state is sufficient for local feedback
  // const globalError = useAppSelector((state) => state.auth.error); 

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [showPassword, setShowPassword] = useState(false);

  // Helper to parse error message from RTK Query error
  const getErrorMessage = (err: any) => {
    if (!err) return null;
    if (typeof err === 'string') return err;
    if (err.data && err.data.message) return err.data.message;
    if (err.message) return err.message;
    return "Login failed";
  };

  const error = getErrorMessage(mutationError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // unwrap() throws error if mutation fails, allowing catch block
      const result = await login({ email, password }).unwrap();

      // Success logic
      // alert("User login successfully"); 
      router.push(next || "/requirements-intake?service")

    } catch (err: any) {
      console.error("Login failed:", err);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-teal-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-teal-900">Welcome back</CardTitle>
          <CardDescription className="text-center text-teal-600/80">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email" className="text-teal-900 font-medium">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-white/50"
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-teal-900 font-medium">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm text-teal-600 underline-offset-4 hover:text-teal-800 hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {error && (
                <FieldDescription className="text-red-500 text-center bg-red-50 p-2 rounded-md text-sm border border-red-100">
                  {error}
                </FieldDescription>
              )}

              <Field className="space-y-4 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-md shadow-teal-500/10 transition-all duration-300 font-medium text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      Logging in...
                    </span>
                  ) : "Login"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-teal-100" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-teal-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 transition-all duration-300"
                >
                  Login with Google
                </Button>

                <div className="text-center text-sm text-gray-500 mt-4">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="font-semibold text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                    Sign up
                  </a>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
