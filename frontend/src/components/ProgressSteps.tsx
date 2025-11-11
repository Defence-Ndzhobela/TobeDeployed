import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  description: string;
  completed?: boolean;
  active?: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
}

const ProgressSteps = ({ steps, currentStep }: ProgressStepsProps) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full font-semibold",
                step.completed
                  ? "bg-primary text-primary-foreground"
                  : step.active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.completed ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="h-12 w-px bg-border" />
            )}
          </div>
          <div className="flex-1 pb-8">
            <h3
              className={cn(
                "font-semibold",
                step.active || step.completed
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
