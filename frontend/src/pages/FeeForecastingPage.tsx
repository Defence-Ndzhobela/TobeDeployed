import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Bell, 
  Download, 
  Clock,
  Users,
  CalendarRange,
  MoreVertical,
  CreditCard,
  AlertCircle,
  Plus,
  LucideIcon,
  ArrowLeft,
  Zap,
  Target,
  Loader2
} from "lucide-react";
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

interface StudentResponse {
  students?: Array<{
    application_id?: string;
    id_number: string;
    first_name: string;
    surname: string;
    grade_applied_for?: string;
  }>;
}

// FeeCard Component
interface FeeCardProps {
  icon: LucideIcon;
  title: string;
  amount: string;
  description: string;
  badge: string;
  variant: "annual" | "upcoming" | "forecast";
}

function FeeCard({ icon: Icon, title, amount, description, badge, variant }: FeeCardProps) {
  const variantStyles = {
    annual: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
    upcoming: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
    forecast: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
  };

  const textStyles = {
    annual: { title: "text-blue-600", amount: "text-blue-900", icon: "text-blue-600" },
    upcoming: { title: "text-green-600", amount: "text-green-900", icon: "text-green-600" },
    forecast: { title: "text-red-600", amount: "text-red-900", icon: "text-red-600" },
  };

  const badgeStyles = {
    annual: "bg-blue-200 text-blue-900",
    upcoming: "bg-green-200 text-green-900",
    forecast: "bg-red-200 text-red-900",
  };

  return (
    <Card className={`p-6 border ${variantStyles[variant]} transition-all hover:shadow-lg cursor-pointer`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${textStyles[variant].icon} opacity-20`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeStyles[variant]}`}>
          {badge}
        </span>
      </div>
      <h3 className={`text-sm font-medium ${textStyles[variant].title} mb-2`}>{title}</h3>
      <p className={`text-3xl font-bold ${textStyles[variant].amount} mb-1`}>{amount}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
}

// LearnerFeeCard Component
interface LearnerFeeCardProps {
  name: string;
  grade: string;
  studentId: string;
  totalRemaining: string;
  tuitionFee: string;
  activityFee: string;
  facilityFee: string;
  avatarUrl?: string;
}

function LearnerFeeCard({
  name,
  grade,
  studentId,
  totalRemaining,
  tuitionFee,
  activityFee,
  facilityFee,
  avatarUrl,
}: LearnerFeeCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');
  
  return (
    <div className="flex items-center justify-between py-4 px-4 border-b last:border-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-purple-200">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="text-white font-bold text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-card-foreground text-lg">{name}</h4>
          <p className="text-sm text-muted-foreground">{grade} • Student ID: {studentId}</p>
          <div className="flex gap-2 mt-2">
            <Badge className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border-0">
              Tuition: {tuitionFee}
            </Badge>
            <Badge className="text-xs bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 border-0">
              Activities: {activityFee}
            </Badge>
            <Badge className="text-xs bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-900 border-0">
              Facilities: {facilityFee}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{totalRemaining}</p>
        <p className="text-sm text-muted-foreground">Remaining</p>
      </div>
    </div>
  );
}

// UpcomingActivityCard Component
interface UpcomingActivityCardProps {
  title: string;
  grade: string;
  learner: string;
  date: string;
  amount: string;
  dueInDays: number;
}

function UpcomingActivityCard({
  title,
  grade,
  learner,
  date,
  amount,
  dueInDays,
}: UpcomingActivityCardProps) {
  const isDueSoon = dueInDays <= 15;
  
  return (
    <Card className={`p-4 hover:shadow-lg transition-all border-l-4 ${
      isDueSoon 
        ? "bg-gradient-to-r from-red-50 to-orange-50 border-l-red-500 hover:from-red-100 hover:to-orange-100" 
        : "bg-gradient-to-r from-blue-50 to-cyan-50 border-l-blue-500 hover:from-blue-100 hover:to-cyan-100"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-card-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{grade} • {learner}</p>
        </div>
        <p className={`text-2xl font-bold ${isDueSoon ? "bg-gradient-to-r from-red-600 to-orange-600" : "bg-gradient-to-r from-blue-600 to-cyan-600"} bg-clip-text text-transparent`}>{amount}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <Badge 
          className={isDueSoon 
            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white border-0" 
            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0"
          }
        >
          Due in {dueInDays} days
        </Badge>
      </div>
    </Card>
  );
}

// ForecastBreakdownCard Component
interface ForecastItemProps {
  label: string;
  amount: string;
  description: string;
}

function ForecastItem({ label, amount, description }: ForecastItemProps) {
  return (
    <div className="flex-1">
      <p className="text-sm font-medium opacity-90 mb-1">{label}</p>
      <p className="text-2xl font-bold">{amount}</p>
      <p className="text-xs opacity-75 mt-1">{description}</p>
    </div>
  );
}

interface ForecastBreakdownCardProps {
  tuition: string;
  facilities: string;
  activities: string;
  total: string;
}

function ForecastBreakdownCard({ tuition, facilities, activities, total }: ForecastBreakdownCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-3 rounded-full bg-white/40 animate-pulse" />
        <h3 className="font-semibold text-lg">December 2024 Forecast Breakdown</h3>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <ForecastItem 
          label="Tuition Fees" 
          amount={tuition} 
          description="Both learners"
        />
        <ForecastItem 
          label="Facility Fees" 
          amount={facilities} 
          description="Monthly charges"
        />
        <ForecastItem 
          label="Planned Activities" 
          amount={activities} 
          description="2 activities due"
        />
        <ForecastItem 
          label="Total Expected" 
          amount={total} 
          description="Due before Dec 1"
        />
      </div>
    </Card>
  );
}

// RecentPayments Component
interface Payment {
  title: string;
  date: string;
  amount: string;
}

const payments: Payment[] = [
  { title: "November Tuition", date: "Nov 1, 2024", amount: "$1,500" },
  { title: "Facility Fees", date: "Nov 1, 2024", amount: "$310" },
  { title: "Field Trip", date: "Oct 28, 2024", amount: "$95" },
];

function RecentPayments() {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-card-foreground">Recent Payments</h3>
      </div>
      <div className="space-y-4">
        {payments.map((payment, index) => (
          <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0 hover:bg-white hover:px-2 hover:py-1 rounded transition-colors">
            <div>
              <p className="font-medium text-card-foreground">{payment.title}</p>
              <p className="text-sm text-muted-foreground">{payment.date}</p>
            </div>
            <p className="text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">{payment.amount}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// PaymentMethods Component
function PaymentMethods() {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg">
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-card-foreground">Payment Methods</h3>
      </div>
      <div className="space-y-4">
        <Card className="p-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white border-0 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <p className="text-sm opacity-90 mb-2">Primary Card</p>
            <p className="text-xl font-semibold mb-4 tracking-wider">•••• •••• •••• 4532</p>
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-90">Visa</p>
              <p className="text-sm">Exp: 08/26</p>
            </div>
          </div>
        </Card>
        <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-50 text-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>
    </Card>
  );
}

// PaymentAlerts Component
interface Alert {
  icon: "warning" | "info";
  title: string;
  description: string;
}

const alerts: Alert[] = [
  {
    icon: "warning",
    title: "Payment Due Soon",
    description: "December fees due in 8 days",
  },
  {
    icon: "info",
    title: "New Activity Added",
    description: "Drama Club show fee added",
  },
];

function PaymentAlerts() {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-orange-50 border-orange-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg">
          <Bell className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-card-foreground">Payment Alerts</h3>
      </div>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 hover:bg-white hover:px-2 hover:py-1 rounded transition-colors">
            <div className={`p-2 rounded-lg ${alert.icon === "warning" ? "bg-gradient-to-br from-red-100 to-orange-100" : "bg-gradient-to-br from-blue-100 to-cyan-100"}`}>
              <AlertCircle className={`h-4 w-4 ${alert.icon === "warning" ? "text-red-600" : "text-blue-600"}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-card-foreground text-sm">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Main Fee Forecasting Page
const FeeForecastingPage = () => {
  const navigate = useNavigate();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parentIdNumber = localStorage.getItem("parent_id_number");

  useEffect(() => {
    if (!parentIdNumber) {
      navigate("/");
      return;
    }

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // Fetch students directly from API
        const studentsResponse = await axios.get<StudentResponse>(
          `${import.meta.env.VITE_API_BASE_URL}/parents/${parentIdNumber}/students`
        );
        const students = studentsResponse.data.students || [];

        if (students.length === 0) {
          console.warn("No students found for parent");
          setLearners(getMockLearners());
          return;
        }

        // Calculate dashboard data from students
        const monthlyFeePerStudent = 4500;
        
        // Transform student data to Learner format
        const transformedLearners: Learner[] = students.map((student) => ({
          id: student.application_id || student.id_number,
          first_name: student.first_name,
          surname: student.surname,
          student_id: student.id_number,
          grade: student.grade_applied_for || "N/A",
          monthly_fee: monthlyFeePerStudent,
          paid_this_month: 0,
          outstanding_amount: monthlyFeePerStudent,
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          facility_linked: true,
          payment_status: "partial" as const,
        }));

        setLearners(transformedLearners);
      } catch (err: any) {
        console.error("❌ Error fetching student data:", err);
        // Fallback to mock data
        setLearners(getMockLearners());
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [parentIdNumber, navigate]);

  const getMockLearners = (): Learner[] => {
    return [
      {
        id: "1",
        first_name: "Emma",
        surname: "Johnson",
        student_id: "2024-1042",
        grade: "Grade 10",
        monthly_fee: 6000,
        paid_this_month: 0,
        outstanding_amount: 7200,
        next_payment_date: "2025-12-01",
        facility_linked: true,
        payment_status: "partial",
      },
      {
        id: "2",
        first_name: "Lucas",
        surname: "Johnson",
        student_id: "2024-1043",
        grade: "Grade 7",
        monthly_fee: 4500,
        paid_this_month: 0,
        outstanding_amount: 5250,
        next_payment_date: "2025-12-01",
        facility_linked: true,
        payment_status: "partial",
      },
    ];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl p-6">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Fee Forecasting</h1>
            <p className="text-muted-foreground mt-1">Plan your educational expenses & financial projections</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/parent-dashboard")} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button onClick={() => {
              // Generate CSV forecast report
              const csvContent = "Month,Standard Fees,Activity Fees,Total\nDecember,1500,570,2070\nJanuary,1500,300,1800";
              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `fee-forecast-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Request Statement
            </Button>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid gap-4 mb-8 md:grid-cols-3">
          <FeeCard
            icon={DollarSign}
            title="Total Remaining Fees"
            amount="$12,450"
            description="For 2024 academic year"
            badge="Annual"
            variant="annual"
          />
          <FeeCard
            icon={Calendar}
            title="Activity & Trip Fees"
            amount="$850"
            description="3 activities scheduled"
            badge="Upcoming"
            variant="upcoming"
          />
          <FeeCard
            icon={CalendarRange}
            title="December Forecast"
            amount="$2,380"
            description="Tuition + Facilities + Activities"
            badge="Next Month"
            variant="forecast"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Fees by Learner */}
          <Card className="lg:col-span-2 p-6 bg-white shadow-lg border-0">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Fees by Learner</h3>
                <p className="text-xs text-muted-foreground">Monthly fees and outstanding amounts</p>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-muted-foreground">Loading student information...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            ) : learners.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <span>No students found</span>
              </div>
            ) : (
              <div className="space-y-4">
                {learners.map((learner) => (
                  <LearnerFeeCard
                    key={learner.id}
                    name={`${learner.first_name} ${learner.surname}`}
                    grade={learner.grade}
                    studentId={learner.student_id}
                    totalRemaining={`$${learner.outstanding_amount.toLocaleString()}`}
                    tuitionFee={`$${(learner.monthly_fee * 0.6).toLocaleString()}`}
                    activityFee={`$${(learner.monthly_fee * 0.18).toLocaleString()}`}
                    facilityFee={`$${(learner.monthly_fee * 0.14).toLocaleString()}`}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Activities */}
          <Card className="p-6 bg-white shadow-lg border-0">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg">
                <CalendarRange className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Upcoming Activities</h3>
                <p className="text-xs text-muted-foreground">Scheduled trips and events</p>
              </div>
            </div>
            <div className="space-y-3">
              {learners.length > 0 && (
                <>
                  <UpcomingActivityCard
                    title="Science Museum Trip"
                    grade={learners[0]?.grade || "Grade 10"}
                    learner={`${learners[0]?.first_name} ${learners[0]?.surname}` || "Emma Johnson"}
                    date="Dec 15, 2024"
                    amount="$120"
                    dueInDays={12}
                  />
                  {learners.length > 1 && (
                    <UpcomingActivityCard
                      title="Winter Sports Camp"
                      grade={learners[1]?.grade || "Grade 7"}
                      learner={`${learners[1]?.first_name} ${learners[1]?.surname}` || "Lucas Johnson"}
                      date="Dec 20, 2024"
                      amount="$450"
                      dueInDays={17}
                    />
                  )}
                  <UpcomingActivityCard
                    title="Drama Club Annual Show"
                    grade={learners[0]?.grade || "Grade 10"}
                    learner={`${learners[0]?.first_name} ${learners[0]?.surname}` || "Emma Johnson"}
                    date="Jan 10, 2025"
                    amount="$280"
                    dueInDays={38}
                  />
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Forecast Breakdown */}
        <div className="mt-12 mb-8">
          <ForecastBreakdownCard
            tuition="$1,500"
            facilities="$310"
            activities="$570"
            total="$2,380"
          />
        </div>

        {/* Make Payment Section */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ready to make a payment?</h3>
                <p className="text-green-100">Secure payment processing available</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button className="bg-white text-green-700 hover:bg-green-50 font-semibold gap-2">
                <CreditCard className="h-4 w-4" />
                Make Payment
              </Button>
            </div>
          </div>
        </Card>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RecentPayments />
          <PaymentMethods />
          <PaymentAlerts />
        </div>
      </main>
    </div>
  );
};

export default FeeForecastingPage;
