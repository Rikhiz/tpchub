import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { X, Eye, EyeOff, LogOut, Menu } from "lucide-react";

// Firebase imports
import { initializeApp } from "firebase/app";
import logo from "../image/test.png";
import { getDatabase, ref, get, child } from "firebase/database";

// Import components
import Home from "./pages/Home.jsx";
import Tournaments from "./pages/Tournaments.jsx";
import Profile from "./pages/Profile.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA6T_1HB321Mhlb9u196VFh81-BzQD7tk",
  authDomain: "tpcdb-3b71a.firebaseapp.com",
  databaseURL:
    "https://tpcdb-3b71a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tpcdb-3b71a",
  storageBucket: "tpcdb-3b71a.firebasestorage.app",
  messagingSenderId: "767051378134",
  appId: "1:767051378134:web:4ad764d0a95f0f8b37c877",
  measurementId: "G-R562LNDKG0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState("anonymous");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Session storage in memory
  const [sessionData, setSessionData] = useState({
    authUser: null,
    authToken: null,
  });

  // Firebase authentication functions
  const firebaseAuth = {
    fetchUsers: async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "users"));
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usersArray = Object.keys(usersData).map((key) => ({
            users_id: key,
            ...usersData[key],
          }));
          return usersArray;
        } else {
          console.log("No data available");
          return [];
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },

    signIn: async (email, password) => {
      try {
        const users = await firebaseAuth.fetchUsers();
        const user = users.find(
          (u) => u.u_email === email && u.u_pass === password
        );

        if (user) {
          const userData = {
            uid: user.users_id,
            email: user.u_email,
            displayName: user.u_name,
            role: user.u_role,
          };

          setSessionData({
            authUser: userData,
            authToken: "firebase-token-" + Date.now(),
          });

          return userData;
        } else {
          throw new Error("Invalid email or password");
        }
      } catch (error) {
        throw error;
      }
    },

    signOut: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setSessionData({
            authUser: null,
            authToken: null,
          });
          resolve();
        }, 300);
      });
    },

    getCurrentUser: () => {
      try {
        if (sessionData.authUser && sessionData.authToken) {
          return sessionData.authUser;
        }
        return null;
      } catch (error) {
        console.error("Error getting current user:", error);
        return null;
      }
    },
  };

  // Load users and check session on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const usersData = await firebaseAuth.fetchUsers();
        setUsers(usersData);

        const currentUser = firebaseAuth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setUserRole(currentUser.role);
        } else {
          setUserRole("anonymous");
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [sessionData]);

  // Handle login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const userData = await firebaseAuth.signIn(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      setUserRole(userData.role);
      setEmail("");
      setPassword("");
      setShowLoginModal(false);
      sessionStorage.setItem("authUser", JSON.stringify(userData));

      if (userData.role === "admin") {
        window.location.reload();
      } else {
        navigate("/");
      }
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setUserRole("anonymous");
      sessionStorage.removeItem("authUser");
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle navigation with mobile menu close
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-500 text-lg">Loading Firebase data...</div>
      </div>
    );
  }

  // Anonymous Navbar Component
  const AnonymousNavbar = () => (
    <nav className="bg-zinc-950">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleNavigation("/")}
            className="text-white hover:text-red-500 transition-colors"
          >
            <img src={logo} alt="Logo" className="size-20" />
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => handleNavigation("/leaderboards")}
            className="text-xl text-white hover:text-red-500 transition-colors font-sans"
          >
            LEADERBOARD
          </button>
          <button
            onClick={() => handleNavigation("/tournaments")}
            className="text-white hover:text-red-500 transition-colors font-sans text-xl"
          >
            TOURNAMENTS
          </button>
          <button
            onClick={() => handleNavigation("/gallery")}
            className="text-white hover:text-red-500 transition-colors font-sans text-xl"
          >
            GALLERY
          </button>
          <button
            onClick={() => handleNavigation("/about")}
            className="text-white hover:text-red-500 transition-colors font-sans text-xl"
          >
            ABOUT
          </button>
        </div>

        {/* Desktop Sign In Button */}
        <button
          onClick={() => setShowLoginModal(true)}
          className="hidden md:block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Sign In
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white hover:text-red-500 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-gray-700">
          <div className="px-4 py-2 space-y-2">
            <button
              onClick={() => handleNavigation("/leaderboards")}
              className="block w-full text-left text-white hover:text-red-500 transition-colors font-sans text-lg py-2 border-b border-gray-700"
            >
              LEADERBOARD
            </button>
            <button
              onClick={() => handleNavigation("/tournaments")}
              className="block w-full text-left text-white hover:text-red-500 transition-colors font-sans text-lg py-2 border-b border-gray-700"
            >
              TOURNAMENTS
            </button>
            <button
              onClick={() => handleNavigation("/gallery")}
              className="block w-full text-left text-white hover:text-red-500 transition-colors font-sans text-lg py-2 border-b border-gray-700"
            >
              GALLERY
            </button>
            <button
              onClick={() => handleNavigation("/about")}
              className="block w-full text-left text-white hover:text-red-500 transition-colors font-sans text-lg py-2 border-b border-gray-700"
            >
              ABOUT
            </button>
            <button
              onClick={() => {
                setShowLoginModal(true);
                setIsMobileMenuOpen(false);
              }}
              className="block w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mt-4"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  // Player Navbar Component
  const PlayerNavbar = () => (
    <nav className="bg-gray-900 border-b-2 border-red-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Logo" className="size-24" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => handleNavigation("/leaderboards")}
            className="text-xl text-white hover:text-red-500 transition-colors font-sans"
          >
            LEADERBOARD
          </button>
          <button
            onClick={() => handleNavigation("/tournaments")}
            className="text-white hover:text-red-500 transition-colors font-sans text-xl"
          >
            TOURNAMENTS
          </button>
          <button
            onClick={() => handleNavigation("/gallery")}
            className="text-white hover:text-red-500 transition-colors font-sans text-xl"
          >
            GALLERY
          </button>
          <button
            onClick={() => handleNavigation("/about")}
            className="text-white hover:text-red-500 transition-colors font-sans text-xl"
          >
            ABOUT
          </button>
        </div>

        {/* Desktop User Info & Logout */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-white text-sm">
            Welcome, {user?.displayName}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white hover:text-red-500 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 py-2 space-y-2">
            <div className="text-white text-sm py-2 border-b border-gray-700">
              Welcome, {user?.displayName}
            </div>
            <button
              onClick={() => handleNavigation("/leaderboards")}
              className="block w-full text-left text-white hover:text-red-500 transition-colors font-sans text-lg py-2 border-b border-gray-700"
            >
              LEADERBOARD
            </button>
            <button
              onClick={() => handleNavigation("/tournaments")}
              className="block w-full text-left text-white hover:text-red-500 transition-colors font-sans text-lg py-2 border-b border-gray-700"
            >
              TOURNAMENTS
            </button>
            <button
              onClick={() => handleNavigation("/gallery")}
              className="block w-full text-left text-white hover:text-red-500 transition-colors font-sans text-lg py-2 border-b border-gray-700"
            >
              GALLERY
            </button>
            <button
              onClick={() => handleNavigation("/about")}
              className="block w-full text-left text-white hover:text-red-500 transition-colors font-sans text-lg py-2 border-b border-gray-700"
            >
              ABOUT
            </button>
            <button
              onClick={handleLogout}
              className="block w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center gap-2 mt-4"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  // Login Modal Component
  const LoginModal = () =>
    showLoginModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 border-2 border-red-500 rounded-xl p-8 w-96 max-w-[90vw]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-bold">Login</h2>
            <button
              onClick={() => setShowLoginModal(false)}
              className="text-white hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="Admin Logo"
              style={{ width: "100px", height: "auto" }}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-gray-800 border rounded-md p-3 text-white text-base outline-none transition-colors ${
                  email ? "border-red-500" : "border-gray-600"
                } focus:border-red-500`}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-gray-800 border rounded-md p-3 pr-10 text-white text-base outline-none transition-colors w-full ${
                    password ? "border-red-500" : "border-gray-600"
                  } focus:border-red-500`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="text-red-500 text-sm text-center bg-red-900 bg-opacity-30 border border-red-500 rounded-md p-2">
                {loginError}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`border-none rounded-md p-3 text-base font-semibold cursor-pointer transition-colors ${
                isLoggingIn
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-800 rounded-md">
            <p className="text-gray-400 text-sm mb-2">Available Accounts:</p>
            {users.length > 0 ? (
              users.map((u, index) => (
                <p key={index} className="text-white text-xs my-1">
                  {u.u_role}: {u.u_email} / {u.u_pass}
                </p>
              ))
            ) : (
              <p className="text-white text-xs my-1">
                Loading user accounts...
              </p>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black">
      {userRole === "player" ? <PlayerNavbar /> : <AnonymousNavbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {userRole === "player" && (
          <Route path="/profile" element={<Profile user={user} />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LoginModal />
    </div>
  );
};

export default App;