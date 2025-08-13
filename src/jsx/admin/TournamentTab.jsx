import React from "react";
import { PlusCircle, Trash2 } from "lucide-react";

const TournamentsTab = ({
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
  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-6">
        Tournaments Management
      </h1>

      {/* Add Tournament Form */}
      <div className="bg-gray-900 border border-red-500 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">
            Add New Tournament
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Add Standings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">
                Start.gg Event URL
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="https://start.gg/tournament/your-tournament/event/your-event"
                className="w-full p-3 rounded bg-gray-800 text-white border border-red-500 focus:border-red-400 focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Category</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white border border-red-500 focus:border-red-400 focus:outline-none"
                disabled={loading}
              >
                <option value="1">Major</option>
                <option value="2">Minor</option>
                <option value="3">Mini</option>
              </select>
            </div>
            <button
              onClick={handleAddTournament}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white px-6 py-3 rounded flex items-center gap-2 transition-colors"
            >
              <PlusCircle size={18} />
              {loading ? "Adding..." : "Add Tournament"}
            </button>
          </div>
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="bg-gray-900 border border-red-500 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-white border-collapse">
            <thead>
              <tr className="border-b border-red-500 bg-gray-800">
                <th className="py-3 px-4 text-left">Event ID</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Start Date</th>
                <th className="py-3 px-4 text-left">Entrants</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="py-8 px-4 text-center text-gray-400"
                  >
                    No tournaments found. Add your first tournament above.
                  </td>
                </tr>
              ) : (
                tournaments.map((tournament) => (
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
                      {new Date(tournament.event_start).toLocaleDateString()}

                    </td>
                    <td className="py-3 px-4">{tournament.event_entrants}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          tournament.event_state === "COMPLETED"
                            ? "bg-green-600 text-green-100"
                            : tournament.event_state === "ACTIVE"
                            ? "bg-blue-600 text-blue-100"
                            : "bg-gray-600 text-gray-100"
                        }`}
                      >
                        {tournament.event_state}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteTournament(tournament.event_id)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded transition-colors"
                        title="Delete Tournament"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TournamentsTab;