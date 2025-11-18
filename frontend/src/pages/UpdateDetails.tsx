// frontend/src/pages/UpdateDetails.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin } from "lucide-react";
import Header from "@/components/Header";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each student
      for (const stu of students) {
        await axios.put(`https://knitcash.onrender.com/api/students/${stu.id_number}`, stu);
      }
      alert("✅ Student(s) updated successfully!");
      navigate("/re-registration/financing", { state: { students, parentId } });
    } catch (err) {
      console.error("❌ Failed to update student(s):", err);
      alert("❌ Failed to update student(s). Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!students || students.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>No students selected or available to update.</p>
        <Button onClick={() => navigate("/re-registration")}>Back to Selection</Button>
      </div>
    );

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Student Re-Registration 2024</h1>
          <p className="text-muted-foreground">Complete the re-registration process for the upcoming academic year</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit p-6">
            <h2 className="mb-6 text-lg font-semibold">Progress</h2>
            <ProgressSteps steps={steps} currentStep={2} />
            <div className="mt-6">
              <ProgressBar percentage={50} />
            </div>
          </Card>

          <div className="space-y-6">
            {students.map((stu, idx) => (
              <Card className="p-6" key={stu.application_id}>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {stu.first_name[0]}{stu.surname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{stu.first_name} {stu.surname}</h2>
                      <p className="text-sm text-muted-foreground">Re-registration Details</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">Active Student</Badge>
                </div>

                <form className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`firstName-${idx}`}>First Name</Label>
                      <Input id={`firstName-${idx}`} value={stu.first_name} onChange={(e) => handleChange(idx, "first_name", e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`lastName-${idx}`}>Last Name</Label>
                      <Input id={`lastName-${idx}`} value={stu.surname} onChange={(e) => handleChange(idx, "surname", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`grade-${idx}`}>Next Grade</Label>
                      <Select value={stu.grade_applied_for} onValueChange={(v) => handleChange(idx, "grade_applied_for", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["8","9","10","11","12"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`phone-${idx}`}>Phone Number</Label>
                      <Input id={`phone-${idx}`} value={stu.phone_number} onChange={(e) => handleChange(idx, "phone_number", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`email-${idx}`}>Email</Label>
                      <Input id={`email-${idx}`} value={stu.email} onChange={(e) => handleChange(idx, "email", e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Address Information</h3>
                    </div>
                    <div className="space-y-2">
                      <Label>Street Address</Label>
                      <Input value={stu.street_address} onChange={(e) => handleChange(idx, "street_address", e.target.value)} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input value={stu.city} onChange={(e) => handleChange(idx, "city", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Select value={stu.state} onValueChange={(v) => handleChange(idx, "state", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["VIC","NSW","QLD"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Postcode</Label>
                        <Input value={stu.postcode} onChange={(e) => handleChange(idx, "postcode", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </form>
              </Card>
            ))}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/re-registration")}>Previous</Button>
              <Button className="ml-auto" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateDetails;
