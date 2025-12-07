import { CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface BankAccountDetails {
  account_holder_name: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  branch_code: string;
}

interface BankAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankDetails: BankAccountDetails;
  learnerName?: string;
  monthlyFee?: number;
}

const BankAccountModal = ({
  open,
  onOpenChange,
  bankDetails,
  learnerName = "Student",
  monthlyFee = 0,
}: BankAccountModalProps) => {
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  
  // Helper to mask account number for display
  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    const last4 = accountNumber.slice(-4);
    return `****${last4}`;
  };

  // Check if bank details are empty/not provided
  const hasEmptyDetails = !bankDetails.account_holder_name || 
                          !bankDetails.bank_name || 
                          !bankDetails.account_number || 
                          !bankDetails.branch_code;

  // Handle modal close and reset state
  const handleModalClose = (open: boolean) => {
    setPaymentProcessed(false);
    onOpenChange(open);
  };

  // Auto-close modal after payment is processed
  useEffect(() => {
    if (paymentProcessed) {
      // Show success message for 2 seconds, then close modal and return to dashboard
      const timer = setTimeout(() => {
        handleModalClose(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [paymentProcessed]);

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 -mx-6 -mt-6 px-6 py-6 mb-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Bank Account Details</h2>
              <p className="text-blue-100 text-sm mt-1">Required for Netcash debit order mandate creation</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Information Alert */}
          <Alert className="border-blue-300 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Your bank account details will be securely stored and used only for creating a debit order mandate for your school fees.
            </AlertDescription>
          </Alert>

          {/* Warning if bank details are not provided */}
          {hasEmptyDetails && (
            <Alert className="border-orange-300 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                <strong>Bank details not yet provided.</strong> Please go to the "Update Details" page to add your bank account information before proceeding with payment.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Information */}
          {learnerName && monthlyFee > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-amber-700">Learner Name</p>
                  <p className="text-lg font-bold text-amber-900 mt-1">{learnerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700">Monthly Payment</p>
                  <p className="text-lg font-bold text-amber-900 mt-1">R {monthlyFee.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Account Details Display */}
          <div className="space-y-4">
            {/* Account Holder Name */}
            <div className="grid grid-cols-3 gap-4 items-center pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Holder Name</p>
              </div>
              <div className="col-span-2">
                <p className="text-lg font-semibold text-gray-900">{bankDetails.account_holder_name || "Not provided"}</p>
              </div>
            </div>

            {/* Bank Name */}
            <div className="grid grid-cols-3 gap-4 items-center pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Bank Name</p>
              </div>
              <div className="col-span-2">
                <p className="text-lg font-semibold text-gray-900">{bankDetails.bank_name || "Not provided"}</p>
              </div>
            </div>

            {/* Account Type */}
            <div className="grid grid-cols-3 gap-4 items-center pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Type</p>
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {bankDetails.account_type || "Not provided"}
                </Badge>
              </div>
            </div>

            {/* Account Number */}
            <div className="grid grid-cols-3 gap-4 items-center pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Number</p>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-2 rounded">
                    {maskAccountNumber(bankDetails.account_number) || "Not provided"}
                  </code>
                </div>
              </div>
            </div>

            {/* Branch Code */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Branch Code</p>
              </div>
              <div className="col-span-2">
                <code className="text-lg font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-2 rounded">
                  {bankDetails.branch_code || "Not provided"}
                </code>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-2">Debit Order Setup</p>
            <div className="flex gap-2 items-center">
              <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
              <p className="text-sm text-gray-600">Your bank details are ready for debit order mandate creation</p>
            </div>
          </div>

          {/* Success Message */}
          {paymentProcessed && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-300 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-900 font-semibold">Payment Setup Confirmed ✓</p>
                <p className="text-sm text-green-700 mt-1">Your debit order mandate is being created. You will receive confirmation via email.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleModalClose(false)}
            >
              Close
            </Button>
            {!paymentProcessed ? (
              <Button
                size="lg"
                disabled={hasEmptyDetails}
                className={hasEmptyDetails ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                onClick={() => {
                  if (!hasEmptyDetails) {
                    // Simulate payment processing
                    setPaymentProcessed(true);
                  }
                }}
                title={hasEmptyDetails ? 'Please complete bank details in Update Details page first' : 'Proceed to payment'}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Payment
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Payment Confirmed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountModal;
