import React, { useState } from "react";
import { Calculator, Trophy, Eye } from "lucide-react";
import { set, ref } from "firebase/database";

const LeaderboardTab = ({
  tournaments,
  results,
  leaderboard,
  setSelectedResult,
  setShowDetails,
  db,
}) => {
  const [calculating, setCalculating] = useState(false);

  // Fixed point calculation function
  const calculatePoints = (placement, entrants, category) => {
    const pointTable = {
      1: {
        // Major Events
        1: 800,
        2: 560,
        3: 430,
        4: 220,
        5: 150,
        7: 120,
        9: 70,
        13: 50,
        17: 30,
      },
      2: {
        // Minor Events
        1: 400,
        2: 300,
        3: 220,
        4: 150,
        5: 70,
        7: 50,
        9: 30,
        13: 15,
        17: 10,
      },
      3: {
        // Mini Events
        1: 220,
        2: 150,
        3: 100,
        4: 70,
        5: 50,
        7: 30,
        9: 15,
        13: 10,
        17: 5,
      },
    };

    const categoryPoints = pointTable[category];
    if (!categoryPoints) return 0;

    // Determine point value based on placement ranges
    if (placement === 1) return categoryPoints[1];
    if (placement === 2) return categoryPoints[2];
    if (placement === 3) return categoryPoints[3];
    if (placement === 4) return categoryPoints[4];
    if (placement >= 5 && placement <= 6) return categoryPoints[5];
    if (placement >= 7 && placement <= 8) return categoryPoints[7];
    if (placement >= 9 && placement <= 12) return categoryPoints[9];
    if (placement >= 13 && placement <= 16) return categoryPoints[13];
    if (placement >= 17) return categoryPoints[17];

    return 0;
  };

  // Calculate leaderboard with proper rule implementation
  const calculateLeaderboard = async () => {
    setCalculating(true);

    try {
      const participantResults = {};

      results.forEach((result) => {
        const tournament = tournaments.find(
          (t) => t.event_id.toString() === result.tournamentId
        );
        if (!tournament) return;

        const placement = parseInt(result.placement);
        const entrants = parseInt(tournament.event_entrants);
        const category = tournament.category;
        const points = calculatePoints(placement, entrants, category);
        const playerName = result.name.trim(); // pakai nama sebagai key utama

        if (!participantResults[playerName]) {
          participantResults[playerName] = {
            majorEvents: [],
            minorEvents: [],
            miniEvents: [],
          };
        }

        const eventData = {
          tournamentId: result.tournamentId,
          tournamentName: tournament.event_name,
          placement,
          points,
          entrants,
          category,
          startDate: tournament.event_start,
        };

        if (category === "1") {
          participantResults[playerName].majorEvents.push(eventData);
        } else if (category === "2") {
          participantResults[playerName].minorEvents.push(eventData);
        } else if (category === "3") {
          participantResults[playerName].miniEvents.push(eventData);
        }
      });

      const leaderboardData = {};

      Object.entries(participantResults).forEach(([name, data]) => {
        const sortedMajor = data.majorEvents.sort(
          (a, b) => b.points - a.points
        );
        const sortedMinor = data.minorEvents.sort(
          (a, b) => b.points - a.points
        );
        const sortedMini = data.miniEvents.sort((a, b) => b.points - a.points);

        const countedMajorEvents = sortedMajor.slice(0, 1);
        const countedMinorEvents = sortedMinor.slice(0, 2);
        const countedMiniEvents = sortedMini.slice(0, 4);

        const uncountedMajorEvents = sortedMajor.slice(1);
        const uncountedMinorEvents = sortedMinor.slice(2);
        const uncountedMiniEvents = sortedMini.slice(4);

        const majorPoints = countedMajorEvents.reduce(
          (sum, ev) => sum + ev.points,
          0
        );
        const minorPoints = countedMinorEvents.reduce(
          (sum, ev) => sum + ev.points,
          0
        );
        const miniPoints = countedMiniEvents.reduce(
          (sum, ev) => sum + ev.points,
          0
        );

        const totalPoints = majorPoints + minorPoints + miniPoints;
        const safeKey = name.replace(/[.#$/\[\]]/g, "_"); // replace forbidden characters

        leaderboardData[safeKey] = {
          name, // tetap simpan nama asli
          majorPoints,
          minorPoints,
          miniPoints,
          totalPoints,

          majorEvents: sortedMajor,
          minorEvents: sortedMinor,
          miniEvents: sortedMini,

          countedMajorEvents,
          countedMinorEvents,
          countedMiniEvents,
          uncountedMajorEvents,
          uncountedMinorEvents,
          uncountedMiniEvents,

          totalMajorEvents: sortedMajor.length,
          totalMinorEvents: sortedMinor.length,
          totalMiniEvents: sortedMini.length,
        };
      });

      await set(ref(db, "leaderboard"), leaderboardData);

      alert("Leaderboard calculated successfully!");
      console.log("Leaderboard updated with name-based grouping:", {
        rule: "Top 1 Major + Top 2 Minor + Top 4 Mini",
        players: Object.keys(leaderboardData).length,
      });
    } catch (err) {
      console.error("Calculation error:", err);
      alert("Calculation failed: " + err.message);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-xl font-semibold">Global Leaderboard</h2>
        <button
          onClick={calculateLeaderboard}
          disabled={calculating}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <Calculator size={16} />
          {calculating ? "Calculating..." : "Recalculate Points"}
        </button>
      </div>

      {/* Rule Explanation */}
      <div className="bg-blue-900 border border-blue-500 rounded-lg p-4 mb-6">
        <h3 className="text-blue-200 font-semibold mb-2">Leaderboard Rules:</h3>
        <p className="text-blue-100 text-sm">
          Players are ranked by total points from:{" "}
          <strong>Top 1 Major event</strong> +{" "}
          <strong>Top 2 Minor events</strong> +{" "}
          <strong>Top 4 Mini events</strong>
        </p>
        <p className="text-blue-200 text-xs mt-1">
          Additional events in each category are recorded but not counted
          towards total points.
        </p>
      </div>

      <div className="bg-gray-900 border border-red-500 rounded-lg overflow-hidden">
        <table className="w-full text-white border-collapse">
          <thead>
            <tr className="border-b border-red-500 bg-gray-800">
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">Player</th>
              <th className="py-3 px-4 text-left">Major Points</th>
              <th className="py-3 px-4 text-left">Minor Points</th>
              <th className="py-3 px-4 text-left">Mini Points</th>
              <th className="py-3 px-4 text-left">Total Points</th>
              <th className="py-3 px-4 text-left">Events Played</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-gray-400 py-8">
                  No leaderboard data. Click "Recalculate Points" to generate
                  leaderboard.
                </td>
              </tr>
            ) : (
              leaderboard.map((player, index) => (
                <tr
                  key={player.participantId}
                  className="hover:bg-gray-800 border-b border-gray-700"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Trophy className="text-yellow-400" size={16} />
                      )}
                      {index === 1 && (
                        <Trophy className="text-gray-400" size={16} />
                      )}
                      {index === 2 && (
                        <Trophy className="text-orange-400" size={16} />
                      )}
                      <span className="font-bold">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{player.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-yellow-400 font-semibold">
                      {player.majorPoints}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">
                      ({(player.countedMajorEvents || []).length}/1 counted)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-blue-400 font-semibold">
                      {player.minorPoints}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">
                      ({(player.countedMinorEvents || []).length}/2 counted)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-400 font-semibold">
                      {player.miniPoints}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">
                      ({(player.countedMiniEvents || []).length}/4 counted)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-red-400 font-bold text-lg">
                      {player.totalPoints}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-400">
                      <div>Major: {player.totalMajorEvents || 0}</div>
                      <div>Minor: {player.totalMinorEvents || 0}</div>
                      <div>Mini: {player.totalMiniEvents || 0}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedResult(player);
                        setShowDetails(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 p-2 hover:bg-gray-700 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {leaderboard.length > 0 && (
        <div className="mt-4 text-sm text-gray-400">
          <p>
            <strong>Scoring Rule:</strong> Only the highest-scoring events count
            towards total points: Top 1 Major + Top 2 Minor + Top 4 Mini events
            per player.
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTab;
