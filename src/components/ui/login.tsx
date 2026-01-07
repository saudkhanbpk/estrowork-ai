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
      router.push(next || "/ai-website-builder")

    } catch (err: any) {
      console.error("Login failed:", err);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {error && (
                <FieldDescription className="text-red-500 text-center">
                  {error}
                </FieldDescription>
              )}

              <Field>
                <Button type="submit" disabled={loading} className="w-full h-12">
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <Button variant="outline" type="button" className="w-full h-12">
                  Login with Google
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/signup">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
