import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, FileUp, Edit2, Save, Users, CheckCircle2, Clock } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ParentProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    idNumber: "9012345678901",
    phone: "+27 82 123 4567",
    email: "john@example.com",
    address: "123 Main Street, Johannesburg, South Africa",
    city: "Johannesburg",
    province: "Gauteng",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save to backend
    console.log("Profile updated:", formData);
  };

  const initials = formData.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/parent-dashboard")}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 bg-blue-900 border-4 border-white text-white text-2xl font-bold flex items-center justify-center">
                  <AvatarFallback className="bg-blue-900 text-white">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{formData.fullName}</h1>
                  <p className="text-blue-100 mt-1">ID: {formData.idNumber}</p>
                  <Badge className="mt-3 bg-green-500 text-white">Verified Account</Badge>
                </div>
              </div>
              <Button
                size="lg"
                className={cn(
                  "gap-2 font-semibold",
                  isEditing
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-white text-blue-600 hover:bg-gray-100"
                )}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your profile details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-semibold">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="idNumber" className="font-semibold">ID Number</Label>
                        <Input
                          id="idNumber"
                          type="text"
                          name="idNumber"
                          value={formData.idNumber}
                          disabled
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-sm text-foreground font-semibold">{formData.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Phone</p>
                          <p className="text-sm text-foreground font-semibold">{formData.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <CardTitle>Address Information</CardTitle>
                    <CardDescription>Your residential address</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="font-semibold">Street Address</Label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border rounded-lg px-3 py-2 bg-white text-foreground"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="font-semibold">City</Label>
                        <Input
                          id="city"
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province" className="font-semibold">Province</Label>
                        <Input
                          id="province"
                          type="text"
                          name="province"
                          value={formData.province}
                          onChange={handleChange}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Address</p>
                    <p className="font-semibold text-foreground">{formData.address}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.city}, {formData.province}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proof of Residence */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b">
                <div className="flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-amber-600" />
                  <div>
                    <CardTitle>Proof of Residence</CardTitle>
                    <CardDescription>Upload or update your proof of residence</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors bg-gray-50">
                  <FileUp className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-semibold text-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                </div>
                <div className="border rounded-lg p-4 flex items-start justify-between bg-gradient-to-r from-green-50 to-emerald-50">
                  <div>
                    <p className="font-semibold text-sm text-foreground">proof_of_residence.pdf</p>
                    <p className="text-xs text-muted-foreground">Uploaded 5 days ago</p>
                  </div>
                  <Badge className="bg-green-600 text-white gap-1 flex items-center">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Active Students</p>
                    <p className="text-2xl font-bold text-foreground">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Accepted</p>
                    <p className="text-2xl font-bold text-foreground">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-foreground">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Account Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Documents Verified</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentProfile;
