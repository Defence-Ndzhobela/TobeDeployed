import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, Sparkles, AlertCircle, Copy, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import { OPENAI_API_KEY, OPENAI_API_URL, OPENAI_MODEL } from '@/config/openaiConfig';
import Header from '@/components/Header';
import { studentDataService } from '@/services/studentDataService';
import { getFeeByGrade } from '@/services/schoolFeesService';

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
  payment_status: 'up-to-date' | 'partial' | 'overdue' | 'no-facility';
}

interface DashboardData {
  total_learners: number;
  total_monthly_fees: number;
  outstanding_amount: number;
  learners: Learner[];
  fee_breakdown: {
    tuition_fees: number;
    activity_fees: number;
    facility_fees: number;
    sport_fees: number;
    other_fees: number;
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Billing Assistant. I can help answer questions about your fees, payments, and account details. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem('ai_search_history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          navigate('/login');
          return;
        }

        console.log('Fetching dashboard data for user:', userId);
        setDataLoading(true);

        // Get all applications for this user (same as ParentDashboard)
        const applications = await studentDataService.getApplicationsForUser(userId);
        
        if (applications.length === 0) {
          console.warn("No applications found for user");
          // Use mock data as fallback
          const mockData: DashboardData = {
            total_learners: 0,
            total_monthly_fees: 0,
            outstanding_amount: 0,
            learners: [],
            fee_breakdown: {
              tuition_fees: 0,
              activity_fees: 0,
              facility_fees: 0,
              sport_fees: 0,
              other_fees: 0,
            },
          };
          setDashboardData(mockData);
          setDataLoading(false);
          return;
        }

        const learners: Learner[] = [];
        let totalMonthlyFees = 0;
        let totalOutstanding = 0;
        let totalTuitionFees = 0;
        let totalActivityFees = 0;
        let totalFacilityFees = 0;
        let totalSportFees = 0;
        let totalOtherFees = 0;

        // Fetch data for each application
        for (const app of applications) {
          const students = await studentDataService.getStudentsByApplicationId(app.id);
          
          for (const student of students) {
            const paidAmount = await studentDataService.calculatePaidAmount(student.id);
            
            // Fetch fees from database based on grade
            let monthlyFee = 5000; // Default fallback
            let tuitionFee = 3000;
            let activityFee = 900;
            let facilityFee = 700;
            let sportFee = 0;
            let otherFee = 400;

            const grade = student.grade_applied_for || "Grade 10";
            const dbFees = await getFeeByGrade(grade);
            
            if (dbFees) {
              // Calculate monthly fees from annual fees
              monthlyFee = Math.round(dbFees.annual_fee / 12);
              
              // Break down the monthly fee into components
              tuitionFee = Math.round(monthlyFee * 0.6);
              activityFee = Math.round(monthlyFee * 0.18);
              facilityFee = Math.round(monthlyFee * 0.14);
              sportFee = dbFees.sport_fee || 0;
              otherFee = Math.round(monthlyFee * 0.08);
            }

            const outstanding = Math.max(0, monthlyFee - paidAmount);
            const nextPaymentDate = await studentDataService.getNextPaymentDueDate(student.id);
            
            const paymentStatus = outstanding === 0 ? "up-to-date" : outstanding < monthlyFee * 0.5 ? "partial" : "overdue";

            learners.push({
              id: student.id,
              first_name: student.first_name,
              surname: student.surname,
              student_id: student.id_number,
              grade: student.grade_applied_for || "N/A",
              monthly_fee: monthlyFee,
              paid_this_month: paidAmount,
              outstanding_amount: outstanding,
              next_payment_date: nextPaymentDate.toISOString().split('T')[0],
              facility_linked: true,
              payment_status: paymentStatus as "up-to-date" | "partial" | "overdue" | "no-facility",
            });

            totalMonthlyFees += monthlyFee;
            totalOutstanding += outstanding;
            totalTuitionFees += tuitionFee;
            totalActivityFees += activityFee;
            totalFacilityFees += facilityFee;
            totalSportFees += sportFee;
            totalOtherFees += otherFee;
          }
        }

        if (learners.length === 0) {
          // Use empty data
          const emptyData: DashboardData = {
            total_learners: 0,
            total_monthly_fees: 0,
            outstanding_amount: 0,
            learners: [],
            fee_breakdown: {
              tuition_fees: 0,
              activity_fees: 0,
              facility_fees: 0,
              sport_fees: 0,
              other_fees: 0,
            },
          };
          setDashboardData(emptyData);
          setDataLoading(false);
          return;
        }

        const dashboardDataCalculated: DashboardData = {
          total_learners: learners.length,
          total_monthly_fees: totalMonthlyFees,
          outstanding_amount: totalOutstanding,
          learners: learners,
          fee_breakdown: {
            tuition_fees: totalTuitionFees,
            activity_fees: totalActivityFees,
            facility_fees: totalFacilityFees,
            sport_fees: totalSportFees,
            other_fees: totalOtherFees,
          },
        };

        console.log('Dashboard data loaded:', dashboardDataCalculated);
        setDashboardData(dashboardDataCalculated);
        setError(null);
        setDataLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load billing information. Please try again.');
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const callOpenAI = async (userMessage: string): Promise<string> => {
    if (!dashboardData) {
      return 'Unable to access your billing information. Please refresh and try again.';
    }

    try {
      const learnerSummary = dashboardData.learners
        .map(learner => `${learner.first_name} ${learner.surname} (${learner.grade}): Monthly fee R${learner.monthly_fee.toLocaleString()}, Outstanding R${learner.outstanding_amount.toLocaleString()}, Status: ${learner.payment_status}`)
        .join('\n');

      const systemPrompt = `You are a helpful AI Billing Assistant for a school fee management system. You have access to the parent's real billing information. Be friendly, professional, and accurate.

PARENT BILLING INFORMATION:
- Total Learners: ${dashboardData.total_learners}
- Total Monthly Fees: R${dashboardData.total_monthly_fees.toLocaleString()}
- Outstanding Balance: R${dashboardData.outstanding_amount.toLocaleString()}

LEARNERS AND FEES:
${learnerSummary}

FEE BREAKDOWN:
- Tuition Fees: R${dashboardData.fee_breakdown.tuition_fees.toLocaleString()}
- Activity Fees: R${dashboardData.fee_breakdown.activity_fees.toLocaleString()}
- Facility Fees: R${dashboardData.fee_breakdown.facility_fees.toLocaleString()}
- Sport Fees: R${dashboardData.fee_breakdown.sport_fees.toLocaleString()}
- Other Fees: R${dashboardData.fee_breakdown.other_fees.toLocaleString()}

Answer questions based on this information. If you don't have specific information to answer a question, direct the user to contact support.`;

      interface OpenAIResponse {
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }

      const response = await axios.post<OpenAIResponse>(
        OPENAI_API_URL,
        {
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content || 'I could not generate a response.';
    } catch (err) {
      console.error('OpenAI API error:', err);
      return 'Sorry, I encountered an error processing your request. Please try again.';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const updatedHistory = [inputValue, ...searchHistory.filter(h => h !== inputValue)].slice(0, 15);
    setSearchHistory(updatedHistory);
    localStorage.setItem('ai_search_history', JSON.stringify(updatedHistory));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const aiResponse = await callOpenAI(inputValue);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickSuggestion = async (suggestion: string) => {
    setInputValue(suggestion);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const aiResponse = await callOpenAI(suggestion);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const quickSuggestions = dashboardData
    ? []
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Chat Area */}
          <div className="space-y-6">
            {/* Error State */}
            {error && (
              <Card className="bg-red-50 border-2 border-red-300 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-bold">{error}</p>
                      <Button
                        onClick={() => navigate('/parent-dashboard')}
                        size="sm"
                        className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {dataLoading ? (
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="inline-flex items-center justify-center">
                    <div className="animate-spin">
                      <Bot className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-blue-800 font-bold mt-4">Loading your billing information...</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-2 border-blue-300 shadow-xl overflow-hidden flex flex-col h-fit">
                {/* Chat Header */}
                <CardHeader className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-500 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-white/20">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-white text-2xl font-bold">AI Billing Assistant</CardTitle>
                      </div>
                      <CardDescription className="text-blue-100 font-medium">
                        Powered by GPT-3.5 Turbo • Get instant answers about your billing
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Container */}
                <div className="p-6 h-96 overflow-y-auto space-y-4 bg-gradient-to-b from-blue-50 to-white flex-1">
                  {messages.length === 1 && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center space-y-4 max-w-md">
                        <Sparkles className="w-16 h-16 text-blue-300 mx-auto" />
                        <h3 className="text-xl font-bold text-blue-900">What can I help you with?</h3>
                        <p className="text-blue-700 text-sm font-medium">Ask me about your fees, payments, learners, or any billing-related questions.</p>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2 animate-fade-in`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg group ${
                          msg.role === 'user' ? 'flex flex-col items-end' : ''
                        }`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-md ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none font-medium'
                              : 'bg-blue-100 text-blue-900 rounded-bl-none border-2 border-blue-300 font-medium'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        
                        <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          {msg.role === 'assistant' && (
                            <>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100">
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100">
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                        
                        <span className="text-xs text-blue-600 mt-1 font-medium">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start gap-2">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="bg-blue-100 text-blue-900 px-4 py-3 rounded-2xl rounded-bl-none border-2 border-blue-300 shadow-md">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestions - Only show on first message */}
                {messages.length === 1 && (
                  <div className="px-6 py-4 bg-gradient-to-b from-blue-50 to-white border-t-2 border-blue-200">
                    <p className="text-blue-900 text-xs font-bold mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Quick questions
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {quickSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickSuggestion(suggestion)}
                          className="text-left p-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 border-2 border-blue-300 hover:border-blue-500 transition text-blue-900 hover:text-blue-700 text-xs font-medium group shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span>{suggestion}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0 text-blue-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-6 bg-gradient-to-b from-blue-50 to-white border-t-2 border-blue-200">
                  <div className="flex gap-3">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      placeholder="Ask me anything about your billing..."
                      className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 text-blue-900 placeholder-blue-500 focus:border-blue-600 focus:ring-blue-600 rounded-xl font-medium shadow-sm"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl px-4 flex-shrink-0 shadow-md hover:shadow-lg transition font-bold"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mt-2 font-medium">Press Enter to send • Shift+Enter for new line</p>
                </div>
              </Card>
            )}

            {/* Back to Dashboard Button */}
            {!dataLoading && !error && (
              <div className="flex justify-center">
                <Button
                  onClick={() => navigate('/parent-dashboard')}
                  variant="outline"
                  className="border-2 border-blue-300 text-blue-700 hover:text-blue-900 hover:bg-blue-50 font-bold shadow-md"
                >
                  ← Back to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
