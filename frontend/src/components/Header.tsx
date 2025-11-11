import { Bell, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

interface HeaderProps {
  showNotifications?: boolean;
}

const Header = ({ showNotifications = true }: HeaderProps) => {
  const [userName, setUserName] = useState("Parent");
  const [userRole, setUserRole] = useState("Parent Account");
  const [userInitials, setUserInitials] = useState("PA");

  useEffect(() => {
    // Get parent info from localStorage
    const name = localStorage.getItem("parent_name");
    if (name) {
      setUserName(name);

      // Generate initials from name
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      setUserInitials(initials);
    }
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
