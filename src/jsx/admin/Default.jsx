import React from 'react';

const Default = ({ currentPage }) => {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">
        {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
      </h1>
      <p className="text-gray-400">This page is under development.</p>
    </div>
  );
};

export default Default;