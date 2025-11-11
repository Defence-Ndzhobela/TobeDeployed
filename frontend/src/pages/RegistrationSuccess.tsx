import { useNavigate } from "react-router-dom";
import { CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
        </div>

        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="text-4xl">🎉</span>
          <h1 className="text-3xl font-bold text-foreground">
            Sarah is all set for Grade 5!
          </h1>
        </div>

        <p className="mb-8 text-lg text-muted-foreground">
          Registration complete! Term starts on September 1st, 2024.
        </p>

        <div className="mb-8 flex justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/parent-dashboard")}>
            Go to Dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/re-registration")}
          >
            Register Another Child
          </Button>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm">Knit Edu Parent Portal</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
