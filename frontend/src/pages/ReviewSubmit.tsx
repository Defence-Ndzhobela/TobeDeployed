import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, CheckCircle2, CreditCard, FileText } from "lucide-react";
import Header from "@/components/Header";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchSelectedPlan, fetchParentStudents } from "@/api/parentApi";

const ReviewSubmit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const parentIdFromState = (location.state as any)?.parentId || '';
  const [parentId, setParentId] = useState<string>(parentIdFromState || localStorage.getItem("parent_id_number") || '');
  const [students, setStudents] = useState<any[]>( (location.state as any)?.students || []);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [parentData, setParentData] = useState<any>(null);

  // Fetch parent data
  useEffect(() => {
    async function fetchParentData() {
      try {
        // Try to get parent data from localStorage or from API
        const storedParentData = localStorage.getItem("parent_data");
        if (storedParentData) {
          setParentData(JSON.parse(storedParentData));
        }
      } catch (err) {
        console.error("Failed to fetch parent data:", err);
      }
    }
    fetchParentData();
  }, []);

  // Fetch students if not in state
  useEffect(() => {
    async function fetchStudentsData() {
      if (!parentId) return;
      try {
        if (students.length === 0) {
          const res = await fetch(`/api/parents/${parentId}/students`);
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    }
    fetchStudentsData();
  }, [parentId, students.length]);

  // Fetch selected plan
  useEffect(() => {
    async function fetchPlan() {
      if (!parentId) {
        console.warn("No parentId for fetching plan");
        return;
      }
      try {
        const plan = await fetchSelectedPlan(parentId);
        setSelectedPlan(plan);
      } catch (err) {
        console.error("Failed to fetch selected plan:", err);
      }
    }
    fetchPlan();
  }, [parentId]);

  const steps = [
    { number: 1, title: "Select Children", description: "Choose students to re-register", completed: true, active: false },
    { number: 2, title: "Update Details", description: "Review and update information", completed: true, active: false },
    { number: 3, title: "Choose Financing", description: "Select a payment option", completed: true, active: false },
    { number: 4, title: "Review & Submit", description: "Confirm and submit", completed: false, active: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Student Re-Registration 2024</h1>
          <p className="text-muted-foreground">
            Complete the re-registration process for the upcoming academic year
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Progress Sidebar */}
          <Card className="h-fit p-6">
            <h2 className="mb-6 text-lg font-semibold">Progress</h2>
            <ProgressSteps steps={steps} currentStep={4} />
            <div className="mt-6">
              <ProgressBar percentage={100} />
            </div>
          </Card>

          {/* Student Cards */}
          <div className="space-y-6">
            {students.map((stu, index) => (
              <Card key={stu.application_id || index} className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {stu.first_name?.[0]}{stu.surname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{stu.first_name} {stu.surname}</h2>
                      <p className="text-sm text-muted-foreground">Re-registration Details</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">Active Student</Badge>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Step 4 of 4</h3>
                    <h2 className="text-2xl font-bold">Payment & Confirmation</h2>
                  </div>

                  <div>
                    <h3 className="mb-4 font-semibold">Review & Confirm Registration</h3>
                    <p className="text-sm text-muted-foreground">
                      Please review the registration summary and payment details before confirming
                    </p>
                  </div>

                  <Card className="border-primary/20 bg-accent/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Registration Summary</h4>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Student Name</p>
                        <p className="font-medium">{stu.first_name} {stu.surname}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Enrolling For</p>
                        <p className="font-medium">{stu.grade_applied_for}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Selected Payment Plan</p>
                        <p className="font-medium">{selectedPlan?.selected_plan?.replace(/-/g, ' ') || '—'}</p>
                        {selectedPlan && (
                          <>
                            <p className="text-sm text-muted-foreground">Total: R {selectedPlan.total_price}</p>
                            <p className="text-sm text-muted-foreground">Period: {selectedPlan.period}</p>
                          </>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registration Status</p>
                        <Badge className="bg-success text-success-foreground">Ready to Submit</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>
            ))}

            {/* Single Previous & Complete Registration Buttons */}
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/re-registration/financing", { state: { students, parentId } })}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">
                Step 4 of 4 • {students.length} {students.length === 1 ? 'student' : 'students'}
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/re-registration/success", { state: { students, parentId, parentData } })}
              >
                Complete Registration
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewSubmit;
