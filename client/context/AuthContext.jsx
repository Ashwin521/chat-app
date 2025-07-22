/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Attach token to axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Check auth on mount
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        setAuthUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
      toast.error(error?.response?.data?.message || error.message);
      setAuthUser(null);
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`; 
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    if (socket) socket.disconnect();
    toast.success("Logged out successfully");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  };

  return (
    <AuthContext.Provider
      value={{
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
