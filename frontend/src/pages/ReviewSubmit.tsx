import { useState } from "react";
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

const ReviewSubmit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get students from navigation state (passed from UpdateDetails)
  const students = (location.state as any)?.students || [];
  const selectedPlan = (location.state as any)?.selectedPlan || '';
  const [termsAccepted, setTermsAccepted] = useState({
    terms: false,
    payment: false,
    consent: false,
  });

  const steps = [
    {
      number: 1,
      title: "Select Children",
      description: "Choose students to re-register",
      completed: true,
      active: false,
    },
    {
      number: 2,
      title: "Update Details",
      description: "Review and update information",
      completed: true,
      active: false,
    },
    {
      number: 3,
      title: "Choose Financing",
      description: "Select a payment option",
      completed: true,
      active: false,
    },
    {
      number: 4,
      title: "Review & Submit",
      description: "Confirm and submit",
      completed: false,
      active: true,
    },
  ];

  const allTermsAccepted = Object.values(termsAccepted).every(Boolean);

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
          <Card className="h-fit p-6">
            <h2 className="mb-6 text-lg font-semibold">Progress</h2>
            <ProgressSteps steps={steps} currentStep={4} />
            <div className="mt-6">
              <ProgressBar percentage={100} />
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      EJ
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">Emma Johnson</h2>
                    <p className="text-sm text-muted-foreground">Re-registration Details</p>
                  </div>
                </div>
                <Badge className="bg-success text-success-foreground">
                  Active Student
                </Badge>
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
                      <p className="font-medium">Emma Johnson</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Grade</p>
                      <p className="font-medium">Grade 4</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enrolling For</p>
                      <p className="font-medium">Grade 5 - 2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Selected Payment Plan</p>
                      <p className="font-medium">{selectedPlan ? selectedPlan.replace(/-/g, ' ') : '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Status</p>
                      <Badge className="bg-success text-success-foreground">
                        Ready to Submit
                      </Badge>
                    </div>
                  </div>
                </Card>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Payment Details</h4>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Tuition Fee</span>
                      <span className="font-medium">$4,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrollment Fee</span>
                      <span className="font-medium">$250</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-base">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-bold text-primary">$4,750</span>
                    </div>
                  </div>

                  <Card className="border-primary/20 bg-accent/50 p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Payment Schedule</p>
                          <p className="text-sm text-muted-foreground">
                            You can choose to pay in full or split into 4 quarterly installments
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Payment Due Date</p>
                          <p className="text-sm text-muted-foreground">
                            First payment due by July 15, 2024
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <p className="text-sm text-muted-foreground">
                    * You will receive a payment invoice via email after confirming registration. Payment can be made online through the parent portal or at the school office.
                  </p>
                </div>

                <Alert className="border-amber-200 bg-amber-50">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-900">
                    <p className="mb-2 font-semibold">Important Notes:</p>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>Registration is not complete until payment is received</li>
                      <li>Late enrollment fees may apply after the deadline</li>
                      <li>Fees are non-refundable once the term has commenced</li>
                      <li>Financial assistance options are available - contact the office for details</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg bg-accent p-4">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted.terms}
                      onCheckedChange={(checked) =>
                        setTermsAccepted({ ...termsAccepted, terms: !!checked })
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="terms"
                        className="cursor-pointer font-medium leading-none"
                      >
                        I have read and agree to the Terms of Enrolment for 2024
                      </label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        By checking this box, you acknowledge that you have read, understood, and agree to comply with all terms and conditions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-accent p-4">
                    <Checkbox
                      id="payment"
                      checked={termsAccepted.payment}
                      onCheckedChange={(checked) =>
                        setTermsAccepted({ ...termsAccepted, payment: !!checked })
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="payment"
                        className="cursor-pointer font-medium leading-none"
                      >
                        I agree to the tuition fee payment schedule
                      </label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Fees must be paid according to the schedule provided. Late payments may result in additional charges.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-accent p-4">
                    <Checkbox
                      id="consent"
                      checked={termsAccepted.consent}
                      onCheckedChange={(checked) =>
                        setTermsAccepted({ ...termsAccepted, consent: !!checked })
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="consent"
                        className="cursor-pointer font-medium leading-none"
                      >
                        I consent to the collection and use of student information
                      </label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Student data will be used for educational purposes and handled according to privacy regulations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/re-registration/financing", { state: { students } })}
                  >
                    Previous
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Student 2 of 2 • Step 4 of 4
                  </p>
                  <Button
                    size="lg"
                    onClick={() => navigate("/re-registration/success")}
                    disabled={!allTermsAccepted}
                  >
                    Complete Registration
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewSubmit;
