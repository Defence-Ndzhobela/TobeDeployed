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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase";
import { studentDataService } from "@/services/studentDataService";

interface Student {
  id: string;
  application_id?: string;
  first_name: string;
  surname: string;
  middle_name?: string;
  preferred_name?: string;
  gender: string;
  date_of_birth: string;
  home_language: string;
  previous_grade?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  grade_applied_for: string;
  id_number: string;
  previous_school?: string;
}

interface BankAccountDetails {
  account_holder_name: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  branch_code: string;
}

const UpdateDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentsFromState: Student[] = (location.state as any)?.students || [];
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [bankDetails, setBankDetails] = useState<BankAccountDetails>({
    account_holder_name: '',
    bank_name: '',
    account_type: 'Cheque',
    account_number: '',
    branch_code: '',
  });
  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const loadStudentData = async () => {
      if (!studentsFromState || studentsFromState.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Process students and fetch their address data from address table
        const processedStudents = await Promise.all(
          studentsFromState.map(async (stu) => {
            let addressData = null;

            // Fetch address data if application_id exists
            if (stu.application_id) {
              addressData = await studentDataService.getAddressByApplicationId(stu.application_id);
            }

            return {
              id: stu.id || '',
              application_id: stu.application_id || '',
              first_name: stu.first_name || '',
              surname: stu.surname || '',
              middle_name: stu.middle_name || '',
              preferred_name: stu.preferred_name || '',
              gender: stu.gender || '',
              date_of_birth: stu.date_of_birth || '',
              home_language: stu.home_language || '',
              previous_grade: stu.previous_grade || '',
              previous_school: stu.previous_school || '',
              street_address: addressData?.street_address || stu.street_address || '',
              city: addressData?.city || stu.city || '',
              state: addressData?.state || stu.state || '',
              postcode: addressData?.postcode || stu.postcode || '',
              phone: stu.phone || '',
              email: stu.email || '',
              grade_applied_for: stu.grade_applied_for || '',
              id_number: stu.id_number || '',
            };
          })
        );

        setStudents(processedStudents);

        // Fetch fee responsibility (bank) data for the first student's application
        if (studentsFromState[0]?.application_id) {
          const feeResponsibility = await studentDataService.getFeeResponsibilityByApplicationId(
            studentsFromState[0].application_id
          );

          if (feeResponsibility) {
            // Combine parent_first_name and parent_surname
            const accountHolderName = [
              feeResponsibility.parent_first_name,
              feeResponsibility.parent_surname
            ].filter(Boolean).join(' ');

            setBankDetails({
              account_holder_name: accountHolderName || '',
              bank_name: feeResponsibility.bank_name || '',
              account_type: feeResponsibility.account_type || 'Cheque',
              account_number: feeResponsibility.account_number || '',
              branch_code: feeResponsibility.branch_code || '',
            });

            // Set selected plan if it exists
            if (feeResponsibility.selected_plan) {
              setSelectedPlan(feeResponsibility.selected_plan);
            }
          }
        }
      } catch (error) {
        console.error('Error loading student data:', error);
        // Fallback: just use the passed students without fetching address data
        const processedStudents = studentsFromState.map(stu => ({
          id: stu.id || '',
          application_id: stu.application_id || '',
          first_name: stu.first_name || '',
          surname: stu.surname || '',
          middle_name: stu.middle_name || '',
          preferred_name: stu.preferred_name || '',
          gender: stu.gender || '',
          date_of_birth: stu.date_of_birth || '',
          home_language: stu.home_language || '',
          previous_grade: stu.previous_grade || '',
          previous_school: stu.previous_school || '',
          street_address: stu.street_address || '',
          city: stu.city || '',
          state: stu.state || '',
          postcode: stu.postcode || '',
          phone: stu.phone || '',
          email: stu.email || '',
          grade_applied_for: stu.grade_applied_for || '',
          id_number: stu.id_number || '',
        }));
        setStudents(processedStudents);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [studentsFromState]);

  const handleChange = (index: number, field: keyof Student, value: string) => {
    // Validate phone number - only allow digits, max 10
    if (field === "phone") {
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

  const validateBankDetails = (): boolean => {
    const errors: Record<string, string> = {};

    if (!bankDetails.account_holder_name.trim()) {
      errors.account_holder_name = 'Account holder name is required';
    } else if (bankDetails.account_holder_name.trim().length < 3) {
      errors.account_holder_name = 'Name must be at least 3 characters';
    } else if (bankDetails.account_holder_name.trim().length > 50) {
      errors.account_holder_name = 'Name cannot exceed 50 characters';
    }

    if (!bankDetails.bank_name) {
      errors.bank_name = 'Bank name is required';
    }

    if (!bankDetails.account_type) {
      errors.account_type = 'Account type is required';
    }

    if (!bankDetails.account_number.trim()) {
      errors.account_number = 'Account number is required';
    } else if (!/^\d+$/.test(bankDetails.account_number)) {
      errors.account_number = 'Account number must be numeric only';
    } else if (bankDetails.account_number.length < 8 || bankDetails.account_number.length > 17) {
      errors.account_number = 'Account number must be 8-17 digits';
    }

    if (!bankDetails.branch_code.trim()) {
      errors.branch_code = 'Branch code is required';
    } else if (!/^\d+$/.test(bankDetails.branch_code)) {
      errors.branch_code = 'Branch code must be numeric only';
    } else if (bankDetails.branch_code.length !== 6) {
      errors.branch_code = 'Branch code must be exactly 6 digits';
    }

    setBankErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBankDetailsChange = (field: keyof BankAccountDetails, value: string) => {
    let processedValue = value;

    // Apply field-specific formatting
    if (field === 'account_number' || field === 'branch_code') {
      processedValue = value.replace(/\D/g, ''); // Allow only digits
    }

    // Set max lengths
    if (field === 'branch_code' && processedValue.length > 6) return;
    if (field === 'account_number' && processedValue.length > 17) return;

    setBankDetails(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear error for this field when user starts typing
    if (bankErrors[field]) {
      setBankErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = async () => {
    // Check if all phone numbers are exactly 10 digits
    for (const stu of students) {
      if (stu.phone && stu.phone.length !== 10) {
        alert("❌ All phone numbers must be exactly 10 digits.");
        return;
      }
      if (stu.email && !isValidEmail(stu.email)) {
        alert("❌ All emails must be valid Gmail addresses (example@gmail.com).");
        return;
      }
    }

    // Validate bank details
    if (!validateBankDetails()) {
      alert("❌ Please fix all bank account details errors before continuing.");
      return;
    }
    
    setSaving(true);
    try {
      // Update each student in Supabase
      for (const stu of students) {
        // Update student data
        const { error } = await supabase
          .from("students")
          .update({
            phone: stu.phone,
            email: stu.email,
            grade_applied_for: stu.grade_applied_for,
          })
          .eq("id", stu.id);

        if (error) {
          console.error("❌ Error updating student:", error);
          throw error;
        }

        // Save address data to address table if application_id exists
        if (stu.application_id) {
          const addressData = await studentDataService.saveAddress({
            application_id: stu.application_id,
            street_address: stu.street_address,
            city: stu.city,
            state: stu.state,
            postcode: stu.postcode,
          });

          if (!addressData) {
            console.error("❌ Error saving address data");
            throw new Error("Failed to save address data");
          }
        }
      }

      // Save bank account details to fee_responsibility table
      if (students[0]?.application_id) {
        const feeResponsibilityData = await studentDataService.saveFeeResponsibility({
          application_id: students[0].application_id,
          bank_name: bankDetails.bank_name,
          branch_code: bankDetails.branch_code,
          account_number: bankDetails.account_number,
          account_type: bankDetails.account_type,
          selected_plan: selectedPlan,
          parent_first_name: bankDetails.account_holder_name.split(' ')[0] || '',
          parent_surname: bankDetails.account_holder_name.split(' ').slice(1).join(' ') || '',
        });

        if (!feeResponsibilityData) {
          console.error("❌ Error saving bank details to fee_responsibility");
          throw new Error("Failed to save bank details");
        }
      }

      setShowSuccessDialog(true);
    } catch (err) {
      console.error("❌ Failed to update student(s) or bank details:", err);
      alert("❌ Failed to update information. Please try again.");
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
                        <p className="text-sm text-blue-700">Current Grade: {stu.previous_grade || 'N/A'}</p>
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
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      {/* Grade Row */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="font-semibold">Current Grade</Label>
                          <p className="text-foreground font-medium mt-1 bg-white p-2 rounded border border-gray-300">{stu.previous_grade || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`grade-${idx}`} className="font-semibold">Next Grade</Label>
                          <Select value={stu.grade_applied_for} onValueChange={(v) => handleChange(idx, "grade_applied_for", v)}>
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(() => {
                                const gradeStr = (stu.previous_grade || "7").toString().replace(/\D/g, '');
                                const currentGrade = parseInt(gradeStr) || 7;
                                const gradeOptions = [];
                                
                                // Show current grade as option
                                gradeOptions.push(
                                  <SelectItem key={currentGrade} value={currentGrade.toString()}>
                                    {currentGrade}
                                  </SelectItem>
                                );
                                
                                // Show next grade if not grade 12
                                if (currentGrade < 12) {
                                  gradeOptions.push(
                                    <SelectItem key={currentGrade + 1} value={(currentGrade + 1).toString()}>
                                      {currentGrade + 1}
                                    </SelectItem>
                                  );
                                }
                                
                                return gradeOptions;
                              })()}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Contact Row */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`phone-${idx}`} className="font-semibold">Phone Number</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id={`phone-${idx}`}
                              value={stu.phone || ''}
                              onChange={(e) => handleChange(idx, "phone", e.target.value)}
                              className={cn(
                                "bg-white",
                                (stu.phone?.length || 0) > 0 && (stu.phone?.length || 0) !== 10
                                  ? "border-red-500 border-2 focus:ring-red-500"
                                  : ""
                              )}
                              placeholder="0123456789"
                              maxLength={10}
                            />
                            {(stu.phone?.length || 0) === 10 ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (stu.phone?.length || 0) > 0 ? (
                              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            ) : (
                              <span className="text-xs text-gray-500 flex-shrink-0">{stu.phone?.length || 0}/10</span>
                            )}
                          </div>
                          {(stu.phone?.length || 0) > 0 && (stu.phone?.length || 0) !== 10 && (
                            <p className="text-sm text-red-600 font-medium">Phone number must be exactly 10 digits</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`email-${idx}`} className="font-semibold">Email</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id={`email-${idx}`}
                              value={stu.email || ''}
                              onChange={(e) => handleChange(idx, "email", e.target.value)}
                              className={cn(
                                "bg-white",
                                (stu.email?.length || 0) > 0 && !isValidEmail(stu.email || '')
                                  ? "border-red-500 border-2 focus:ring-red-500"
                                  : ""
                              )}
                              placeholder="example@gmail.com"
                            />
                            {(stu.email?.length || 0) > 0 && isValidEmail(stu.email || '') ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (stu.email?.length || 0) > 0 ? (
                              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            ) : null}
                          </div>
                          {(stu.email?.length || 0) > 0 && !isValidEmail(stu.email || '') && (
                            <p className="text-sm text-red-600 font-medium">Email must be a valid Gmail address (example@gmail.com)</p>
                          )}
                        </div>
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
                          value={stu.street_address || ''}
                          onChange={(e) => handleChange(idx, "street_address", e.target.value)}
                          className="bg-white"
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="font-semibold">City</Label>
                          <Input
                            value={stu.city || ''}
                            onChange={(e) => handleChange(idx, "city", e.target.value)}
                            className="bg-white"
                            placeholder="Enter city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">State</Label>
                          <Select value={stu.state || ''} onValueChange={(v) => handleChange(idx, "state", v)}>
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
                            value={stu.postcode || ''}
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

            {/* Bank Account Details Section */}
            <Card className="overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-300 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <span className="text-lg">💳</span>
                  </div>
                  Bank Account Details
                </h3>
                <p className="text-blue-100 text-sm mt-2">Required for Netcash debit order mandate creation</p>
              </div>

              <CardContent className="pt-6 space-y-4">
                <Alert className="border-blue-300 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    Your bank account details will be securely stored and used only for creating a debit order mandate for your school fees.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Account Holder Name */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="account-holder-name" className="font-semibold text-gray-700">
                      Account Holder Name *
                    </Label>
                    <Input
                      id="account-holder-name"
                      value={bankDetails.account_holder_name}
                      onChange={(e) => handleBankDetailsChange('account_holder_name', e.target.value)}
                      placeholder="John Doe"
                      className={cn(
                        "bg-white",
                        bankErrors.account_holder_name ? "border-red-500 border-2" : ""
                      )}
                    />
                    {bankErrors.account_holder_name && (
                      <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {bankErrors.account_holder_name}
                      </p>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div className="space-y-2">
                    <Label htmlFor="bank-name" className="font-semibold text-gray-700">
                      Bank Name *
                    </Label>
                    <Select value={bankDetails.bank_name} onValueChange={(v) => handleBankDetailsChange('bank_name', v)}>
                      <SelectTrigger className={cn(
                        "bg-white",
                        bankErrors.bank_name ? "border-red-500 border-2" : ""
                      )}>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ABSA">ABSA Bank</SelectItem>
                        <SelectItem value="FNB">FNB (First National Bank)</SelectItem>
                        <SelectItem value="Nedbank">Nedbank</SelectItem>
                        <SelectItem value="Standard">Standard Bank</SelectItem>
                        <SelectItem value="Capitec">Capitec Bank</SelectItem>
                        <SelectItem value="Discovery">Discovery Bank</SelectItem>
                        <SelectItem value="African">African Bank</SelectItem>
                        <SelectItem value="TymeBank">TymeBank</SelectItem>
                        <SelectItem value="Other">Other Bank</SelectItem>
                      </SelectContent>
                    </Select>
                    {bankErrors.bank_name && (
                      <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {bankErrors.bank_name}
                      </p>
                    )}
                  </div>

                  {/* Account Type */}
                  <div className="space-y-2">
                    <Label htmlFor="account-type" className="font-semibold text-gray-700">
                      Account Type *
                    </Label>
                    <Select value={bankDetails.account_type} onValueChange={(v) => handleBankDetailsChange('account_type', v)}>
                      <SelectTrigger className={cn(
                        "bg-white",
                        bankErrors.account_type ? "border-red-500 border-2" : ""
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Money Market">Money Market</SelectItem>
                        <SelectItem value="Bond">Bond</SelectItem>
                      </SelectContent>
                    </Select>
                    {bankErrors.account_type && (
                      <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {bankErrors.account_type}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="account-number" className="font-semibold text-gray-700">
                      Account Number * (8-17 digits)
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="account-number"
                        value={bankDetails.account_number}
                        onChange={(e) => handleBankDetailsChange('account_number', e.target.value)}
                        placeholder="123456789"
                        className={cn(
                          "bg-white",
                          bankErrors.account_number ? "border-red-500 border-2" : ""
                        )}
                      />
                      {bankDetails.account_number && !bankErrors.account_number && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {bankDetails.account_number && bankErrors.account_number && (
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                    {bankErrors.account_number && (
                      <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {bankErrors.account_number}
                      </p>
                    )}
                  </div>

                  {/* Branch Code */}
                  <div className="space-y-2">
                    <Label htmlFor="branch-code" className="font-semibold text-gray-700">
                      Branch Code * (6 digits)
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="branch-code"
                        value={bankDetails.branch_code}
                        onChange={(e) => handleBankDetailsChange('branch_code', e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className={cn(
                          "bg-white",
                          bankErrors.branch_code ? "border-red-500 border-2" : ""
                        )}
                      />
                      <span className="text-xs text-gray-500 flex-shrink-0">{bankDetails.branch_code.length}/6</span>
                    </div>
                    {bankErrors.branch_code && (
                      <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {bankErrors.branch_code}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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
                disabled={saving || students.some(s => 
                  (s.phone && s.phone.length > 0 && s.phone.length !== 10) || 
                  (s.email && !isValidEmail(s.email))
                ) || 
                  Object.keys(bankErrors).length > 0 ||
                  !bankDetails.account_holder_name.trim() ||
                  !bankDetails.bank_name ||
                  !bankDetails.account_type ||
                  !bankDetails.account_number.trim() ||
                  !bankDetails.branch_code.trim()}
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
                navigate("/re-registration/financing", { state: { students, userId } });
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
