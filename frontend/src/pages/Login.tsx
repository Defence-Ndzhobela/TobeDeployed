import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginParent } from "../api/parentApi";

const Login = () => {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parent = await loginParent(idNumber);
      if (parent) {
        // Optionally store in localStorage or context
        localStorage.setItem("parent_id_number", parent.id_number);
        localStorage.setItem("parent_name", parent.full_name);

        // Navigate to parent dashboard
        navigate("/parent-dashboard");
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Parent not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Knit Edu Parent Portal</CardTitle>
            <CardDescription className="mt-2">
              Enter your ID number to access your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                type="text"
                placeholder="Enter your 13-digit ID number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                maxLength={13}
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="space-y-2 text-center text-sm">
              <p className="text-muted-foreground">Don't have an account?</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/register-parent")}
                >
                  Register as Parent
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/register-student")}
                >
                  Register as Student
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
