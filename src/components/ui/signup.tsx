// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   Field,
//   FieldDescription,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field"
// import { Input } from "@/components/ui/input"


// export function SignupForm({
//   className,
//   ...props
// }: React.ComponentProps<"div">) {

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card>
//         <CardHeader className="text-center">
//           <CardTitle className="text-xl">Create your account</CardTitle>
//           <CardDescription>
//             Enter your email below to create your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form>
//             <FieldGroup>
//               <Field>
//                 <FieldLabel htmlFor="name">Full Name</FieldLabel>
//                 <Input id="name" type="text" placeholder="John Doe" required />
//               </Field>
//               <Field>
//                 <FieldLabel htmlFor="email">Email</FieldLabel>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="m@example.com"
//                   required
//                 />
//               </Field>
//               <Field>
//                 <Field className="grid grid-cols-2 gap-4">
//                   <Field>
//                     <FieldLabel htmlFor="password">Password</FieldLabel>
//                     <Input id="password" type="password" required />
//                   </Field>
//                   <Field>
//                     <FieldLabel htmlFor="confirm-password">
//                       Confirm Password
//                     </FieldLabel>
//                     <Input id="confirm-password" type="password" required />
//                   </Field>
//                 </Field>
//                 <FieldDescription>
//                   Must be at least 8 characters long.
//                 </FieldDescription>
//               </Field>
//               <Field>
//                 <Button type="submit">Create Account</Button>
//                 <FieldDescription className="text-center">
//                   Already have an account? <a href="login">Sign in</a>
//                 </FieldDescription>
//               </Field>
//             </FieldGroup>
//           </form>
//         </CardContent>
//       </Card>
//       <FieldDescription className="px-6 text-center">
//         By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
//         and <a href="#">Privacy Policy</a>.
//       </FieldDescription>
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
import { useRouter } from "next/navigation"
import { useRegisterMutation } from "@/lib/features/api/apiSlice"
import { Eye, EyeOff } from "lucide-react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // RTK Query Mutation
  const [register, { isLoading: loading, error: mutationError }] = useRegisterMutation();

  const router = useRouter();

  // Helper to parse error message
  const getErrorMessage = (err: any) => {
    if (!err) return null;
    if (typeof err === 'string') return err;
    if (err.data && err.data.message) return err.data.message;
    if (err.message) return err.message;
    return "Signup failed";
  };

  // Local validation error State
  const [validationError, setValidationError] = useState<string | null>(null);

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const error = validationError || getErrorMessage(mutationError);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return
    }

    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }).unwrap();

      alert("Account created successfully 🎉");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      router.push("/guided-AI-intent")

    } catch (err: any) {
      console.error("Signup failed:", err);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="border-teal-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-1 p-4 pb-2">
          <CardTitle className="text-xl font-bold text-teal-900">Create your account</CardTitle>
          <CardDescription className="text-xs text-teal-600/80">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="name" className="text-teal-900 font-medium text-xs">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="h-9 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-white/50"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email" className="text-teal-900 font-medium text-xs">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="h-9 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-white/50"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="password" className="text-teal-900 font-medium text-xs">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="h-9 text-sm pr-8 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword" className="text-teal-900 font-medium text-xs">
                    Confirm
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="h-9 text-sm pr-8 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </Field>
              </div>

              <FieldDescription className="text-teal-600/70 text-[10px] text-center">
                Must be at least 8 characters long.
              </FieldDescription>

              {error && (
                <FieldDescription className="text-red-500 text-center bg-red-50 p-1.5 rounded-md text-xs border border-red-100">
                  {error}
                </FieldDescription>
              )}

              <Field className="pt-1">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-md shadow-teal-500/10 transition-all duration-300 font-medium text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">Creating...</span>
                  ) : "Create Account"}
                </Button>

                <div className="text-center mt-2 text-xs text-gray-500">
                  Already have an account? <a href="/login" className="font-semibold text-teal-600 hover:text-teal-800 hover:underline transition-colors">Sign in</a>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-[10px] text-teal-700/60 leading-tight">
        By continuing, you agree to our <a href="#" className="underline hover:text-teal-900">Terms</a> & <a href="#" className="underline hover:text-teal-900">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
