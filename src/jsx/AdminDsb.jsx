import React, { useState, useEffect } from "react";
import { Home, Users, BarChart3, FileText, LogOut } from "lucide-react";
import {
  useNavigate,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  get,
  child,
  remove,
  onValue,
} from "firebase/database";
import { TournamentService } from "./api/TournamentService.jsx";
import logo from "../image/tpchitam.png";
// Import komponen-komponen
import Result from "./admin/Result.jsx";
import Dashboard from "./admin/Dashboards.jsx";
import UsersManagement from "./admin/UsersManagement.jsx";
import TournamentsManagement from "./admin/TournamentsManagement.jsx";
import DefaultPage from "./admin/Default.jsx";
import Modal from "./admin/Modal.jsx";

const startggKey = import.meta.env.VITE_STARTGG_KEY;

// Firebase config
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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const AdminDsb = () => {
  const [eventIdInput, setEventIdInput] = useState("");
  const [submittedEventId, setSubmittedEventId] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [savedResultIds, setSavedResultIds] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [slugInput, setSlugInput] = useState("");
  const [kategori, setKategori] = useState("1");
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const tournamentService = new TournamentService(database, startggKey);
  const navigate = useNavigate();
  const location = useLocation();

  const loadTournaments = async () => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, "tournaments"));
    if (snapshot.exists()) {
      const tournamentsData = snapshot.val();
      setTournaments(Object.values(tournamentsData));
    }
  };

  useEffect(() => {
    const loadSessionAndData = async () => {
      const authUser = sessionStorage.getItem("authUser");
      if (authUser) {
        setUser(JSON.parse(authUser));
        const snapshot = await get(child(ref(database), "users"));
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usersArray = Object.keys(usersData).map((key) => ({
            users_id: key,
            ...usersData[key],
          }));
          setUsers(usersArray);
        }
      }
    };
    const resultRef = ref(database, "results");
    const unsubscribe = onValue(resultRef, (snapshot) => {
      const data = snapshot.val();
      setSavedResultIds(data ? Object.keys(data) : []);
    });

    loadSessionAndData();
    loadTournaments();

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    window.location.href = "/";
  };

  const handleAddTournament = async (e) => {
    e.preventDefault();
    if (!slugInput.trim()) return;
    setLoading(true);
    try {
      const newTournament = await tournamentService.addTournament(
        slugInput,
        kategori
      );
      setSlugInput("");
      setKategori("1");
      alert("Tournament added successfully!");
      await loadTournaments(); // ✅ refresh data dari database
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (eventId) => {
  const db = getDatabase();
  if (window.confirm("Are you sure you want to delete this tournament and its results?")) {
    try {
      await remove(ref(db, `tournaments/${eventId}`));
      await remove(ref(db, `results/${eventId}`));
      alert("Tournament and its results deleted successfully!");
      await loadTournaments(); // ✅ refresh data dari database
      window.location.reload();
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  }
};

  if (!user || user.role !== "admin") {
    return (
      <div className="text-white bg-black h-screen flex items-center justify-center">
        <p>Access denied.</p>
      </div>
    );
  }

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: Home },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/tournaments", label: "Tournaments", icon: BarChart3 },
    { path: "/admin/results", label: "Results", icon: FileText },
    { path: "/admin/leaderboards", label: "Leaderboards", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-gray-800">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-red-600 p-2 rounded"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 bg-gray-800 w-64 flex flex-col
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:flex
          border-r border-gray-700
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-around items-center">
            <img src={logo} alt="Logo" className="size-20" />
            <button
              className="md:hidden text-white text-xl hover:text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                  transition-all duration-200 group
                  ${
                    location.pathname === item.path
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                `}
              >
                <item.icon
                  size={20}
                  className={`
                    ${
                      location.pathname === item.path
                        ? "text-white"
                        : "text-gray-400 group-hover:text-white"
                    }
                  `}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-black overflow-auto">
        <div className="p-8 pt-16 md:pt-8">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  user={user}
                  users={users}
                  tournaments={tournaments}
                />
              }
            />
            <Route path="users" element={<UsersManagement users={users} />} />
            <Route
              path="tournaments"
              element={
                <TournamentsManagement
                  tournaments={tournaments}
                  slugInput={slugInput}
                  setSlugInput={setSlugInput}
                  kategori={kategori}
                  setKategori={setKategori}
                  loading={loading}
                  handleAddTournament={handleAddTournament}
                  handleDeleteTournament={handleDeleteTournament}
                  setShowModal={setShowModal}
                />
              }
            />
            <Route path="results" element={<Result />} />
            <Route
              path="leaderboards"
              element={<DefaultPage currentPage="leaderboards" />}
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>

          {/* Modal */}
          <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            eventIdInput={eventIdInput}
            setEventIdInput={setEventIdInput}
            setSelectedEventId={setSelectedEventId}
            setSubmittedEventId={setSubmittedEventId}
            submittedEventId={submittedEventId}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminDsb;
