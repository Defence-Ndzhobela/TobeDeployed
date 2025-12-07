import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RegisterStudent from "./pages/RegisterStudent";
import ParentDashboard from "./pages/ParentDashboard";
import ReRegistration from "./pages/ReRegistration";
import UpdateDetails from "./pages/UpdateDetails";
import FinancingOption from "./pages/FinancingOption";
import ReviewSubmit from "./pages/ReviewSubmit";
import DeclarationPage from "./pages/Declaration";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import FeeForecastingPage from "./pages/FeeForecastingPage";
import AIAssistant from "./pages/AIAssistant";
import RequestStatement from "./pages/RequestStatement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register-student" element={<RegisterStudent />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/fee-forecasting" element={<FeeForecastingPage />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/request-statement" element={<RequestStatement />} />
          <Route path="/re-registration" element={<ReRegistration />} />
          <Route path="/re-registration/update-details" element={<UpdateDetails />} />
          <Route path="/re-registration/financing" element={<FinancingOption />} />
          <Route path="/re-registration/declaration" element={<DeclarationPage />} />
          <Route path="/re-registration/review" element={<ReviewSubmit />} />
          <Route path="/re-registration/success" element={<RegistrationSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
