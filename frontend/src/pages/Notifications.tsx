import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
  id: string;
  type: "status" | "document" | "deadline" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  studentName?: string;
}

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "status",
      title: "Application Status Update",
      message: "Junior's application has been moved to school review stage",
      timestamp: "Today at 2:30 PM",
      read: false,
      studentName: "Junior Ndzhobela",
    },
    {
      id: "2",
      type: "document",
      title: "Missing Document Alert",
      message: "Transfer letter is still missing for Thandi's application",
      timestamp: "Today at 10:15 AM",
      read: false,
      studentName: "Thandi Ndzhobela",
    },
    {
      id: "3",
      type: "deadline",
      title: "Re-registration Deadline",
      message: "Re-registration window closes in 5 days (March 30, 2024)",
      timestamp: "Yesterday at 4:00 PM",
      read: true,
    },
    {
      id: "4",
      type: "status",
      title: "Admission Accepted",
      message: "Great news! Junior has been accepted for Grade 8",
      timestamp: "2 days ago",
      read: true,
      studentName: "Junior Ndzhobela",
    },
    {
      id: "5",
      type: "system",
      title: "System Maintenance",
      message: "The portal will be under maintenance on Sunday 2-4 PM",
      timestamp: "3 days ago",
      read: true,
    },
    {
      id: "6",
      type: "document",
      title: "Document Verified",
      message: "Birth certificate has been verified successfully",
      timestamp: "4 days ago",
      read: true,
      studentName: "Junior Ndzhobela",
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "status":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "document":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "deadline":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "system":
        return <Info className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "status":
        return "bg-blue-50 border-blue-200";
      case "document":
        return "bg-yellow-50 border-yellow-200";
      case "deadline":
        return "bg-red-50 border-red-200";
      case "system":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/parent-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with application status, document alerts, and important deadlines
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* UNREAD TAB */}
          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-muted-foreground mt-2">You have no unread notifications</p>
              </Card>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                </div>
                {unreadNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getNotificationColor(notification.type)}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notification.title}</p>
                          {notification.studentName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Student: {notification.studentName}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 mt-2">{notification.message}</p>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* ALL NOTIFICATIONS TAB */}
          <TabsContent value="all" className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium">No notifications yet</p>
              </Card>
            ) : (
              <>
                {unreadNotifications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Unread</h3>
                    <div className="space-y-3">
                      {unreadNotifications.map((notification) => (
                        <Card
                          key={notification.id}
                          className={`border-l-4 ${getNotificationColor(notification.type)}`}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{notification.title}</p>
                                {notification.studentName && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Student: {notification.studentName}
                                  </p>
                                )}
                                <p className="text-sm text-gray-700 mt-2">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-3">{notification.timestamp}</p>
                              </div>
                              <Badge className="ml-2">New</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {readNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Earlier</h3>
                    <div className="space-y-3">
                      {readNotifications.map((notification) => (
                        <Card
                          key={notification.id}
                          className="border-l-4 bg-gray-50 border-gray-200"
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-600">{notification.title}</p>
                                {notification.studentName && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Student: {notification.studentName}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 mt-2">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-3">{notification.timestamp}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Application Status Updates", description: "Get notified when application status changes" },
                  { label: "Document Alerts", description: "Receive alerts for missing or pending documents" },
                  { label: "Deadline Reminders", description: "Get reminded about important deadlines" },
                  { label: "Re-registration Notifications", description: "Updates about re-registration windows" },
                  { label: "System Messages", description: "Important system announcements and maintenance alerts" },
                ].map((pref, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-sm">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                ))}
                <Button className="w-full mt-4">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Notifications;
