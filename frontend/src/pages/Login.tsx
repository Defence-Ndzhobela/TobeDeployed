import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { loginParent } from "../api/parentApi";

const Login = () => {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parent = await loginParent(idNumber);
      if (parent) {
        // Store parent data in localStorage for later use
        localStorage.setItem("parent_id_number", parent.id_number);
        localStorage.setItem("parent_name", parent.full_name);
        localStorage.setItem("parent_data", JSON.stringify(parent));

        // Navigate to parent dashboard
        navigate("/parent-dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Parent not found. Please register first.");
      setShowErrorDialog(true);
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
          </form>
        </CardContent>
      </Card>

      {/* Parent Not Found Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl text-red-900">Account Not Found</DialogTitle>
            </div>
            <DialogDescription className="text-red-800 mt-2">
              We couldn't find a parent account with this ID number. Please register to create an account.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white rounded-lg p-4 my-4 border border-red-200">
            <p className="text-sm text-gray-700 font-semibold">
              What should you do?
            </p>
            <ul className="text-sm text-gray-600 mt-3 space-y-2 ml-4">
              <li>• Make sure you entered your ID number correctly</li>
              <li>• You need to register as a parent first</li>
              <li>• Contact support if you need assistance</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 flex flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowErrorDialog(false)}
            >
              Try Again
            </Button>
            <Button
              type="button"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowErrorDialog(false);
                navigate("/register-parent");
              }}
            >
              Register
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
