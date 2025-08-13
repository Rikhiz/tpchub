import React from "react";
import { ArrowLeft, Eye, Trash2, Users } from "lucide-react";
import { remove, ref } from "firebase/database";

const ResultsTab = ({
  tournaments,
  results,
  selectedTournamentId,
  setSelectedTournamentId,
  setSelectedResult,
  setShowDetails,
  db,
}) => {
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

  // Get tournament name by ID
  const getTournamentName = (tournamentId) => {
    const tournament = tournaments.find(
      (t) => t.event_id.toString() === tournamentId
    );
    return tournament ? tournament.event_name : `Tournament ${tournamentId}`;
  };

  const handleDeleteResult = async (tournamentId, participantId) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        await remove(ref(db, `results/${tournamentId}/${participantId}`));
        alert("Result deleted successfully!");
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    }
  };

  // Filter results by selected tournament
  const filteredResults = results.filter(
    (r) => r.tournamentId === selectedTournamentId
  );

  if (selectedTournamentId) {
    return (
      <div>
        <button
          onClick={() => setSelectedTournamentId(null)}
          className="mb-4 px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Tournament List
        </button>

        <h2 className="text-white text-xl font-semibold mb-4">
          Results for {getTournamentName(selectedTournamentId)}
        </h2>

        <div className="bg-gray-900 border border-red-500 rounded-lg overflow-hidden">
          <table className="w-full text-white border-collapse">
            <thead>
              <tr className="border-b border-red-500 bg-gray-800">
                <th className="py-3 px-4 text-left">Participant ID</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Placement</th>
                <th className="py-3 px-4 text-left">Points Earned</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 py-8">
                    No results found for this tournament
                  </td>
                </tr>
              ) : (
                filteredResults
                  .sort(
                    (a, b) => parseInt(a.placement) - parseInt(b.placement)
                  )
                  .map((res, index) => {
                    const tournament = tournaments.find(
                      (t) => t.event_id.toString() === res.tournamentId
                    );
                    const points = tournament
                      ? calculatePoints(
                          parseInt(res.placement),
                          parseInt(tournament.event_entrants),
                          tournament.category
                        )
                      : 0;

                    return (
                      <tr
                        key={`${res.participantId}-${index}`}
                        className="hover:bg-gray-800 border-b border-gray-700"
                      >
                        <td className="py-3 px-4">{res.participantId}</td>
                        <td className="py-3 px-4 font-medium">{res.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              res.placement === 1
                                ? "bg-yellow-600 text-yellow-100"
                                : res.placement === 2
                                ? "bg-gray-400 text-gray-900"
                                : res.placement === 3
                                ? "bg-orange-600 text-orange-100"
                                : "bg-red-600 text-red-100"
                            }`}
                          >
                            #{res.placement}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-green-400 font-semibold">
                            {points} pts
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedResult(res);
                                setShowDetails(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 p-2 hover:bg-gray-700 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteResult(
                                  res.tournamentId,
                                  res.participantId
                                )
                              }
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded transition-colors"
                              title="Delete Result"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>Total participants: {filteredResults.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-white text-xl font-semibold mb-4">
        Select Tournament to View Results
      </h2>
      <div className="bg-gray-900 border border-red-500 rounded-lg overflow-hidden">
        <table className="w-full text-white border-collapse">
          <thead>
            <tr className="border-b border-red-500 bg-gray-800">
              <th className="py-3 px-4 text-left">Event ID</th>
              <th className="py-3 px-4 text-left">Tournament Name</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Participants</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 py-8">
                  No tournaments available
                </td>
              </tr>
            ) : (
              tournaments.map((tournament) => {
                const tournamentResults = results.filter(
                  (r) => r.tournamentId === tournament.event_id.toString()
                );
                return (
                  <tr
                    key={tournament.event_id}
                    className="hover:bg-gray-800 border-b border-gray-700"
                  >
                    <td className="py-3 px-4">{tournament.event_id}</td>
                    <td className="py-3 px-4 font-medium">
                      {tournament.event_name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          tournament.category === "1"
                            ? "bg-yellow-600 text-yellow-100"
                            : tournament.category === "2"
                            ? "bg-blue-600 text-blue-100"
                            : tournament.category === "3"
                            ? "bg-green-600 text-green-100"
                            : "bg-gray-600 text-gray-100"
                        }`}
                      >
                        {tournament.category === "1"
                          ? "Major"
                          : tournament.category === "2"
                          ? "Minor"
                          : tournament.category === "3"
                          ? "Mini"
                          : "Unknown"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-300">
                        {tournamentResults.length} participants
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          setSelectedTournamentId(
                            tournament.event_id.toString()
                          )
                        }
                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-gray-700 rounded transition-colors flex items-center gap-1"
                        title="View Results"
                      >
                        <Users size={16} />
                        View Results
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTab;