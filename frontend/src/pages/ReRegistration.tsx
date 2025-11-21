// frontend/src/pages/ReRegistration.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Check, MapPin, Users, ArrowRight, GraduationCap, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Student Re-Registration</h1>
              <p className="text-muted-foreground mt-1">2025 Academic Year</p>
            </div>
          </div>
        </div>

        {/* Deadline Banner */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Registration Deadline</p>
              <p className="text-sm text-blue-700">March 31, 2025 - Ensure timely submission</p>
            </div>
          </div>
          <Badge className="bg-blue-600 text-white">Important</Badge>
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
                <ProgressSteps steps={steps} currentStep={1} />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Step Completion</span>
                    <span className="text-sm font-bold text-primary">{selectedStudents.length > 0 ? 33 : 0}%</span>
                  </div>
                  <ProgressBar percentage={selectedStudents.length > 0 ? 33 : 0} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Selection Info Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Select Children for Re-Registration</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Choose which children you'd like to re-register for the upcoming academic year. You can select multiple students at once.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Selection Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Your Children</CardTitle>
                <CardDescription>
                  {students.length} student{students.length !== 1 ? 's' : ''} available for re-registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {students.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground font-medium">No students found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please contact support if you believe this is an error.
                      </p>
                    </div>
                  ) : (
                    students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => toggleStudent(student.id)}
                        className={cn(
                          "relative rounded-lg border-2 p-5 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
                          selectedStudents.includes(student.id)
                            ? "border-primary bg-gradient-to-br from-blue-50 to-blue-100"
                            : "border-gray-200 bg-card hover:border-gray-300"
                        )}
                      >
                        {/* Selection Checkmark */}
                        {selectedStudents.includes(student.id) && (
                          <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-md">
                            <Check className="h-4 w-4 text-white font-bold" />
                          </div>
                        )}

                        {/* Student Info */}
                        <div className="mb-4 flex items-center gap-3">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                              {student.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-lg">{student.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-blue-100 text-blue-800">{student.grade}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium text-foreground">ID:</span>
                            <span>{student.studentId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(student.dob).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{student.city}, {student.state} {student.postcode}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selection Summary */}
            {students.length > 0 && (
              <Card className={cn(
                selectedStudents.length > 0 
                  ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200" 
                  : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
              )}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full font-bold text-white",
                      selectedStudents.length > 0 ? "bg-green-600" : "bg-gray-400"
                    )}>
                      {selectedStudents.length}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "font-semibold",
                        selectedStudents.length > 0 ? "text-green-900" : "text-gray-700"
                      )}>
                        {selectedStudents.length === 0 
                          ? "Select children to proceed" 
                          : `${selectedStudents.length} child${selectedStudents.length !== 1 ? 'ren' : ''} selected for re-registration`}
                      </p>
                      <p className={cn(
                        "text-sm mt-1",
                        selectedStudents.length > 0 ? "text-green-700" : "text-gray-600"
                      )}>
                        {selectedStudents.length === 0 
                          ? "Click on student cards to select them for registration" 
                          : "Ready to proceed to the next step"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => navigate("/parent-dashboard")}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={() =>
                  navigate("/re-registration/update-details", {
                    state: {
                      students: students
                        .filter((s) => selectedStudents.includes(s.id))
                        .map((s) => s.rawData),
                      parentId,
                    },
                  })
                }
                disabled={selectedStudents.length === 0}
                className="gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReRegistration;
