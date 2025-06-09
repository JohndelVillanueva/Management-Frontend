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
    const verifyToken = async () => {
      const storedToken =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!response.ok) throw new Error("Failed to verify token");

        const data = await response.json();

        if (data.user) {
          setToken(storedToken);
          setUser(data.user);
          // Redirect if currently on login page
          if (window.location.pathname === "/login") {
            redirectUser(data.user.user_type);
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

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
    if (rememberMe) {
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("authToken", newToken);
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
    setToken(newToken);
    setUser(userData);
    redirectUser(userData.user_type);
  };

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  const clearAuth = () => {
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
