import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, CheckCircle2, CreditCard, FileText, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
        setLoading(false);
        return;
      }
      try {
        const plan = await fetchSelectedPlan(parentId);
        setSelectedPlan(plan);
      } catch (err) {
        console.error("Failed to fetch selected plan:", err);
      } finally {
        setLoading(false);
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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Review & Submit</h1>
              <p className="text-muted-foreground mt-1">Final step - Confirm your registration</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Progress Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
                <CardDescription>Registration Steps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProgressSteps steps={steps} currentStep={4} />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Step Completion</span>
                    <span className="text-sm font-bold text-primary">100%</span>
                  </div>
                  <ProgressBar percentage={100} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Summary Alert */}
            <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-red-600 font-semibold">
                Please review all information carefully before submitting. You can go back to make changes if needed.
              </AlertDescription>
            </Alert>

            {/* Student Review Cards */}
            {students.map((stu, index) => (
              <Card key={stu.application_id || index} className="overflow-hidden">
                {/* Student Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                          {stu.first_name?.[0]}{stu.surname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{stu.first_name} {stu.surname}</h2>
                        <p className="text-sm text-blue-700 mt-1">Student ID: {stu.id_number || 'N/A'}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">Ready to Submit</Badge>
                  </div>
                </div>

                {/* Review Content */}
                <CardContent className="pt-6 space-y-6">
                  {/* Registration Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Registration Summary
                    </h3>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="border-r border-green-200 pr-4">
                          <p className="text-sm font-medium text-green-700">Student Name</p>
                          <p className="text-lg font-bold text-foreground mt-1">{stu.first_name} {stu.surname}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Grade Level</p>
                          <p className="text-lg font-bold text-foreground mt-1">{stu.grade_applied_for}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Plan Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Payment Plan Details
                    </h3>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200 space-y-3">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Selected Plan</p>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {selectedPlan?.selected_plan?.replace(/-/g, ' ') || 'Loading...'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Total Amount</p>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {selectedPlan ? `R ${selectedPlan.total_price}` : 'Loading...'}
                          </p>
                        </div>
                        {selectedPlan && (
                          <>
                            <div>
                              <p className="text-sm font-medium text-blue-700">Payment Period</p>
                              <p className="text-lg font-bold text-foreground mt-1">{selectedPlan.period}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-700">Status</p>
                              <Badge className="mt-1 bg-blue-600">Confirmed</Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`terms-${index}`}
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor={`terms-${index}`} className="text-sm font-medium text-foreground cursor-pointer">
                          I confirm that all information provided is accurate and complete
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          By checking this box, you confirm that the registration details are correct and you authorize the submission of this re-registration.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigate("/re-registration/financing", { state: { students, parentId } })}
              >
                Back
              </Button>
              <div className="text-sm text-muted-foreground">
                Step 4 of 4 • {students.length} {students.length === 1 ? 'student' : 'students'}
              </div>
              <Button
                size="lg"
                disabled={!agreedToTerms || loading}
                onClick={() => navigate("/re-registration/success", { state: { students, parentId, parentData } })}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewSubmit;
