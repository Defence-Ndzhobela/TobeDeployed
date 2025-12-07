import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { saveSelectedPlan } from "@/api/parentApi";
import Header from "@/components/Header";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFeeByGrade } from "@/services/schoolFeesService";

type PlanFeature = { text: string; icon?: "check" | "info" };
type FinancingPlan = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  period: string;
  badge?: { text: string; type: "save" | "cost" | "best" };
  features: PlanFeature[];
  recommended?: boolean;
};

interface Student {
  application_id: string;
  first_name: string;
  surname: string;
  grade_applied_for: string;
  id_number: string;
}

const FinancingOption = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentsFromState: Student[] = (location.state as any)?.students || [];

  // start with no selection so user must choose explicitly
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fees, setFees] = useState<any>(null);
  const [feesLoading, setFeesLoading] = useState(false);

  // Get applicationId from first student
  const applicationId = studentsFromState?.[0]?.application_id || '';

  // Map grade name to database grade format (e.g., "Grade 1", "Grade R")
  const mapGradeToDbFormat = (grade: string | undefined): string => {
    if (!grade) return 'Grade 1'; // default
    
    const gradeLower = grade.toLowerCase().trim();
    
    // Handle "Grade X" format - already in DB format
    if (gradeLower.startsWith('grade ')) {
      return grade; // Return as-is, it's already in correct format
    }
    
    // Handle numeric format (e.g., "10", "12", "0")
    const gradeNum = parseInt(grade);
    if (!isNaN(gradeNum)) {
      if (gradeNum === 0) return 'Grade R';
      return `Grade ${gradeNum}`;
    }
    
    // Handle old "GR_X-X" format for backward compatibility
    if (grade.startsWith('GR_')) {
      // Convert GR_R to Grade R, GR_1-6 to Grade 1-6 range, etc.
      if (grade === 'GR_R') return 'Grade R';
      // For ranges like GR_1-6, return the first grade
      if (grade === 'GR_1-6') return 'Grade 1';
      if (grade === 'GR_7-9') return 'Grade 7';
      if (grade === 'GR_10-11') return 'Grade 10';
      if (grade === 'GR_12') return 'Grade 12';
    }
    
    return 'Grade 1'; // default
  };

  // Fetch fees by grade from Supabase database
  const fetchFeesByGrade = async (grade: string) => {
    try {
      setFeesLoading(true);
      const mappedGrade = mapGradeToDbFormat(grade);
      console.log(`Starting to fetch fees for grade: ${grade} (mapped to: ${mappedGrade})`);
      
      const feeData = await getFeeByGrade(mappedGrade);
      
      if (feeData) {
        setFees(feeData);
        console.log("Fees fetched successfully from database:", feeData);
      } else {
        console.warn(`Failed to fetch fees for grade ${mappedGrade} - will use defaults`);
        setFees(null);
      }
    } catch (err) {
      console.error("Error in fetchFeesByGrade:", err);
      setFees(null);
    } finally {
      setFeesLoading(false);
    }
  };

  useEffect(() => {
    if (!studentsFromState || studentsFromState.length === 0) {
      setLoading(false);
      return;
    }
    setStudents(studentsFromState);
    setLoading(false);

    // Fetch fees for the first student's grade from Supabase
    const grade = studentsFromState[0]?.grade_applied_for;
    console.log(`Student grade: ${grade}`);
    if (grade) {
      fetchFeesByGrade(grade);
    }
  }, [studentsFromState]);

  const handleContinue = async () => {
    if (!selectedPlan) {
      // show a toast message instructing the user to select a plan
      toast({ title: "Select a plan", description: "Please select a financing plan before continuing.", variant: "destructive" });
      return;
    }

    // Find the selected plan details
    const plan = financingPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    // Save plan to backend if applicationId exists
    if (applicationId) {
      setSaving(true);
      console.log("Saving plan for applicationId:", applicationId, "Plan:", selectedPlan);
      try {
        const response = await saveSelectedPlan(applicationId, {
          selected_plan: selectedPlan
        });
        console.log("Plan saved successfully:", response);
      } catch (err) {
        console.error("Failed to save plan:", err);
        toast({ title: "Error", description: "Failed to save selected plan. Please try again.", variant: "destructive" });
        setSaving(false);
        return;
      }
      setSaving(false);
    } else {
      console.warn("No applicationId available, skipping plan save");
    }

    // Navigate to Declaration page first (user requested flow: Financing -> Declaration -> Review)
    navigate("/re-registration/declaration", { state: { students, selectedPlan, applicationId } });
  };

  const handlePrevious = () => {
    navigate("/re-registration/update-details", { state: { students } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!students || students.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>No students selected or available.</p>
        <Button onClick={() => navigate("/re-registration")}>Back to Selection</Button>
      </div>
    );

  // Use fees from database, with fallback to default values
  const annualFees = fees?.annual_fee || 85000;
  const termFees = fees?.term_fee || 21250;
  const registrationFee = fees?.registration_fee || 800;
  
  // Affordability data calculated from actual database fees
  const affordabilityData = {
    annualFees: annualFees,
    availableIncome: 65000,
    fundingGap: Math.max(0, annualFees - 65000),
    ratio: Math.round((annualFees / 65000) * 100),
  };

  // Calculate all payment options based on ACTUAL DATABASE FEES
  const monthlyRate = Math.round(annualFees / 12);
  const termRateWithDiscount = Math.round(annualFees * 0.97 / 3);
  const annualRateWithDiscount = Math.round(annualFees * 0.95);
  const monthlyBNPL = Math.round((annualFees * 1.12) / 12);
  const monthlyForwardFunding = Math.round((annualFees * 1.15) / 12);
  const siblingMonthly = Math.round((annualFees * 0.9) / 12 / Math.max(students.length, 1));

  const financingPlans: FinancingPlan[] = [
    {
      id: "pay-monthly",
      title: "Monthly Debit Order",
      subtitle: "Zero discount",
      price: monthlyRate,
      period: "per month",
      badge: { text: "Save 3%", type: "save" },
      features: [
        { text: "Standard debit order", icon: "check" },
        { text: "No upfront payment required", icon: "check" },
        { text: "Predictable monthly budget", icon: "check" },
      ],
    },
    {
      id: "pay-term",
      title: "Pay Per Term",
      subtitle: "Save 3%",
      price: termRateWithDiscount,
      period: "per term",
      badge: { text: "Save 3%", type: "save" },
      features: [
        { text: "Pay 3 times per year", icon: "check" },
        { text: "3% discount on total fees", icon: "check" },
        { text: "Aligned with school terms", icon: "check" },
      ],
    },
    {
      id: "pay-once",
      title: "Pay Once Per Year",
      subtitle: "Save 5%",
      price: annualRateWithDiscount,
      period: "per year",
      badge: { text: "Save 5%", type: "save" },
      recommended: true,
      features: [
        { text: "Maximum discount available", icon: "check" },
        { text: "One payment, no worries", icon: "check" },
        { text: `Save R ${(annualFees - annualRateWithDiscount).toLocaleString()} annually`, icon: "check" },
      ],
    },
    {
      id: "buy-now-pay-later",
      title: "Buy Now, Pay Later",
      subtitle: "Flexible option",
      price: monthlyBNPL,
      period: "per month",
      badge: { text: "12% Cost", type: "cost" },
      features: [
        { text: "Pay school fees immediately", icon: "check" },
        { text: "Flexible repayment terms", icon: "check" },
        { text: "12% cost of credit applies", icon: "info" },
      ],
    },
    {
      id: "forward-funding",
      title: "Forward Funding",
      subtitle: "6-12 months",
      price: monthlyForwardFunding,
      period: "per month",
      badge: { text: "15% Cost", type: "cost" },
      features: [
        { text: "Cover funding gap", icon: "check" },
        { text: "Quick approval process", icon: "check" },
        { text: "15% cost of credit applies", icon: "info" },
      ],
    },
    {
      id: "sibling-benefit",
      title: "Sibling Benefit",
      subtitle: "Multiple children",
      price: siblingMonthly,
      period: "per child/month",
      badge: { text: "Save 10%", type: "save" },
      features: [
        { text: "10% discount per additional child", icon: "check" },
        { text: "Combined family billing", icon: "check" },
        { text: `${students.length} children selected`, icon: "info" },
      ],
    },
    {
      id: "pay-via-eft",
      title: "Pay via EFT",
      subtitle: "Manual bank transfer",
      price: annualFees,
      period: "per year",
      features: [
        { text: "Direct bank transfer", icon: "check" },
        { text: "No intermediary fees", icon: "check" },
        { text: "School instructions provided", icon: "check" },
      ],
    },
  ];

  const qualifications = [
    "Monthly Payment Plans",
    "Termly & Annual Discounts",
    "Buy Now, Pay Later",
    "Forward Funding Loans",
    "Sibling Discounts",
  ];

  const requiredDocs = [
    "Income Verification",
    "Bank Statements (3 months)",
    "Identity Documents",
    "Proof of Residence",
    "Credit Check (for loans)",
  ];

  const steps = [
    { number: 1, title: "Select Children", description: "Choose students to re-register", completed: true, active: false },
    { number: 2, title: "Update Details", description: "Review and update information", completed: true, active: false },
    { number: 3, title: "Choose Financing", description: "Select a payment option", completed: false, active: true },
    { number: 4, title: "Review & Submit", description: "Confirm and submit", completed: false, active: false },
  ];

  // Build a smooth gradient across the tube using the provided color stops
  const getRatioGradient = (ratio: number) => {
    const colors = [
      "#4cdd80",
      "#52dd7e",
      "#76d85a",
      "#a9d246",
      "#e3e182",
      "#f1e174",
      "#fbbc15",
      "#f8ac21",
      "#f67e25",
      "#f04f42",
      "#f0413a",
    ];

    // Create evenly spaced stops for the full gradient
    const step = 100 / (colors.length - 1);
    const stops = colors.map((c, i) => `${c} ${Math.round(i * step)}%`);
    // Return a full gradient string. We still use the ratio to set the width of the inner bar.
    return `linear-gradient(90deg, ${stops.join(", ")})`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Student Re-Registration 2024</h1>
          <p className="text-muted-foreground">Complete the re-registration process for the upcoming academic year</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Left Sidebar - Progress */}
          <Card className="h-fit p-6">
            <h2 className="mb-6 text-lg font-semibold">Progress</h2>
            <ProgressSteps steps={steps} currentStep={3} />
            <div className="mt-6">
              <ProgressBar percentage={75} />
            </div>
          </Card>

          {/* Right Content Area */}
          <div className="space-y-6">
            {/* Affordability Assessment Card */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Affordability Assessment</h3>
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Financing Recommended</span>
                </div>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Annual School Fees</p>
                  <p className="text-2xl font-bold">R {affordabilityData.annualFees.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Disposable Income</p>
                  <p className="text-2xl font-bold">R {affordabilityData.availableIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funding Gap</p>
                  <p className="text-2xl font-bold">R {affordabilityData.fundingGap.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold">Fee-to-Income Ratio</span>
                  <span className="text-xl font-bold">{affordabilityData.ratio}%</span>
                </div>
                <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(affordabilityData.ratio, 100)}%`,
                      background: getRatioGradient(affordabilityData.ratio),
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>Comfortable (0-50%)</span>
                  <span>Manageable (50-70%)</span>
                  <span>Challenging (70%+)</span>
                </div>
              </div>
            </Card>

            {/* Financing Plans Grid */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Available Financing Options</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {financingPlans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <Card
                      key={plan.id}
                      className={`relative cursor-pointer p-6 transition-all ${
                        isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedPlan(plan.id);
                        }
                      }}
                    >
                      {isSelected && (
                        <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{plan.title}</h4>
                          <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                        </div>
                        {plan.recommended && (
                          <Badge className="bg-blue-100 text-blue-900">Best Value</Badge>
                        )}
                        {plan.badge && (
                          <Badge
                            variant={
                              plan.badge.type === "save"
                                ? "default"
                                : plan.badge.type === "cost"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {plan.badge.text}
                          </Badge>
                        )}
                      </div>

                      <div className="mb-4">
                        <span className="text-2xl font-bold">R {plan.price.toLocaleString()}</span>
                        <span className="ml-2 text-muted-foreground">{plan.period}</span>
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            {feature.icon === "check" ? (
                              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            ) : (
                              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                            )}
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="mt-4 w-full"
                        variant={isSelected ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(plan.id);
                        }}
                      >
                        {isSelected ? "Selected" : "Select Plan"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Selected Plan Summary and EFT Instructions */}
            {selectedPlan && (
              <div className="space-y-4">
                <Card className="border-blue-200 bg-blue-50 p-6">
                  <p className="mb-2 text-sm font-medium text-gray-600">Selected Plan</p>
                  <h3 className="mb-2 text-lg font-semibold text-blue-900">
                    {financingPlans.find((p) => p.id === selectedPlan)?.title}
                  </h3>
                  <p className="text-lg font-bold text-blue-700">
                    R {financingPlans.find((p) => p.id === selectedPlan)?.price.toLocaleString()} {financingPlans.find((p) => p.id === selectedPlan)?.period}
                  </p>
                </Card>

                {selectedPlan === "pay-via-eft" && (
                  <Card className="border-amber-200 bg-amber-50 p-6 space-y-4">
                    <h4 className="font-semibold text-amber-900">EFT Payment Instructions</h4>
                    <div className="space-y-3 text-sm text-amber-800">
                      <div>
                        <span className="font-medium block">School Bank Account:</span>
                        <p className="text-gray-700">KNIT School Trust Account</p>
                      </div>
                      <div>
                        <span className="font-medium block">Account Number:</span>
                        <p className="text-gray-700">62 108 9876 5432</p>
                      </div>
                      <div>
                        <span className="font-medium block">Branch Code:</span>
                        <p className="text-gray-700">250655</p>
                      </div>
                      <div>
                        <span className="font-medium block">Reference Format:</span>
                        <p className="text-gray-700">STUDENT_ID-YEAR (e.g., ST12345-2025)</p>
                      </div>
                    </div>
                    <div className="rounded border border-amber-100 bg-white p-3">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">📌 Important:</span> Please upload proof of payment after transfer or submit to school office. Use the reference format above for quick reconciliation.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Qualifications and Required Docs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-6">
                <h4 className="mb-4 font-semibold">You Qualify For</h4>
                <div className="space-y-3">
                  {qualifications.map((q, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-3 w-3 text-green-700" />
                      </div>
                      <span className="text-sm">{q}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="mb-4 font-semibold">Required Documents</h4>
                <div className="space-y-3">
                  {requiredDocs.map((r, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                        {i === requiredDocs.length - 1 ? (
                          <AlertCircle className="h-3 w-3 text-gray-500" />
                        ) : (
                          <Check className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                      <span className="text-sm">{r}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={saving}>
                Previous
              </Button>
              <Button className="ml-auto" onClick={handleContinue} disabled={saving}>
                {saving ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancingOption;
