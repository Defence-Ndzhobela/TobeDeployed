import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface Student {
  application_id: string;
  first_name: string;
  surname: string;
  id_number: string;
  grade_applied_for: string;
  gender: string;
  city: string;
  state: string;
  status?: string;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parentIdNumber = localStorage.getItem("parent_id_number");

  useEffect(() => {
    if (!parentIdNumber) {
      navigate("/");
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/parents/${parentIdNumber}/children`);
        setStudents(response.data.children || []);
      } catch (err: any) {
        console.error("❌ Error fetching students:", err);
        setError("Failed to load students. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [parentIdNumber, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <p className="text-red-500">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Students</h1>
            <p className="text-muted-foreground">Manage your children's registrations</p>
          </div>
          <Button onClick={() => navigate("/register-student")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        {students.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No students found for your account.</p>
            <Button className="mt-4" onClick={() => navigate("/register-student")}>
              Register New Student
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => {
              const initials = `${student.first_name?.[0] || ""}${student.surname?.[0] || ""}`.toUpperCase();
              return (
                <Card key={student.application_id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {student.first_name} {student.surname}
                          </CardTitle>
                          <CardDescription>{student.grade_applied_for}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-success text-success-foreground">
                        {student.status || "Active"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-medium">{student.id_number}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate("/re-registration")}
                      >
                        Re-register
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/register-student")}>
              <Plus className="mr-2 h-4 w-4" />
              Register New Student
            </Button>
            <Button variant="outline" onClick={() => navigate("/re-registration")}>
              Start Re-registration Process
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ParentDashboard;
