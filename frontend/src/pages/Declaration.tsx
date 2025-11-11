import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import ProgressSteps from '@/components/ProgressSteps';
import ProgressBar from '@/components/ProgressBar';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================



interface ConfirmationChecks {
  agree_truth: boolean;
  agree_policies: boolean;
  agree_financial: boolean;
  agree_verification: boolean;
  agree_data_processing: boolean;
}

enum AutoSaveStatus {
  Idle = 'Idle',
  Saving = 'Saving...',
  Saved = 'Auto-saved',
}

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const CONFIRMATIONS = [
  { id: 'agree_truth', label: 'I confirm that all information provided in this application is true and correct.' },
  { id: 'agree_policies', label: 'I agree to abide by the school\'s rules, policies, and code of conduct.' },
  { id: 'agree_financial', label: 'I acknowledge responsibility for all school fees as per the agreement.' },
  { id: 'agree_verification', label: 'I consent to the school verifying my information where required.' },
  { id: 'agree_data_processing', label: 'I consent to the storage and processing of my personal information.' },
] as const;

const PAYMENT_PLANS: Plan[] = [
  {
    id: 'full-payment',
    name: 'Full Payment',
    price: 'R 50,000',
    description: 'Pay full tuition upfront',
    features: ['5% discount', 'Immediate enrollment', 'Priority support'],
  },
  {
    id: 'semi-annual',
    name: 'Semi-Annual',
    price: 'R 26,000',
    description: 'Two payments per year',
    features: ['2 installments', 'Flexible schedule', 'Standard support'],
    popular: true,
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 'R 4,500',
    description: 'Monthly installments',
    features: ['12 monthly payments', 'Maximum flexibility', 'Email support'],
  },
];

type ConfirmationKeys = typeof CONFIRMATIONS[number]['id'];

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.285 2l-11.285 11.567-5.556-5.558-3.444 3.445 9 9 15-15.128z" />
  </svg>
);

// ============================================================================
// CARD COMPONENT
// ============================================================================

const Card: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <section>
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  </section>
);

// ============================================================================
// MAIN DECLARATION PAGE COMPONENT
// ============================================================================

