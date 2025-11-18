import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, BookOpen, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { sendRegistrationEmail, fetchSelectedPlan } from "@/api/parentApi";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const students = (location.state as any)?.students || [];
  const parentId = (location.state as any)?.parentId || localStorage.getItem("parent_id_number");
  const parentData = (location.state as any)?.parentData;

  // Send registration email on page load
  useEffect(() => {
    if (parentId && parentData && students.length > 0) {
      const sendEmail = async () => {
        try {
          // Fetch the selected plan
          const plan = await fetchSelectedPlan(parentId);
          
          const studentNames = students.map((s: any) => `${s.first_name} ${s.surname}`);
          const selectedPlanText = plan?.selected_plan || "Standard Plan";

          const emailResponse = await sendRegistrationEmail(parentId, {
            parent_email: parentData.email,
            parent_name: parentData.full_name,
            student_names: studentNames,
            selected_plan: selectedPlanText,
          });

          if (emailResponse.sent) {
            console.log("✅ Registration email sent successfully");
          }
        } catch (error) {
          console.error("❌ Failed to send registration email:", error);
          // Don't show error toast - let registration complete regardless
        }
      };

      sendEmail();
    }
  }, [parentId, parentData, students]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
        </div>

        <div className="mb-6">
          <span className="text-4xl">🎉</span>
          <h1 className="text-3xl font-bold text-foreground mt-2">
            Registration Complete!
          </h1>
        </div>

        <div className="mb-6 space-y-4">
          {students.map((stu: any, index: number) => (
            <div key={index} className="p-4 border rounded-md bg-accent/50">
              <h2 className="text-xl font-semibold">
                {stu.first_name} {stu.surname} is all set for {stu.grade_applied_for}!
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" /> Check email: {parentData?.email || "not provided"}
              </p>
            </div>
          ))}
        </div>

        <p className="mb-8 text-lg text-muted-foreground">
          Term starts on September 1st, {new Date().getFullYear()}.
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
