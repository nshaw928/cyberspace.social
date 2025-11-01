import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Users, Settings, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  centerContent?: string;
  rightAction?: ReactNode;
}

export default function Layout({ children, centerContent, rightAction }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isFriendsPage = location.pathname === "/friends";
  const isSettingsPage = location.pathname === "/settings";
  const isProfilePage = location.pathname === "/profile" || location.pathname.startsWith("/profile/");

  // Determine what to show in the center of the top bar
  const getTopBarCenter = () => {
    // If custom centerContent is provided, use it
    if (centerContent !== undefined) {
      return centerContent;
    }
    
    if (isProfilePage || isSettingsPage) {
      return username || "Loading...";
    }
    return "cyberspace.social";
  };

  // Determine what to show on the right of the top bar
  const getTopBarRight = () => {
    // If custom rightAction is provided, use it
    if (rightAction !== undefined) {
      return rightAction;
    }
    
    if (isFriendsPage) {
      // Show X icon to go back to feed
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/feed")}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </Button>
      );
    } else if (isSettingsPage) {
      // Show X icon to go back to profile
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </Button>
      );
    } else if (isProfilePage) {
      // Show Settings icon
      return (
        <Link to="/settings" className="p-2 hover:bg-accent rounded-md transition-colors block">
          <Settings className="w-5 h-5 text-foreground" />
        </Link>
      );
    } else {
      // Default: Show Friends icon (for feed page)
      return (
        <Link to="/friends" className="p-2 hover:bg-accent rounded-md transition-colors block">
          <Users className="w-5 h-5 text-foreground" />
        </Link>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex flex-col md:flex-row">
      {/* Top Bar - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4 md:left-64">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-md" />
        </div>

        {/* Center Content - Dynamic based on page */}
        <div className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground">
          {getTopBarCenter()}
        </div>

        {/* Right Content - Dynamic based on page */}
        {getTopBarRight()}
      </header>

      {/* Side Navigation - Desktop only */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 md:flex md:flex-col md:border-r md:border-border md:bg-card">
        <div className="h-14 border-b border-border" /> {/* Spacer for top bar */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/feed"
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive("/feed")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home Feed</span>
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive("/profile")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-16 md:pb-0 md:ml-64">
        <div className="container mx-auto max-w-2xl px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50">
        <Link
          to="/feed"
          className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${
            isActive("/feed") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="w-6 h-6" />
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${
            isActive("/profile") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="w-6 h-6" />
        </Link>
      </nav>
    </div>
  );
}
