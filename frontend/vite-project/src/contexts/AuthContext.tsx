import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getApiUrl } from "@/config/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const response = await fetch(getApiUrl("/account/authenticated"), {
        method: "POST",
        credentials: "include", // Important: include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated === true);
        
        // Fetch username if authenticated
        if (data.authenticated) {
          try {
            const profileResponse = await fetch(getApiUrl("/api/profile/me/"), {
              credentials: "include",
            });
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setUsername(profileData.username);
            }
          } catch (err) {
            console.error("Failed to fetch username:", err);
          }
        }
      } else if (response.status === 401) {
        // 401 means not authenticated - this is expected, not an error
        setIsAuthenticated(false);
        setUsername(null);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUsername(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    await checkAuth();
  };

  const logout = async () => {
    try {
      const response = await fetch(getApiUrl("/account/logout"), {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUsername(null);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, username, login, logout, checkAuth, setAuthenticated: setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
