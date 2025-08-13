import React from "react";
import { Trophy } from "lucide-react";

const PlayerModalTab = ({
  showDetails,
  selectedResult,
  setShowDetails,
  setSelectedResult,
  tournaments,
  calculatePoints,
}) => {
  // Get tournament name by ID
  const getTournamentName = (tournamentId) => {
    const tournament = tournaments.find(
      (t) => t.event_id.toString() === tournamentId
    );
    return tournament ? tournament.event_name : `Tournament ${tournamentId}`;
  };

  if (!showDetails || !selectedResult) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-red-500 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-2xl font-bold">
              Player Details: {selectedResult.name}
            </h2>
            <button
              onClick={() => {
                setShowDetails(false);
                setSelectedResult(null);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Leaderboard Player Details */}
          {selectedResult.totalPoints !== undefined && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 border border-red-400 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {selectedResult.totalPoints}
                  </div>
                  <div className="text-gray-300 text-sm">Total Points</div>
                </div>
                <div className="bg-gray-800 border border-yellow-400 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {selectedResult.majorPoints}
                  </div>
                  <div className="text-gray-300 text-sm">Major Points</div>
                </div>
                <div className="bg-gray-800 border border-blue-400 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedResult.minorPoints}
                  </div>
                  <div className="text-gray-300 text-sm">Minor Points</div>
                </div>
                <div className="bg-gray-800 border border-green-400 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {selectedResult.miniPoints}
                  </div>
                  <div className="text-gray-300 text-sm">Mini Points</div>
                </div>
              </div>

              {/* Rule Reminder */}
              <div className="bg-blue-900 border border-blue-500 rounded-lg p-4">
                <h3 className="text-blue-200 font-semibold mb-2">
                  Point Calculation Rule:
                </h3>
                <p className="text-blue-100 text-sm">
                  Only <strong>Top 1 Major</strong> +{" "}
                  <strong>Top 2 Minor</strong> + <strong>Top 4 Mini</strong>{" "}
                  events count towards total points. Other events are
                  recorded but not counted.
                </p>
              </div>

              {/* Major Events */}
              <div className="space-y-3">
                <h3 className="text-yellow-400 text-lg font-semibold flex items-center gap-2">
                  <Trophy size={18} />
                  Major Events ({selectedResult.totalMajorEvents || 0}{" "}
                  played)
                </h3>

                {/* Counted Major Events */}
                {selectedResult.countedMajorEvents &&
                  selectedResult.countedMajorEvents.length > 0 && (
                    <div>
                      <h4 className="text-yellow-300 font-medium mb-2">
                        ✅ Counted Events (Top 1):
                      </h4>
                      <div className="space-y-2">
                        {selectedResult.countedMajorEvents.map(
                          (event, index) => (
                            <div
                              key={index}
                              className="bg-yellow-900 border border-yellow-600 rounded-lg p-3"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-yellow-100 font-medium">
                                    {event.tournamentName}
                                  </div>
                                  <div className="text-yellow-200 text-sm">
                                    Placement: #{event.placement} |
                                    Entrants: {event.entrants}
                                  </div>
                                </div>
                                <div className="text-yellow-400 font-bold text-lg">
                                  {event.points} pts
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Uncounted Major Events */}
                {selectedResult.uncountedMajorEvents &&
                  selectedResult.uncountedMajorEvents.length > 0 && (
                    <div>
                      <h4 className="text-gray-400 font-medium mb-2">
                        ❌ Not Counted (Excess Events):
                      </h4>
                      <div className="space-y-2">
                        {selectedResult.uncountedMajorEvents.map(
                          (event, index) => (
                            <div
                              key={index}
                              className="bg-gray-800 border border-gray-600 rounded-lg p-3 opacity-60"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-gray-300 font-medium">
                                    {event.tournamentName}
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Placement: #{event.placement} |
                                    Entrants: {event.entrants}
                                  </div>
                                </div>
                                <div className="text-gray-500 font-bold text-lg line-through">
                                  {event.points} pts
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {selectedResult.totalMajorEvents === 0 && (
                  <div className="text-gray-400 text-center py-4">
                    No Major events played
                  </div>
                )}
              </div>

              {/* Minor Events */}
              <div className="space-y-3">
                <h3 className="text-blue-400 text-lg font-semibold flex items-center gap-2">
                  <Trophy size={18} />
                  Minor Events ({selectedResult.totalMinorEvents || 0}{" "}
                  played)
                </h3>

                {/* Counted Minor Events */}
                {selectedResult.countedMinorEvents &&
                  selectedResult.countedMinorEvents.length > 0 && (
                    <div>
                      <h4 className="text-blue-300 font-medium mb-2">
                        ✅ Counted Events (Top 2):
                      </h4>
                      <div className="space-y-2">
                        {selectedResult.countedMinorEvents.map(
                          (event, index) => (
                            <div
                              key={index}
                              className="bg-blue-900 border border-blue-600 rounded-lg p-3"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-blue-100 font-medium">
                                    {event.tournamentName}
                                  </div>
                                  <div className="text-blue-200 text-sm">
                                    Placement: #{event.placement} |
                                    Entrants: {event.entrants}
                                  </div>
                                </div>
                                <div className="text-blue-400 font-bold text-lg">
                                  {event.points} pts
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Uncounted Minor Events */}
                {selectedResult.uncountedMinorEvents &&
                  selectedResult.uncountedMinorEvents.length > 0 && (
                    <div>
                      <h4 className="text-gray-400 font-medium mb-2">
                        ❌ Not Counted (Excess Events):
                      </h4>
                      <div className="space-y-2">
                        {selectedResult.uncountedMinorEvents.map(
                          (event, index) => (
                            <div
                              key={index}
                              className="bg-gray-800 border border-gray-600 rounded-lg p-3 opacity-60"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-gray-300 font-medium">
                                    {event.tournamentName}
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Placement: #{event.placement} |
                                    Entrants: {event.entrants}
                                  </div>
                                </div>
                                <div className="text-gray-500 font-bold text-lg line-through">
                                  {event.points} pts
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {selectedResult.totalMinorEvents === 0 && (
                  <div className="text-gray-400 text-center py-4">
                    No Minor events played
                  </div>
                )}
              </div>

              {/* Mini Events */}
              <div className="space-y-3">
                <h3 className="text-green-400 text-lg font-semibold flex items-center gap-2">
                  <Trophy size={18} />
                  Mini Events ({selectedResult.totalMiniEvents || 0} played)
                </h3>

                {/* Counted Mini Events */}
                {selectedResult.countedMiniEvents &&
                  selectedResult.countedMiniEvents.length > 0 && (
                    <div>
                      <h4 className="text-green-300 font-medium mb-2">
                        ✅ Counted Events (Top 4):
                      </h4>
                      <div className="space-y-2">
                        {selectedResult.countedMiniEvents.map(
                          (event, index) => (
                            <div
                              key={index}
                              className="bg-green-900 border border-green-600 rounded-lg p-3"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-green-100 font-medium">
                                    {event.tournamentName}
                                  </div>
                                  <div className="text-green-200 text-sm">
                                    Placement: #{event.placement} |
                                    Entrants: {event.entrants}
                                  </div>
                                </div>
                                <div className="text-green-400 font-bold text-lg">
                                  {event.points} pts
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Uncounted Mini Events */}
                {selectedResult.uncountedMiniEvents &&
                  selectedResult.uncountedMiniEvents.length > 0 && (
                    <div>
                      <h4 className="text-gray-400 font-medium mb-2">
                        ❌ Not Counted (Excess Events):
                      </h4>
                      <div className="space-y-2">
                        {selectedResult.uncountedMiniEvents.map(
                          (event, index) => (
                            <div
                              key={index}
                              className="bg-gray-800 border border-gray-600 rounded-lg p-3 opacity-60"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-gray-300 font-medium">
                                    {event.tournamentName}
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Placement: #{event.placement} |
                                    Entrants: {event.entrants}
                                  </div>
                                </div>
                                <div className="text-gray-500 font-bold text-lg line-through">
                                  {event.points} pts
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {selectedResult.totalMiniEvents === 0 && (
                  <div className="text-gray-400 text-center py-4">
                    No Mini events played
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Single Result Details (for Results tab) */}
          {selectedResult.tournamentId &&
            selectedResult.totalPoints === undefined && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 border border-red-400 rounded-lg p-4">
                    <div className="text-gray-300 text-sm">Tournament</div>
                    <div className="text-white font-semibold">
                      {getTournamentName(selectedResult.tournamentId)}
                    </div>
                  </div>
                  <div className="bg-gray-800 border border-red-400 rounded-lg p-4">
                    <div className="text-gray-300 text-sm">Placement</div>
                    <div className="text-white font-semibold text-xl">
                      #{selectedResult.placement}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-red-400 rounded-lg p-4">
                  <div className="text-gray-300 text-sm">
                    Participant ID
                  </div>
                  <div className="text-white font-mono">
                    {selectedResult.participantId}
                  </div>
                </div>

                {(() => {
                  const tournament = tournaments.find(
                    (t) =>
                      t.event_id.toString() === selectedResult.tournamentId
                  );
                  const points = tournament && calculatePoints
                    ? calculatePoints(
                        parseInt(selectedResult.placement),
                        parseInt(tournament.event_entrants),
                        tournament.category
                      )
                    : 0;
                  return (
                    <div className="bg-gray-800 border border-green-400 rounded-lg p-4">
                      <div className="text-gray-300 text-sm">
                        Points Earned
                      </div>
                      <div className="text-green-400 font-bold text-2xl">
                        {points} points
                      </div>
                      {tournament && (
                        <div className="text-gray-400 text-sm mt-1">
                          Category:{" "}
                          {tournament.category === "1"
                            ? "Major"
                            : tournament.category === "2"
                            ? "Minor"
                            : "Mini"}{" "}
                          | Entrants: {tournament.event_entrants}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setShowDetails(false);
                setSelectedResult(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerModalTab;