import React from "react";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-white text-3xl font-bold mb-8">
        About Tournament Portal
      </h1>
      <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-8">
        <p className="text-gray-400 text-lg leading-relaxed mb-6">
          Tournament Portal is the premier destination for competitive
          gaming tournaments. We connect players from around the world and
          provide a platform for fair, exciting, and rewarding
          competition.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white text-xl font-semibold mb-3">
              Our Mission
            </h3>
            <p className="text-gray-400">
              To create the best competitive gaming experience for players
              of all skill levels.
            </p>
          </div>
          <div>
            <h3 className="text-white text-xl font-semibold mb-3">
              Our Vision
            </h3>
            <p className="text-gray-400">
              Building the future of esports through innovative tournament
              management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;