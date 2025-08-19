import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, user: any, rememberMe: boolean) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;

  // Auto-login effect: check token from storage, verify it, set user
  useEffect(() => {
    console.log("AuthContext: useEffect running");
    const verifyToken = async () => {
      const storedToken =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

      if (!storedToken) {
        console.log("AuthContext: No stored token found.");
        setLoading(false);
        return;
      }

      try {
        console.log("AuthContext: Verifying token with backend.");
        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!response.ok) throw new Error("Failed to verify token");

        const data = await response.json();
        console.log("AuthContext: Token verification response data:", data);

        if (data.user) {
          setToken(storedToken);
          setUser({
            ...data.user,
            department: data.user.department || null,
          });
          console.log("AuthContext: User set:", data.user);
          // Redirect if currently on login page
          if (window.location.pathname === "/login") {
            redirectUser(data.user.user_type);
          }
        } else if (storedUser) {
          // Fallback to stored user data if API doesn't return user
          console.log("AuthContext: Using stored user data");
          setUser(JSON.parse(storedUser));
        } else {
          console.log("AuthContext: No user data available.");
          clearAuth();
        }
      } catch (error) {
        console.error("AuthContext: Token verification failed:", error);
        clearAuth();
      } finally {
        setLoading(false);
        console.log("AuthContext: Loading set to false.");
      }
    };

    verifyToken();
  }, [baseUrl, navigate]);

  const redirectUser = (userType: string) => {
    switch (userType) {
      case "ADMIN":
        navigate("/AdminDashboard");
        break;
      case "HEAD":
        navigate("/HeadDashboard");
        break;
      case "STAFF":
        navigate("/StaffDashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  const login = (newToken: string, userData: any, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("authToken", newToken);
    storage.setItem("user", JSON.stringify(userData));
    
    setToken(newToken);
    setUser({
      ...userData,
      department: userData.department || null,
    });
    console.log("AuthContext: User logged in, data:", userData);
    redirectUser(userData.user_type);
  };

  const logout = () => {
    console.log("AuthContext: Logging out.");
    clearAuth();
    navigate("/login");
  };

  const clearAuth = () => {
    console.log("AuthContext: Clearing auth data.");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);