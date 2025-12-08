import { Bell, BookOpen, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/apiConfig";

const APP_URL = import.meta.env.VITE_APP_URL || 'https://knitcash-t2h7.onrender.com/';

interface HeaderProps {
  showNotifications?: boolean;
}

interface UserInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const Header = ({ showNotifications = true }: HeaderProps) => {
  const [userName, setUserName] = useState("Parent");
  const [userRole, setUserRole] = useState("Parent Account");
  const [userInitials, setUserInitials] = useState("PA");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        console.log("🔍 Header: user_id from localStorage:", userId);

        if (!userId) {
          console.warn("⚠️ Header: No user_id found in localStorage");
          return;
        }

        console.log(`📍 Header: Fetching user info from /api/user/${userId}`);
        const response = await fetch(`${API_BASE_URL}/user/${userId}`);
        console.log("📡 Header: Response status:", response.status);

        if (!response.ok) {
          console.warn("⚠️ Header: API response not OK:", response.status, response.statusText);
          return;
        }

        const userData: UserInfo = await response.json();
        console.log("📦 Header: API response data:", JSON.stringify(userData, null, 2));

        if (userData.full_name) {
          console.log("✅ Header: Setting user name to:", userData.full_name);
          setUserName(userData.full_name);
          localStorage.setItem("parent_name", userData.full_name);

          // Generate initials from full_name
          const initials = userData.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          setUserInitials(initials);

          // Set role based on role from database
          if (userData.role) {
            const roleDisplay = userData.role.charAt(0).toUpperCase() + userData.role.slice(1) + " Account";
            setUserRole(roleDisplay);
          }
        } else {
          console.warn("⚠️ Header: No full_name in response data. Full response:", userData);
        }
      } catch (error) {
        console.error("❌ Header: Error fetching user info:", error);

        // Fallback: Get parent info from localStorage
        const name = localStorage.getItem("parent_name");
        if (name) {
          console.log("📝 Header: Using fallback parent_name from localStorage:", name);
          setUserName(name);

          const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          setUserInitials(initials);
        }
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Knit Edu</h1>
            <p className="text-sm text-muted-foreground">Parent Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showNotifications && (
            <button className="rounded-full p-2 hover:bg-muted">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => window.location.href = APP_URL}
            className="rounded-full p-2 hover:bg-red-100 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-red-600" />
          </button>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