const DeclarationPage: React.FC = () => {
  const [confirmations, setConfirmations] = useState<ConfirmationChecks>({
    agree_truth: false,
    agree_policies: false,
    agree_financial: false,
    agree_verification: false,
    agree_data_processing: false,
  });
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('semi-annual');
  const navigate = useNavigate();
  const location = useLocation();
  const incomingStudents: any[] = (location.state as any)?.students || [];
  const incomingSelectedPlan: string = (location.state as any)?.selectedPlan || '';
  const [students, setStudents] = useState<any[]>(incomingStudents);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>(AutoSaveStatus.Idle);
  const [currentTab, setCurrentTab] = useState<'declaration' | 'payment'>('declaration');

  const autoSaveTimeoutRef = useRef<number | null>(null);

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setConfirmations((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.target.value);
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showFullNameError = touched.fullName && fullName.trim().length < 3;

  const runAutoSave = useCallback(async () => {
    setAutoSaveStatus(AutoSaveStatus.Saving);
    try {
      const response = await fetch('http://localhost:5002/submit-declaration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmations,
          fullName,
          city,
          selectedPlan,
          date: today.replace(/\//g, '-'),
          status: 'in_progress',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      console.log('Data saved successfully.');
      setAutoSaveStatus(AutoSaveStatus.Saved);
    } catch (error) {
      console.error('Error saving data:', error);
      setAutoSaveStatus(AutoSaveStatus.Idle);
    } finally {
      setTimeout(() => setAutoSaveStatus(AutoSaveStatus.Idle), 2000);
    }
  }, [confirmations, fullName, city, selectedPlan, today]);

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = window.setTimeout(() => {
      runAutoSave();
    }, 1500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmations, fullName, city, selectedPlan]);

  // initialize selectedPlan and students from navigation state when present
  useEffect(() => {
    if (incomingSelectedPlan) setSelectedPlan(incomingSelectedPlan);
    if (incomingStudents && incomingStudents.length) setStudents(incomingStudents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const allChecked = Object.values(confirmations).every(Boolean);
    const isNameValid = fullName.trim().length >= 3;
    setIsContinueDisabled(!(allChecked && isNameValid && selectedPlan));
  }, [confirmations, fullName, selectedPlan]);

  const handleSaveProgress = async () => {
    console.log('Saving progress...');
    try {
      const response = await fetch('http://localhost:5002/submit-declaration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmations,
          fullName,
          city,
          selectedPlan,
          date: today.replace(/\//g, '-'),
          status: 'in_progress',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
      alert('Your progress has been saved!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

  const handleContinue = async () => {
    if (isContinueDisabled) return;

    // Navigate to review page immediately so the user proceeds regardless of network latency.
    navigate('/re-registration/review', { state: { students, selectedPlan } });

    // Submit declaration in the background (fire-and-forget). Errors are logged but do not block navigation.
    (async () => {
      try {
        const response = await fetch('http://localhost:5002/submit-declaration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            confirmations,
            fullName,
            city,
            selectedPlan,
            date: today.replace(/\//g, '-'),
            status: 'completed',
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to submit declaration');
        }
        console.log('Declaration submitted successfully (background).');
      } catch (error) {
        console.error('Error submitting declaration (background):', error);
      }
    })();
  };

  // progress steps for the left sidebar
  const steps = [
    { number: 1, title: 'Select Children', description: 'Choose students to re-register', completed: true, active: false },
    { number: 2, title: 'Update Details', description: 'Review and update information', completed: true, active: false },
    { number: 3, title: 'Choose Financing', description: 'Select a payment option', completed: true, active: false },
    { number: 4, title: 'Review & Submit', description: 'Confirm and submit', completed: false, active: true },
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
          <div className="h-fit p-6 bg-white border border-gray-200 rounded-lg">
            <h2 className="mb-6 text-lg font-semibold">Progress</h2>
            <ProgressSteps steps={steps} currentStep={4} />
            <div className="mt-6">
              <ProgressBar percentage={90} />
            </div>
          </div>

          <div className="space-y-6 w-full max-w-3xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">Declaration & Payment</h2>
              <p className="text-sm text-muted-foreground mt-2">Please read and confirm the declarations. Select payment options and sign digitally to proceed.</p>
            </div>

          {/* TAB NAVIGATION */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setCurrentTab('declaration')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                currentTab === 'declaration'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Declaration
            </button>
            <button
              onClick={() => setCurrentTab('payment')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                currentTab === 'payment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Payment Plan
            </button>
          </div>

          {/* DECLARATION TAB */}
          {currentTab === 'declaration' && (
            <div className="space-y-8">
              <Card title="Declaration Text">
                <div className="space-y-4 max-h-48 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-800">Code of Conduct Acknowledgement</h4>
                    <p>
                      By submitting this application, I acknowledge that I have read, understood, and agree to abide by
                      the school's Code of Conduct. I understand that any violation of these standards may result in
                      disciplinary action, including suspension or expulsion.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Financial Responsibility Acceptance</h4>
                    <p>
                      I acknowledge full responsibility for all school fees, charges, and associated costs as outlined
                      in the fee agreement. I understand that failure to meet payment obligations may affect my child's
                      continued enrollment at the institution.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Accuracy of Information Declaration</h4>
                    <p>
                      I declare that all information provided in this application is true, complete, and accurate to
                      the best of my knowledge. I understand that providing false or misleading information may result
                      in the rejection of this application or termination of enrollment.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Consent to Verify Information</h4>
                    <p>
                      I consent to the school verifying any information provided in this application through
                      appropriate channels, including but not limited to previous schools, employers, and reference
                      contacts.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Data Processing Consent (POPIA/GDPR Compliant)</h4>
                    <p>
                      I consent to the collection, storage, processing, and use of my personal information and that of
                      my child for the purposes of education administration, communication, and compliance with legal
                      requirements. I understand my rights regarding data protection and privacy.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">School Rules and Disciplinary Policy Agreement</h4>
                    <p>
                      I agree to support and enforce the school's rules, policies, and disciplinary procedures. I
                      understand that cooperation between home and school is essential for my child's success and the
                      wellbeing of the school community.
                    </p>
                  </div>
                </div>
                <a href="#" className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Download Full Policy (PDF)
                </a>
              </Card>

              <Card title="Required Confirmations" subtitle="All confirmations below are required to proceed">
                <div className="space-y-4">
                  {CONFIRMATIONS.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={item.id}
                        checked={confirmations[item.id as ConfirmationKeys]}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <span className="ml-3 text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </Card>

              <Card
                title="Digital Signature"
                subtitle="Your digital signature is required to complete this declaration"
              >
                <div className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name (as Digital Signature) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={handleFullNameChange}
                      onBlur={() => handleBlur('fullName')}
                      placeholder="Enter your full name"
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                        showFullNameError
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    <p className={`mt-1 text-sm ${showFullNameError ? 'text-red-600' : 'text-gray-500'}`}>
                      Minimum 3 characters required
                    </p>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      Place / City
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={handleCityChange}
                      placeholder="Enter city (optional)"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="text"
                      id="date"
                      value={today}
                      readOnly
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white sm:text-sm cursor-default"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* end DECLARATION TAB */}

          {/* PAYMENT PLAN TAB */}
          {currentTab === 'payment' && (
            <div className="space-y-8">
              <Card
                title="Select Payment Plan"
                subtitle="Choose the payment plan that works best for you. Selected plan will be highlighted in blue."
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PAYMENT_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
                        selectedPlan === plan.id
                          ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-300'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* POPULAR BADGE */}
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                            Most Popular
                          </span>
                        </div>
                      )}

                      {/* SELECTION CHECKMARK */}
                      {selectedPlan === plan.id && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-blue-600 rounded-full p-1">
                            <CheckIcon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}

                      {/* PLAN CONTENT */}
                      <div className="text-left">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h4>
                        <p className="text-3xl font-bold text-blue-600 mb-1">{plan.price}</p>
                        <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                        {/* FEATURES LIST */}
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-700">
                              <svg className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* SELECT BUTTON */}
                      <button
                        className={`mt-6 w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                          selectedPlan === plan.id
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                      </button>
                    </button>
                  ))}
                </div>

                {/* SELECTED PLAN SUMMARY */}
                {selectedPlan && (
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Your Selection:</h4>
                    <p className="text-gray-700">
                      <span className="font-medium text-blue-600">
                        {PAYMENT_PLANS.find((p) => p.id === selectedPlan)?.name}
                      </span>
                      {' — '}
                      {PAYMENT_PLANS.find((p) => p.id === selectedPlan)?.description}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      {PAYMENT_PLANS.find((p) => p.id === selectedPlan)?.price}
                    </p>
                  </div>
                )}
              </Card>

              <Card title="Payment Terms">
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>First Payment:</strong> Due upon enrollment confirmation
                  </p>
                  <p>
                    <strong>Subsequent Payments:</strong> As per selected plan schedule
                  </p>
                  <p>
                    <strong>Payment Methods:</strong> Bank transfer, Credit card, or Check
                  </p>
                  <p>
                    <strong>Late Payment Policy:</strong> A 2% monthly interest charge applies to overdue payments
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* FOOTER */}
          <footer className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <ArrowLeftIcon className="w-5 h-5 mr-2 transform -translate-x-1" />
              Back
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 transition-opacity duration-300">
                {autoSaveStatus !== AutoSaveStatus.Idle && autoSaveStatus}
              </span>
              <button
                onClick={handleSaveProgress}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Progress
              </button>
              <button
                onClick={handleContinue}
                disabled={isContinueDisabled}
                className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue
                <ArrowRightIcon className="w-5 h-5 ml-2 transform translate-x-1" />
              </button>
            </div>
          </footer>
        </div>
      </div>
      </main>
    </div>
  );
};

export default DeclarationPage;
