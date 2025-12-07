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
import { studentDataService } from "@/services/studentDataService";
import { getFeeByGrade } from "@/services/schoolFeesService";
import { API_BASE_URL } from "@/config/apiConfig";

const ReviewSubmit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const parentIdFromState = (location.state as any)?.parentId || '';
  const [parentId, setParentId] = useState<string>(parentIdFromState || localStorage.getItem("parent_id_number") || '');
  const [userId, setUserId] = useState<string>(localStorage.getItem("user_id") || '');
  const [students, setStudents] = useState<any[]>((location.state as any)?.students || []);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, any>>({});
  const [parentData, setParentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Fetch parent data from users table
  useEffect(() => {
    async function fetchUserData() {
      try {
        if (userId) {
          const response = await fetch(`${API_BASE_URL}/user/${userId}`);
          if (response.ok) {
            const userData = await response.json();
            setParentData(userData);
            localStorage.setItem("parent_data", JSON.stringify(userData));
          }
        }
      } catch (err) {
        console.error("Failed to fetch parent data:", err);
      }
    }
    fetchUserData();
  }, [userId]);

  // Fetch applications and students for the logged-in user
  useEffect(() => {
    async function fetchApplicationsAndStudents() {
      if (!userId) {
        console.warn("⚠️ ReviewSubmit: No userId provided");
        setLoading(false);
        return;
      }

      try {
        console.log("📍 ReviewSubmit: Fetching applications for user:", userId);
        
        // Get applications for this user
        const apps = await studentDataService.getApplicationsForUser(userId);
        console.log("📦 ReviewSubmit: Applications found:", apps.length, apps);
        setApplications(apps);

        if (!apps || apps.length === 0) {
          console.warn("⚠️ ReviewSubmit: No applications found for user", userId);
          setLoading(false);
          return;
        }

        // Fetch students and plans for each application
        const allStudents: any[] = [];
        const plansMap: Record<string, any> = {};

        for (const app of apps) {
          try {
            console.log(`📍 ReviewSubmit: Processing application ${app.id}`);
            
            // Fetch students for this application
            const appStudents = await studentDataService.getStudentsByApplicationId(app.id);
            console.log(`📦 ReviewSubmit: Students for app ${app.id}:`, appStudents.length, appStudents);

            if (!appStudents || appStudents.length === 0) {
              console.warn(`⚠️ ReviewSubmit: No students found for app ${app.id}`);
              continue;
            }

            // For each student, get their fees and plan
            for (const student of appStudents) {
              try {
                console.log(`📍 ReviewSubmit: Processing student ${student.id}`);
                
                const paidAmount = await studentDataService.calculatePaidAmount(student.id);
                
                // ✅ CRITICAL FIX: Use grade_applied_for, NOT grade (which is undefined)
                // Database schema: students table has "grade_applied_for" (TEXT)
                const studentGrade = student.grade_applied_for;
                
                if (!studentGrade) {
                  console.warn(`⚠️ ReviewSubmit: Student ${student.id} has no grade_applied_for field`);
                  continue;
                }

                console.log(`📍 ReviewSubmit: Fetching fees for grade: ${studentGrade}`);
                const fees = await getFeeByGrade(studentGrade);
                
                if (!fees || !fees.annual_fee) {
                  console.warn(`⚠️ ReviewSubmit: No fees found for grade ${studentGrade}`);
                  continue;
                }

                const monthlyFee = fees.annual_fee / 12;

                allStudents.push({
                  ...student,
                  application_id: app.id,
                  paid_amount: paidAmount,
                  monthly_fee: monthlyFee,
                  annual_fee: fees.annual_fee,
                  term_fee: fees.term_fee,
                  registration_fee: fees.registration_fee,
                  re_registration_fee: fees.re_registration_fee,
                  sport_fee: fees.sport_fee
                });
                console.log(`✅ ReviewSubmit: Student ${student.id} added to list`);
              } catch (studentError) {
                console.error(`❌ ReviewSubmit: Error processing student ${student.id}:`, studentError);
              }
            }

            // Fetch selected plan for this application
            try {
              // ✅ CRITICAL FIX: Use app.id (application_id), NOT app.parent_id
              // Problem: applications table has NO parent_id field - it was causing undefined!
              // Solution: Use application_id to query fee_responsibility table
              console.log(`📍 ReviewSubmit: Fetching plan for application ${app.id}`);
              const planResponse = await fetch(
                `${API_BASE_URL}/parents/${app.id}/selected-plan`,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                  }
                }
              );
              
              if (planResponse.ok) {
                const planData = await planResponse.json();
                console.log(`📦 ReviewSubmit: Plan data for app ${app.id}:`, planData);
                if (planData.plan) {
                  plansMap[app.id] = planData.plan;
                }
              } else {
                console.warn(`⚠️ ReviewSubmit: Plan fetch returned ${planResponse.status} for app ${app.id}`);
              }
            } catch (planError) {
              console.warn("⚠️ ReviewSubmit: Could not fetch plan for app", app.id, planError);
            }
          } catch (error) {
            console.error(`❌ ReviewSubmit: Error fetching data for app ${app.id}:`, error);
          }
        }

        console.log("📦 ReviewSubmit: All students loaded:", allStudents.length, allStudents);
        console.log("📦 ReviewSubmit: Plans map:", plansMap);

        setStudents(allStudents);
        setSelectedPlans(plansMap);
      } catch (err) {
        console.error("❌ ReviewSubmit: Failed to fetch applications and students:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplicationsAndStudents();
  }, [userId]);

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

            {/* Loading State */}
            {loading && (
              <Card>
                <CardContent className="pt-6 flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading registration data...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Review Cards */}
            {!loading && students.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No students found for review</p>
                </CardContent>
              </Card>
            )}

            {!loading && students.map((stu, index) => {
              const plan = selectedPlans[stu.application_id];
              // Calculate total amount based on selected plan
              let totalAmount = 0;
              if (plan?.selected_plan) {
                if (plan.selected_plan === 'pay-monthly') {
                  // Monthly: Annual fee / 12
                  totalAmount = stu.annual_fee / 12;
                } else if (plan.selected_plan === 'pay-term') {
                  // Pay Per Term: Annual fee * 0.97 / 3
                  totalAmount = (stu.annual_fee * 0.97) / 3;
                } else if (plan.selected_plan === 'pay-once') {
                  // Pay Once Per Year: Annual fee * 0.95 (5% discount)
                  totalAmount = stu.annual_fee * 0.95;
                } else if (plan.selected_plan === 'buy-now-pay-later') {
                  // BNPL: Annual fee * 1.12 (12% cost) / 12
                  totalAmount = (stu.annual_fee * 1.12) / 12;
                } else if (plan.selected_plan === 'forward-funding') {
                  // Forward Funding: Annual fee * 1.15 (15% cost) / 12
                  totalAmount = (stu.annual_fee * 1.15) / 12;
                } else if (plan.selected_plan === 'sibling-benefit') {
                  // Sibling: 10% discount on annual fee per child
                  totalAmount = stu.annual_fee * 0.9;
                } else if (plan.selected_plan === 'monthly-installment') {
                  // Monthly: Annual fee / 12
                  totalAmount = stu.annual_fee / 12;
                } else if (plan.selected_plan === 'termly-payment') {
                  // Termly: Annual fee / 4 (4 terms)
                  totalAmount = stu.annual_fee / 4;
                } else if (plan.selected_plan === 'annual-payment') {
                  // Annual: Full annual fee
                  totalAmount = stu.annual_fee;
                } else if (plan.selected_plan === 'pay-via-eft') {
                  // EFT: Full annual fee
                  totalAmount = stu.annual_fee;
                }
              }

              return (
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
                            <p className="text-lg font-bold text-foreground mt-1">{stu.grade || stu.grade_applied_for}</p>
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
                              {plan?.selected_plan?.replace(/-/g, ' ') || 'Loading...'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-700">Total Amount</p>
                            <p className="text-lg font-bold text-foreground mt-1">
                              {plan && totalAmount > 0 ? `R ${Math.round(totalAmount).toLocaleString()}` : 'N/A'}
                            </p>
                          </div>
                          {plan && (
                            <>
                              <div>
                                <p className="text-sm font-medium text-blue-700">Payment Period</p>
                                <p className="text-lg font-bold text-foreground mt-1">{plan.period}</p>
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
              );
            })}

            {/* Action Buttons */}
            {!loading && students.length > 0 && (
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
                  disabled={!agreedToTerms}
                  onClick={() => navigate("/re-registration/success", { state: { students, parentId, parentData } })}
                  className="gap-2"
                >
                  Complete Registration
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewSubmit;
