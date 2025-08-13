import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import TournamentsTab from "./TournamentTab.jsx";
import ResultsTab from "./ResultsTab.jsx";
import LeaderboardTab from "./LeaderboardTab.jsx";
import PlayerDetailsModal from "./PlayerModalTab.jsx";

const TournamentsManagement = ({
  tournaments,
  slugInput,
  setSlugInput,
  kategori,
  setKategori,
  loading,
  handleAddTournament,
  handleDeleteTournament,
  setShowModal,
}) => {
  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("tournaments");

  const db = getDatabase();

  // Fetch results and leaderboard data
  useEffect(() => {
    const resultsRef = ref(db, "results");
    const leaderboardRef = ref(db, "leaderboard");

    // Fetch results
    const unsubscribeResults = onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      const resultList = [];

      if (data) {
        Object.entries(data).forEach(([tournamentId, participants]) => {
          if (participants && typeof participants === "object") {
            Object.entries(participants).forEach(([participantId, info]) => {
              if (info && typeof info === "object") {
                resultList.push({
                  tournamentId,
                  participantId,
                  name: info.name || "Unknown",
                  placement: info.placement || "N/A",
                });
              }
            });
          }
        });
      }

      setResults(resultList);
    });

    // Fetch leaderboard
    const unsubscribeLeaderboard = onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      const leaderboardList = [];

      if (data) {
        Object.entries(data).forEach(([participantId, info]) => {
          if (info && typeof info === "object") {
            leaderboardList.push({
              participantId,
              name: info.name || "Unknown",
              majorPoints: info.majorPoints || 0,
              minorPoints: info.minorPoints || 0,
              miniPoints: info.miniPoints || 0,
              totalPoints: info.totalPoints || 0,
              majorEvents: info.majorEvents || [],
              minorEvents: info.minorEvents || [],
              miniEvents: info.miniEvents || [],
              countedMajorEvents: info.countedMajorEvents || [],
              countedMinorEvents: info.countedMinorEvents || [],
              countedMiniEvents: info.countedMiniEvents || [],
              uncountedMajorEvents: info.uncountedMajorEvents || [],
              uncountedMinorEvents: info.uncountedMinorEvents || [],
              uncountedMiniEvents: info.uncountedMiniEvents || [],
              totalMajorEvents: info.totalMajorEvents || 0,
              totalMinorEvents: info.totalMinorEvents || 0,
              totalMiniEvents: info.totalMiniEvents || 0,
            });
          }
        });
      }

      // Sort by total points (descending)
      leaderboardList.sort((a, b) => b.totalPoints - a.totalPoints);
      setLeaderboard(leaderboardList);
    });

    return () => {
      unsubscribeResults();
      unsubscribeLeaderboard();
    };
  }, [db]);

  // Shared props for child components
  const sharedProps = {
    tournaments,
    results,
    leaderboard,
    selectedTournamentId,
    setSelectedTournamentId,
    selectedResult,
    setSelectedResult,
    showDetails,
    setShowDetails,
    db,
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("tournaments")}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "tournaments"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Tournaments Management
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "results"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Results Management
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "leaderboard"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tournaments" && (
        <TournamentsTab
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
      )}

      {activeTab === "results" && (
        <ResultsTab
          {...sharedProps}
        />
      )}

      {activeTab === "leaderboard" && (
        <LeaderboardTab
          {...sharedProps}
        />
      )}

      {/* Player Details Modal */}
      {showDetails && selectedResult && (
        <PlayerDetailsModal
          selectedResult={selectedResult}
          tournaments={tournaments}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          setSelectedResult={setSelectedResult}
        />
      )}
    </div>
  );
};

export default TournamentsManagement;