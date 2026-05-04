import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

export const AuthContext = createContext();

axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= CHECK AUTH =================
  const checkAuth = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.AUTH_ME);
      setUser(res.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // ================= LOGIN =================
  const login = async (email, password) => {
  try {
    const res = await axios.post(API_ENDPOINTS.AUTH_LOGIN, {
      email,
      password,
    });

    setUser(res.data.user);

    return {
      success: true,
      user: res.data.user,
    };

  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};


  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await axios.post(API_ENDPOINTS.AUTH_LOGOUT);
      setUser(null);
    } catch (error) {
      console.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}