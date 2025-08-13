import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { BarChart3, Users, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Home = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    const db = getDatabase();
    const leaderboardRef = ref(db, "leaderboard");

    onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([name, values]) => ({
          name,
          totalPoints: values.totalPoints || 0,
        }));
        // Sort descending
        formatted.sort((a, b) => b.totalPoints - a.totalPoints);
        setLeaderboardData(formatted);
      }
    });
  }, []);

  const pageCount = Math.ceil(leaderboardData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedData = leaderboardData.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-white text-5xl font-bold mb-4">
          Welcome to Tournament Portal
        </h1>
        <p className="text-gray-400 text-xl">
          Your gateway to competitive gaming tournaments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <BarChart3 size={48} className="mx-auto" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Live Tournaments
          </h3>
          <p className="text-gray-400">
            Join active tournaments and compete with players worldwide
          </p>
        </div>

        <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <Users size={48} className="mx-auto" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Community
          </h3>
          <p className="text-gray-400">
            Connect with gamers and build your network
          </p>
        </div>

        <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <Star size={48} className="mx-auto" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Rankings
          </h3>
          <p className="text-gray-400">
            Track your progress and climb the leaderboards
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-8 mb-12">
        <h2 className="text-white text-2xl font-bold mb-4">Leaderboard</h2>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={pagedData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" stroke="#ccc" />
            <YAxis type="category" dataKey="name" stroke="#ccc" width={150} />
            <Tooltip />
            <Bar dataKey="totalPoints" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 mx-1 rounded text-sm font-medium ${
                page === currentPage
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-8">
        <h2 className="text-white text-2xl font-bold mb-4">Latest News</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-white font-semibold">Tournament Season 2 Begins!</h3>
            <p className="text-gray-400 text-sm">
              Registration is now open for the upcoming season
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-white font-semibold">New Gaming Categories Added</h3>
            <p className="text-gray-400 text-sm">
              Explore new competitive gaming options
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
