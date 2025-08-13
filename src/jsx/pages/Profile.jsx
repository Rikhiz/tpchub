import React from "react";
import { User } from "lucide-react";

const Profile = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-white text-3xl font-bold mb-8">
        Player Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <h2 className="text-white text-xl font-semibold">
              {user?.displayName}
            </h2>
            <p className="text-red-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6">
            <h3 className="text-white text-xl font-semibold mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white">{user?.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className="text-red-500 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-6">
            <h3 className="text-white text-xl font-semibold mb-4">
              Tournament Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-red-500 text-2xl font-bold">12</div>
                <div className="text-gray-400 text-sm">
                  Tournaments Joined
                </div>
              </div>
              <div className="text-center">
                <div className="text-red-500 text-2xl font-bold">3</div>
                <div className="text-gray-400 text-sm">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-red-500 text-2xl font-bold">
                  1,250
                </div>
                <div className="text-gray-400 text-sm">Points</div>
              </div>
              <div className="text-center">
                <div className="text-red-500 text-2xl font-bold">#47</div>
                <div className="text-gray-400 text-sm">Global Rank</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;