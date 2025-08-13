import React from "react";

const Tournaments = () => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-white text-3xl font-bold mb-8">Tournaments</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((tournament) => (
          <div
            key={tournament}
            className="bg-gray-900 border-2 border-red-500 rounded-lg p-6"
          >
            <h3 className="text-white text-xl font-semibold mb-2">
              Tournament {tournament}
            </h3>
            <p className="text-gray-400 mb-4">
              Join this exciting tournament and compete for prizes!
            </p>
            <div className="flex justify-between items-center">
              <span className="text-red-500 font-semibold">
                $500 Prize
              </span>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                Join Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tournaments;