// frontend/src/pages/ReRegistration.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Check, MapPin, Users } from "lucide-react";
import Header from "@/components/Header";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchParentChildren } from "@/api/parentApi";

const ReRegistration = () => {
  const navigate = useNavigate();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const parentId = localStorage.getItem("parent_id_number"); // logged-in parent

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Fetch children dynamically from database
  useEffect(() => {
    if (!parentId) return;

    const fetchStudents = async () => {
      try {
        const data = await fetchParentChildren(parentId);
        if (!data || data.length === 0) {
          console.warn("No students found for this parent.");
          setStudents([]);
          return;
        }

        const mapped = data.map((stu: any) => ({
          id: stu.application_id,
          name: `${stu.first_name} ${stu.surname}`,
          grade: stu.grade_applied_for,
          studentId: stu.id_number,
          dob: stu.date_of_birth,
          city: stu.city,
          state: stu.state,
          streetAddress: stu.street_address,
          postcode: stu.postcode,
          phoneNumber: stu.phone_number,
          email: stu.email,
          avatar: "/placeholder.svg",
          initials: `${stu.first_name[0]}${stu.surname[0]}`,
          rawData: stu, // pass full student object
        }));

        setStudents(mapped);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [parentId]);

  const steps = [
    { number: 1, title: "Select Children", description: "Choose students to re-register", completed: false, active: true },
    { number: 2, title: "Update Details", description: "Review and update information", completed: false, active: false },
    { number: 3, title: "Review & Submit", description: "Confirm and submit", completed: false, active: false },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header userName={localStorage.getItem("parent_name") || "Parent"} />

      <main className="mx-auto max-w-7xl p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Student Re-Registration 2024</h1>
          <p className="text-muted-foreground">
            Complete the re-registration process for the upcoming academic year
          </p>
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Deadline: March 31, 2024</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Progress Card */}
          <Card className="h-fit p-6">
            <h2 className="mb-6 text-lg font-semibold">Progress</h2>
            <ProgressSteps steps={steps} currentStep={1} />
            <div className="mt-6">
              <ProgressBar percentage={selectedStudents.length > 0 ? 33 : 0} />
            </div>
          </Card>

          {/* Children Selection */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Select Children for Re-Registration</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students found.</p>
                ) : (
                  students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={cn(
                        "relative rounded-lg border-2 p-6 text-left transition-all hover:shadow-md",
                        selectedStudents.includes(student.id)
                          ? "border-primary bg-accent"
                          : "border-border bg-card"
                      )}
                    >
                      {selectedStudents.includes(student.id) && (
                        <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div className="mb-4 flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">{student.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">Current Grade: {student.grade}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">Student ID: {student.studentId}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>DOB: {student.dob}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{student.city}, {student.state}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Selection Summary */}
              <div className="mt-6 rounded-lg bg-accent p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <span className="text-sm font-semibold text-primary-foreground">{selectedStudents.length}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {selectedStudents.length} children selected for re-registration
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click on any child card to deselect. You can add more children from your account settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  onClick={() =>
                    navigate("/re-registration/update-details", {
                      state: {
                        students: students
                          .filter((s) => selectedStudents.includes(s.id))
                          .map((s) => s.rawData),
                      },
                    })
                  }
                  disabled={selectedStudents.length === 0}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReRegistration;
