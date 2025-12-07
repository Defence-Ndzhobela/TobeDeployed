import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface RequestStatementModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RequestStatement = ({ open = true, onOpenChange }: RequestStatementModalProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else if (!newOpen) {
      // If no callback provided, navigate back to parent dashboard
      navigate("/parent-dashboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Request Submitted</DialogTitle>
          <DialogDescription className="text-center">
            Statement request confirmation
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Success Icon */}
          <div className="p-6 bg-green-100 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Your Request Submitted
            </h2>
            <p className="text-base text-slate-600">
              Your request has been submitted to the administrator for processing
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => handleOpenChange(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestStatement;
