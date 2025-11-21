// frontend/src/pages/UpdateDetails.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Edit2, Loader2, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Student {
  application_id: string;
  first_name: string;
  surname: string;
  gender: string;
  date_of_birth: string;
  street_address: string;
  city: string;
  state: string;
  postcode: string;
  phone_number: string;
  email: string;
  grade_applied_for: string;
  id_number: string;
}

const UpdateDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentsFromState: Student[] = (location.state as any)?.students || [];
  const parentIdFromState = (location.state as any)?.parentId || '';
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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

  const handleChange = (index: number, field: keyof Student, value: string) => {
    // Validate phone number - only allow digits, max 10
    if (field === "phone_number") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    // Check if all phone numbers are exactly 10 digits
    for (const stu of students) {
      if (stu.phone_number.length !== 10) {
        alert("❌ All phone numbers must be exactly 10 digits.");
        return;
      }
      if (!isValidEmail(stu.email)) {
        alert("❌ All emails must be valid Gmail addresses (example@gmail.com).");
        return;
      }
    }
    
    setSaving(true);
    try {
      // Update each student
      for (const stu of students) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/students/${stu.id_number}`, stu);
      }
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("❌ Failed to update student(s):", err);
      alert("❌ Failed to update student(s). Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    );
  }
  
  if (!students || students.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Students Found</h2>
          <p className="text-muted-foreground mb-6">No students were selected or available to update.</p>
          <Button onClick={() => navigate("/re-registration")} className="gap-2">
            Back to Selection
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Select Children", description: "Choose students to re-register", completed: true, active: false },
    { number: 2, title: "Update Details", description: "Review and update information", completed: false, active: true },
    { number: 3, title: "Choose Financing", description: "Select a payment option", completed: false, active: false },
    { number: 4, title: "Review & Submit", description: "Confirm and submit", completed: false, active: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Edit2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Update Student Details</h1>
              <p className="text-muted-foreground mt-1">2025 Academic Year</p>
            </div>
          </div>
        </div>

        {/* Information Banner */}
        <Alert className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Please review and update all student information. This data will be used for the re-registration process.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Progress Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
                <CardDescription>Registration Steps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProgressSteps steps={steps} currentStep={2} />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Step Completion</span>
                    <span className="text-sm font-bold text-primary">50%</span>
                  </div>
                  <ProgressBar percentage={50} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {students.map((stu, idx) => (
              <Card key={stu.application_id} className="overflow-hidden">
                {/* Student Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                          {stu.first_name[0]}{stu.surname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{stu.first_name} {stu.surname}</h2>
                        <p className="text-sm text-blue-700 mt-1">Student ID: {stu.id_number}</p>
                        <p className="text-sm text-blue-700">Current Grade: {stu.grade_applied_for}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">Active Student</Badge>
                  </div>
                </div>

                {/* Form Content */}
                <CardContent className="pt-6 space-y-6">
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      Personal Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">First Name</Label>
                        <p className="text-foreground font-medium">{stu.first_name}</p>
                      </div>
                      <div className="border-t border-gray-200"></div>
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">Last Name</Label>
                        <p className="text-foreground font-medium">{stu.surname}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      Academic Information
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3 bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor={`grade-${idx}`} className="font-semibold">Next Grade</Label>
                        <Select value={stu.grade_applied_for} onValueChange={(v) => handleChange(idx, "grade_applied_for", v)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["8","9","10","11","12"].filter(g => parseInt(g) >= parseInt(stu.grade_applied_for)).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${idx}`} className="font-semibold">Phone Number</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id={`phone-${idx}`}
                            value={stu.phone_number}
                            onChange={(e) => handleChange(idx, "phone_number", e.target.value)}
                            className={cn(
                              "bg-white",
                              stu.phone_number.length > 0 && stu.phone_number.length !== 10
                                ? "border-red-500 border-2 focus:ring-red-500"
                                : ""
                            )}
                            placeholder="0123456789"
                            maxLength={10}
                          />
                          {stu.phone_number.length === 10 ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : stu.phone_number.length > 0 ? (
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          ) : (
                            <span className="text-xs text-gray-500 flex-shrink-0">{stu.phone_number.length}/10</span>
                          )}
                        </div>
                        {stu.phone_number.length > 0 && stu.phone_number.length !== 10 && (
                          <p className="text-sm text-red-600 font-medium">Phone number must be exactly 10 digits</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`email-${idx}`} className="font-semibold">Email</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id={`email-${idx}`}
                            value={stu.email}
                            onChange={(e) => handleChange(idx, "email", e.target.value)}
                            className={cn(
                              "bg-white",
                              stu.email.length > 0 && !isValidEmail(stu.email)
                                ? "border-red-500 border-2 focus:ring-red-500"
                                : ""
                            )}
                            placeholder="example@gmail.com"
                          />
                          {stu.email.length > 0 && isValidEmail(stu.email) ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : stu.email.length > 0 ? (
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          ) : null}
                        </div>
                        {stu.email.length > 0 && !isValidEmail(stu.email) && (
                          <p className="text-sm text-red-600 font-medium">Email must be a valid Gmail address (example@gmail.com)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      Address Information
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <Label className="font-semibold">Street Address</Label>
                        <Input
                          value={stu.street_address}
                          onChange={(e) => handleChange(idx, "street_address", e.target.value)}
                          className="bg-white"
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="font-semibold">City</Label>
                          <Input
                            value={stu.city}
                            onChange={(e) => handleChange(idx, "city", e.target.value)}
                            className="bg-white"
                            placeholder="Enter city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">State</Label>
                          <Select value={stu.state} onValueChange={(v) => handleChange(idx, "state", v)}>
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">Postcode</Label>
                          <Input
                            value={stu.postcode}
                            onChange={(e) => handleChange(idx, "postcode", e.target.value)}
                            className="bg-white"
                            placeholder="Enter postcode"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/re-registration")}
              >
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleSave}
                disabled={saving || students.some(s => s.phone_number.length !== 10 || !isValidEmail(s.email))}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 animate-pulse">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <DialogTitle className="text-xl text-green-900">Update Successful!</DialogTitle>
            </div>
            <DialogDescription className="text-green-800 mt-3">
              Student details have been updated successfully. You're one step closer to completing re-registration.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white rounded-lg p-4 my-4 border border-green-200">
            <p className="text-sm text-gray-700 font-semibold">
              ✓ {students.length} student{students.length !== 1 ? 's' : ''} updated
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate("/re-registration/financing", { state: { students, parentId } });
              }}
            >
              Continue to Next Step
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateDetails;
