"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import clsx from "clsx"

type Step = 1 | 2 | 3

const INTENT_OPTIONS: Record<string, string[]> = {
  Organization: [
    "Build a product or MVP",
    "Estimate cost & timeline",
    "Audit existing system",
    "Automate internal workflows",
    "Plan or hire development team",
  ],
  "Personal / Freelancer": [
    "Build a website or app",
    "Improve or refactor code",
    "Automate repetitive tasks",
    "Client project estimation",
    "Plan or hire development team",
  ],
  "Student / Education": [
    "Learn programming",
    "Build practice projects",
    "Generate explanations & examples",
    "Debug assignments",
    "Prepare for interviews",
  ],
}

export default function OnboardingModal() {
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<string | null>(null)
  const [intents, setIntents] = useState<string[]>([])
  const [level, setLevel] = useState<string | null>(null)

  const nextDisabled =
    (step === 1 && !role) ||
    (step === 2 && intents.length === 0) ||
    (step === 3 && !level)

  const toggleIntent = (value: string) => {
    setIntents((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    )
  }

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as Step)
    } else {
      // 🔥 This is gold data for AI
      console.log({ role, intents, level })
      router.push("/ai-website-builder")
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center px-6">
      <Card className="w-full max-w-md rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-semibold">
            {step === 1 && "Who are you?"}
            {step === 2 && "What do you want to do?"}
            {step === 3 && "Your experience level"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Step {step} of 3
          </p>
        </div>

        {/* Content */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto">
          {step === 1 &&
            ["Organization", "Personal / Freelancer", "Student / Education"].map(
              (item) => (
                <Option
                  key={item}
                  label={item}
                  selected={role === item}
                  onClick={() => setRole(item)}
                />
              )
            )}

          {step === 2 &&
            role &&
            INTENT_OPTIONS[role].map((item) => (
              <Option
                key={item}
                label={item}
                selected={intents.includes(item)}
                onClick={() => toggleIntent(item)}
              />
            ))}

          {/* STEP 3: ORGANIZATION */}
          {step === 3 && role === "Organization" &&
            [
              "High-level planning & guidance",
              "Balanced (planning + implementation)",
              "Technical & implementation-focused",
            ].map((item) => (
              <Option
                key={item}
                label={item}
                selected={level === item}
                onClick={() => setLevel(item)}
              />
            ))}

          {/* STEP 3: PERSONAL / FREELANCER */}
          {step === 3 && role === "Personal / Freelancer" &&
            ["Beginner", "Intermediate", "Advanced"].map((item) => (
              <Option
                key={item}
                label={item}
                selected={level === item}
                onClick={() => setLevel(item)}
              />
            ))}

          {/* STEP 3: STUDENT / EDUCATION */}
          {step === 3 && role === "Student / Education" &&
            [
              "Learn step-by-step with explanations",
              "Practice by building projects",
              "Quick answers & examples",
            ].map((item) => (
              <Option
                key={item}
                label={item}
                selected={level === item}
                onClick={() => setLevel(item)}
              />
            ))}

        </div>

        {/* Footer */}
        <Button
          className="w-full mt-6"
          disabled={nextDisabled}
          onClick={handleNext}
        >
          {step < 3 ? "Next →" : "Continue →"}
        </Button>
      </Card>
    </div>
  )
}

/* Reusable option */
function Option({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "cursor-pointer rounded-lg border p-4 transition flex items-center justify-between",
        selected
          ? "border-primary bg-primary/5"
          : "hover:border-muted-foreground"
      )}
    >
      <span className="font-medium">{label}</span>
      {selected && <CheckCircle2 className="w-5 h-5 text-primary" />}
    </div>
  )
}
