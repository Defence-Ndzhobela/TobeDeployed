import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, Bell, AlertCircle, CheckCircle, Clock, Eye, TrendingUp, DollarSign, Download } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface Learner {
  id: string;
  first_name: string;
  surname: string;
  student_id: string;
  grade: string;
  monthly_fee: number;
  paid_this_month: number;
  outstanding_amount: number;
  next_payment_date: string;
  facility_linked?: boolean;
  payment_status: "up-to-date" | "partial" | "overdue" | "no-facility";
}

interface FeeBreakdown {
  tuition_fees: number;
  activity_fees: number;
  facility_fees: number;
  other_fees: number;
}

interface DashboardData {
  total_learners: number;
  total_monthly_fees: number;
  outstanding_amount: number;
  learners: Learner[];
  fee_breakdown: FeeBreakdown;
}

interface StudentResponse {
  students?: Array<{
    application_id?: string;
    id_number: string;
    first_name: string;
    surname: string;
    grade_applied_for?: string;
  }>;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parentIdNumber = localStorage.getItem("parent_id_number");

  useEffect(() => {
    if (!parentIdNumber) {
      navigate("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // First, try to fetch from the dashboard endpoint
        try {
          const response = await axios.get<DashboardData>(`${import.meta.env.VITE_API_BASE_URL}/parents/${parentIdNumber}/dashboard`);
          setDashboardData(response.data);
          return;
        } catch (dashboardError) {
          console.log("Dashboard endpoint not available, fetching students directly...");
        }

        // If dashboard endpoint fails, fetch students directly
        const studentsResponse = await axios.get<StudentResponse>(`${import.meta.env.VITE_API_BASE_URL}/parents/${parentIdNumber}/students`);
        const students = studentsResponse.data.students || [];

        if (students.length === 0) {
          console.warn("No students found for parent");
          setDashboardData(getMockDashboardData());
          return;
        }

        // Calculate dashboard data from students
        const totalLearners = students.length;
        const monthlyFeePerStudent = 4500; // This should come from a fee table ideally
        const totalMonthlyFees = totalLearners * monthlyFeePerStudent;
        
        // Transform student data to Learner format
        const learners: Learner[] = students.map((student) => ({
          id: student.application_id || student.id_number,
          first_name: student.first_name,
          surname: student.surname,
          student_id: student.id_number,
          grade: student.grade_applied_for || "N/A",
          monthly_fee: monthlyFeePerStudent,
          paid_this_month: 0, // This should come from payments table
          outstanding_amount: monthlyFeePerStudent, // This should come from payments table
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          facility_linked: true,
          payment_status: "partial" as const,
        }));

        const dashboardDataCalculated: DashboardData = {
          total_learners: totalLearners,
          total_monthly_fees: totalMonthlyFees,
          outstanding_amount: totalMonthlyFees,
          learners: learners,
          fee_breakdown: {
            tuition_fees: totalMonthlyFees * 0.6,
            activity_fees: totalMonthlyFees * 0.18,
            facility_fees: totalMonthlyFees * 0.14,
            other_fees: totalMonthlyFees * 0.08,
          },
        };

        setDashboardData(dashboardDataCalculated);
      } catch (err: any) {
        console.error("❌ Error fetching dashboard data:", err);
        // Fallback to mock data
        setDashboardData(getMockDashboardData());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [parentIdNumber, navigate]);

  // Mock data for development
  const getMockDashboardData = (): DashboardData => {
    return {
      total_learners: 2,
      total_monthly_fees: 8500,
      outstanding_amount: 3000,
      learners: [
        {
          id: "1",
          first_name: "Junior",
          surname: "Ndzhobela",
          student_id: "STU001",
          grade: "Grade 8",
          monthly_fee: 4500,
          paid_this_month: 3000,
          outstanding_amount: 1500,
          next_payment_date: "2025-12-15",
          facility_linked: true,
          payment_status: "partial",
        },
        {
          id: "2",
          first_name: "Thandi",
          surname: "Ndzhobela",
          student_id: "STU002",
          grade: "Grade 10",
          monthly_fee: 4000,
          paid_this_month: 4000,
          outstanding_amount: 1500,
          next_payment_date: "2025-12-20",
          facility_linked: true,
          payment_status: "up-to-date",
        },
      ],
      fee_breakdown: {
        tuition_fees: 5000,
        activity_fees: 1500,
        facility_fees: 1200,
        other_fees: 800,
      },
    };
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "up-to-date": "bg-green-100 text-green-800",
      "partial": "bg-yellow-100 text-yellow-800",
      "overdue": "bg-red-100 text-red-800",
      "no-facility": "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "up-to-date": "Up to Date",
      "partial": "Partial Payment",
      "overdue": "Overdue",
      "no-facility": "No Facility",
    };
    return labels[status] || status;
  };

  const getUrgencyColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "text-red-600"; // Overdue
    if (daysUntilDue <= 7) return "text-yellow-600"; // Urgent
    return "text-green-600"; // Not urgent
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <p className="text-red-500">Failed to load dashboard data.</p>
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
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Parent Portal</h1>
            <p className="text-muted-foreground mt-1">Financial Overview & Payment Management</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/re-registration")} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Re-registration
            </Button>
            <Button onClick={() => navigate("/fee-forecasting")} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              📊 Fee Forecasting
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Request Statement
            </Button>
          </div>
        </div>

        {/* Summary Cards - Top Section */}
        <div className="grid gap-4 mb-8 md:grid-cols-3">
          {/* Total Learners Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Learners</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{dashboardData.total_learners}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Total Monthly Fees Card */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Monthly Fees</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">R {dashboardData.total_monthly_fees.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Amount Card */}
          <Card className={`bg-gradient-to-br ${dashboardData.outstanding_amount > 0 ? "from-red-50 to-red-100 border-red-200" : "from-gray-50 to-gray-100 border-gray-200"}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm font-medium ${dashboardData.outstanding_amount > 0 ? "text-red-600" : "text-gray-600"}`}>
                    Outstanding Amount
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${dashboardData.outstanding_amount > 0 ? "text-red-900" : "text-gray-900"}`}>
                    R {dashboardData.outstanding_amount.toLocaleString()}
                  </p>
                </div>
                {dashboardData.outstanding_amount > 0 && (
                  <AlertCircle className="h-8 w-8 text-red-600 opacity-20" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Learner Overview Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Learner Overview</CardTitle>
                  <CardDescription>Monthly fees, payments, and status for each learner</CardDescription>
                </div>
                <Button onClick={() => {
                  // Generate CSV report
                  const csvContent = [
                    ["Learner Name", "Grade", "Student ID", "Monthly Fee", "Paid This Month", "Outstanding", "Next Payment", "Status"],
                    ...dashboardData.learners.map(l => [
                      `${l.first_name} ${l.surname}`,
                      l.grade,
                      l.student_id,
                      `R ${l.monthly_fee}`,
                      `R ${l.paid_this_month}`,
                      `R ${l.outstanding_amount}`,
                      new Date(l.next_payment_date).toLocaleDateString(),
                      l.payment_status
                    ])
                  ].map(row => row.join(",")).join("\n");
                  
                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `learner-report-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.learners.map((learner) => {
                  const paymentPercentage = (learner.paid_this_month / learner.monthly_fee) * 100;
                  const initials = `${learner.first_name?.[0] || ""}${learner.surname?.[0] || ""}`.toUpperCase();

                  return (
                    <div
                      key={learner.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow hover:bg-gray-50"
                    >
                      {/* Learner Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12 bg-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {learner.first_name} {learner.surname}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {learner.grade} • ID: {learner.student_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {learner.facility_linked && (
                            <Badge className="bg-blue-100 text-blue-800">Facility Linked</Badge>
                          )}
                          <Badge className={getPaymentStatusColor(learner.payment_status)}>
                            {getStatusLabel(learner.payment_status)}
                          </Badge>
                        </div>
                      </div>

                      {/* Payment Progress Section */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        {/* Monthly Fee */}
                        <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                          <p className="text-xs font-medium text-orange-600 mb-1">Monthly Fee</p>
                          <p className="text-lg font-bold text-orange-900">R {learner.monthly_fee.toLocaleString()}</p>
                        </div>
                        {/* Paid This Month */}
                        <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
                          <p className="text-xs font-medium text-yellow-600 mb-1">Paid This Month</p>
                          <p className="text-lg font-bold text-yellow-900">R {learner.paid_this_month.toLocaleString()}</p>
                        </div>
                        {/* Outstanding */}
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                          <p className="text-xs font-medium text-blue-600 mb-1">Outstanding</p>
                          <p className="text-lg font-bold text-blue-900">
                            R {learner.outstanding_amount.toLocaleString()}
                          </p>
                        </div>
                        {/* Next Payment */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Next Payment</p>
                          <p className="text-lg font-bold text-foreground">{new Date(learner.next_payment_date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-medium text-muted-foreground">Payment Progress</p>
                          <p className="text-xs font-medium text-foreground">25%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all bg-orange-500"
                            style={{ width: "25%" }}
                          />
                        </div>
                      </div>

                      {/* Next Payment Date & View Details */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Next Payment: <span className="font-semibold text-foreground">{new Date(learner.next_payment_date).toLocaleDateString()}</span>
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary hover:underline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Fee Breakdown & Upcoming Payments */}
          <div className="space-y-6">
            {/* Fee Breakdown Section */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Breakdown</CardTitle>
                <CardDescription>Monthly fee structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#4A91E2" }}></div>
                    <span className="text-sm text-muted-foreground">Tuition Fees</span>
                  </div>
                  <span className="font-semibold">R {dashboardData.fee_breakdown.tuition_fees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#7ED321" }}></div>
                    <span className="text-sm text-muted-foreground">Activity Fees</span>
                  </div>
                  <span className="font-semibold">R {dashboardData.fee_breakdown.activity_fees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#EBB30B" }}></div>
                    <span className="text-sm text-muted-foreground">Facility Fees</span>
                  </div>
                  <span className="font-semibold">R {dashboardData.fee_breakdown.facility_fees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#9DA3AF" }}></div>
                    <span className="text-sm text-muted-foreground">Other Fees</span>
                  </div>
                  <span className="font-semibold">R {dashboardData.fee_breakdown.other_fees.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold">Total Monthly</span>
                  <span className="text-lg font-bold text-primary">
                    R {dashboardData.total_monthly_fees.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Payments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Sorted by due date</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.learners
                  .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime())
                  .map((learner) => (
                    <div key={learner.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">{learner.first_name} {learner.surname}</p>
                          <p className="text-xs text-muted-foreground">{learner.grade}</p>
                        </div>
                        <p className={`text-sm font-bold ${getUrgencyColor(learner.next_payment_date)}`}>
                          R {learner.outstanding_amount.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Due: {new Date(learner.next_payment_date).toLocaleDateString()}
                      </p>
                      <Button
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-white text-xs"
                      >
                        Make Payment
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
