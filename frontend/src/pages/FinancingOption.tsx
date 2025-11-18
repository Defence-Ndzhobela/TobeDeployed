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
  const parentIdFromState = (location.state as any)?.parentId || '';

  // start with no selection so user must choose explicitly
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get parentId from state or localStorage
  const parentId = parentIdFromState || localStorage.getItem("parent_id_number") || '';

  useEffect(() => {
    if (!studentsFromState || studentsFromState.length === 0) {
      setLoading(false);
      return;
    }
    setStudents(studentsFromState);
    setLoading(false);
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

    // Save plan to backend if parentId exists
    if (parentId) {
      setSaving(true);
      console.log("Saving plan for parentId:", parentId, "Plan:", selectedPlan);
      try {
        const response = await saveSelectedPlan(parentId, {
          selected_plan: selectedPlan,
          total_price: plan.price,
          period: plan.period
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
      console.warn("No parentId available, skipping plan save");
    }

    // Navigate to Declaration page first (user requested flow: Financing -> Declaration -> Review)
    navigate("/re-registration/declaration", { state: { students, selectedPlan, parentId } });
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

  // Sample data
  const affordabilityData = {
    annualFees: 85000,
    availableIncome: 65000,
    fundingGap: 20000,
    ratio: 76,
  };

  const financingPlans: FinancingPlan[] = [
    {
      id: "pay-monthly",
      title: "Monthly Debit Order",
      subtitle: "Zero discount",
      price: 7083,
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
      price: 27483,
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
      price: 80750,
      period: "per year",
      badge: { text: "Save 5%", type: "save" },
      recommended: true,
      features: [
        { text: "Maximum discount available", icon: "check" },
        { text: "One payment, no worries", icon: "check" },
        { text: "Save R 4,250 annually", icon: "check" },
      ],
    },
    {
      id: "buy-now-pay-later",
      title: "Buy Now, Pay Later",
      subtitle: "Flexible option",
      price: 7933,
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
      price: 8125,
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
      price: 6375,
      period: "per child/month",
      badge: { text: "Save 10%", type: "save" },
      features: [
        { text: "10% discount per additional child", icon: "check" },
        { text: "Combined family billing", icon: "check" },
        { text: `${students.length} children selected`, icon: "info" },
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
