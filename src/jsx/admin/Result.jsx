import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { Eye, Trash2 } from "lucide-react";

const Result = () => {
  const [tournaments, setTournaments] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const db = getDatabase();

  useEffect(() => {
    const tournamentRef = ref(db, "tournaments");
    const resultsRef = ref(db, "results");

    // Fetch tournaments
    const unsubscribeTournaments = onValue(tournamentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, value]) => ({
          ...value,
          id: key
        }));
        setTournaments(list);
      } else {
        setTournaments([]);
      }
    });

    // Fetch results - parsing data sesuai struktur Firebase yang benar
    const unsubscribeResults = onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      const resultList = [];

      if (data) {
        // Struktur: results/tournamentId/participantId/{name, placement}
        Object.entries(data).forEach(([tournamentId, participants]) => {
          if (participants && typeof participants === 'object') {
            Object.entries(participants).forEach(([participantId, info]) => {
              if (info && typeof info === 'object') {
                resultList.push({
                  tournamentId,
                  participantId,
                  name: info.name || 'Unknown',
                  placement: info.placement || 'N/A',
                });
              }
            });
          }
        });
      }

      console.log('Parsed results:', resultList); // Debug log
      setResults(resultList);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeTournaments();
      unsubscribeResults();
    };
  }, [db]);

  // Filter results berdasarkan tournament yang dipilih
  const filteredResults = results.filter(
    (r) => r.tournamentId === selectedTournamentId
  );

  console.log('Selected Tournament ID:', selectedTournamentId); // Debug log
  console.log('Filtered Results:', filteredResults); // Debug log

  const handleDelete = async (tournamentId, participantId) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        await remove(ref(db, `results/${tournamentId}/${participantId}`));
        alert("Result deleted!");
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    }
  };

  return (
    <div className="text-white min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6">Tournament Results</h1>

      {/* Tournament List Table */}
      {!selectedTournamentId && (
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-8">
          <h2 className="text-xl font-semibold p-4">Select a Tournament</h2>
          {tournaments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No tournaments found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {tournaments.map((tournament, index) => (
                  <tr
                    key={tournament.event_id || tournament.id || index}
                    className="hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => setSelectedTournamentId(tournament.event_id || tournament.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{tournament.event_id || tournament.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tournament.event_name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tournament.category === "1" 
                          ? "bg-yellow-600 text-yellow-100" 
                          : "bg-blue-600 text-blue-100"
                      }`}>
                        {tournament.category === "1" ? "Major" : "Minor"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{tournament.event_start || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Results Table */}
      {selectedTournamentId && (
        <div>
          <button
            onClick={() => setSelectedTournamentId(null)}
            className="mb-4 px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
          >
            ← Back to Tournaments
          </button>

          <h2 className="text-xl font-semibold mb-4">
            Results for Tournament {selectedTournamentId}
          </h2>

          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Participant ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Placement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-400 py-8">
                      No results found for this tournament
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((res, index) => (
                    <tr key={`${res.participantId}-${index}`} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{res.participantId}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{res.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-600 text-green-100 rounded-full text-sm">
                          #{res.placement}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedResult(res);
                              setShowDetails(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1 hover:bg-gray-600 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(res.tournamentId, res.participantId)
                            }
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-gray-600 rounded transition-colors"
                            title="Delete Result"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Debug Information */}
          <div className="mt-4 text-xs text-gray-500">
            <p>Total results: {results.length}</p>
            <p>Filtered results: {filteredResults.length}</p>
            <p>Selected Tournament: {selectedTournamentId}</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {showDetails && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Result Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <strong className="text-gray-400">Name:</strong> 
                <span className="text-white">{selectedResult.name}</span>
              </div>
              <div className="flex justify-between">
                <strong className="text-gray-400">Participant ID:</strong> 
                <span className="text-white">{selectedResult.participantId}</span>
              </div>
              <div className="flex justify-between">
                <strong className="text-gray-400">Placement:</strong> 
                <span className="px-2 py-1 bg-green-600 text-green-100 rounded text-sm">
                  #{selectedResult.placement}
                </span>
              </div>
              <div className="flex justify-between">
                <strong className="text-gray-400">Tournament ID:</strong> 
                <span className="text-white">{selectedResult.tournamentId}</span>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;