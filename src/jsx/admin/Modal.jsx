import React from 'react';
import EventStandings from '../api/EventStandings';

const Modal = ({
  showModal,
  setShowModal,
  eventIdInput,
  setEventIdInput,
  setSelectedEventId,
  setSubmittedEventId,
  submittedEventId
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 border border-red-500 rounded-lg w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Submit Result</h2>

        <div className="mb-4">
          <label className="block text-white mb-2">Event ID:</label>
          <input
            type="text"
            placeholder="Enter Event ID"
            value={eventIdInput}
            onChange={(e) => setEventIdInput(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 text-white border border-red-500"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (eventIdInput.trim()) {
                setSelectedEventId(eventIdInput.trim());
                setSubmittedEventId(eventIdInput.trim());
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>

        <button
          onClick={() => setShowModal(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <br />
        {submittedEventId && (
          
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-xl font-semibold text-white mb-4">
            Processing Results
          </h3>
          <EventStandings eventId={submittedEventId} />
          
        </div>
      )}
      </div>
      
      
    </div>
  );
};

export default Modal;