import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, BookOpen, Mail, Award, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { sendRegistrationEmail, fetchSelectedPlan } from "@/api/parentApi";
import axios from "axios";

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
          
          // Send individual emails to parents for each student
          for (const student of students) {
            const studentEmail = student.email || "not provided";
            const emailSubject = `${student.first_name} ${student.surname} Registration Confirmed`;
            const emailBody = `${student.first_name} ${student.surname} is all set for ${student.grade_applied_for}!\n\nCheck email: ${studentEmail}`;

            try {
              // Send email via backend
              await axios.post(`${import.meta.env.VITE_API_BASE_URL}/parents/${parentId}/send-registration-email`, {
                parent_email: parentData.email,
                parent_name: parentData.full_name,
                student_name: `${student.first_name} ${student.surname}`,
                student_grade: student.grade_applied_for,
                student_email: studentEmail,
                selected_plan: plan?.selected_plan || "Standard Plan",
              });

              console.log(`✅ Email sent for ${student.first_name} ${student.surname}`);
            } catch (emailError) {
              console.error(`❌ Failed to send email for ${student.first_name}:`, emailError);
            }
          }
        } catch (error) {
          console.error("❌ Failed to send registration emails:", error);
        }
      };

      sendEmail();
    }
  }, [parentId, parentData, students]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-28 w-28 rounded-full bg-green-100 animate-pulse" />
              </div>
              <div className="relative flex h-28 w-28 items-center justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Registration Complete!</h1>
          <p className="text-lg text-muted-foreground">Your students are now registered and ready for the new academic year</p>
        </div>

        {/* Students Cards */}
        <div className="grid gap-4 mb-8 md:grid-cols-2">
          {students.map((stu: any, index: number) => (
            <Card key={index} className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white font-bold text-lg flex-shrink-0">
                    {stu.first_name[0]}{stu.surname[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">
                      {stu.first_name} {stu.surname}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-600 text-white">{stu.grade_applied_for}</Badge>
                      <Badge variant="outline" className="border-green-300 text-green-700">
                        ✓ Confirmed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span className="truncate">{stu.email || parentData?.email || "email not provided"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Parent Notification Card */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">Parent Notification</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-2">
              A confirmation email has been sent to:
            </p>
            <p className="text-sm font-semibold text-blue-900 bg-white rounded px-3 py-2 border border-blue-200">
              {parentData?.email || "email not provided"}
            </p>
          </CardContent>
        </Card>

        {/* Timeline/Info Card */}
        <Card className="mb-8 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white flex-shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Academic Year Start Date</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Term starts on September 1st, {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button
            size="lg"
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => navigate("/parent-dashboard")}
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate("/re-registration")}
          >
            Register Another Child
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Knit Edu Parent Portal</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Thank you for registering your child with us. We look forward to a great year!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
