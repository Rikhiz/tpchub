import React, { useEffect, useState } from 'react';
import { getDatabase, ref, set } from 'firebase/database';

const EventStandings = ({ eventId }) => {
  const [status, setStatus] = useState("Fetching event data...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCount, setSavedCount] = useState(0);

  const startggURL = "https://api.start.gg/gql/alpha";
  const startggKey = import.meta.env.VITE_STARTGG_KEY;

  useEffect(() => {
    if (!eventId) {
      setStatus("❌ No Event ID provided");
      setLoading(false);
      return;
    }

    const fetchAndSaveStandings = async () => {
      try {
        setLoading(true);
        setError(null);
        setStatus("🔍 Searching for event...");

        const response = await fetch(startggURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${startggKey}`
          },
          body: JSON.stringify({
            query: `
              query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) {
                event(id: $eventId) {
                  id
                  standings(query: { perPage: $perPage, page: $page }) {
                    nodes {
                      placement
                      entrant {
                        id
                        name
                        participants {
                          gamerTag
                          player {
                            gamerTag
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              eventId: parseInt(eventId),
              page: 1,
              perPage: 64
            }
          })
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const json = await response.json();
        if (json.errors) throw new Error(`GraphQL Error: ${json.errors[0].message}`);

        const event = json.data?.event;
        if (!event || !event.standings?.nodes) {
          throw new Error("No valid event standings found.");
        }

        const standings = event.standings.nodes;
        const db = getDatabase();
        const resultRef = ref(db, `results/${event.id}`);
        const standingsOnly = {};

        standings.forEach((s) => {
          const entrant = s.entrant;
          const name =
            entrant.participants?.[0]?.gamerTag ||
            entrant.participants?.[0]?.player?.gamerTag ||
            entrant.name ||
            `Entrant ${entrant.id}`;

          standingsOnly[entrant.id] = {
            name,
            placement: s.placement
          };
        });

        await set(resultRef, standingsOnly);
        setSavedCount(standings.length);
        setStatus(`✅ Successfully saved ${standings.length} standings.`);
      } catch (err) {
        setError(err.message);
        setStatus(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSaveStandings();
  }, [eventId]);

  return (
    <div className="space-y-3">
      <div className={`p-4 rounded ${
        loading ? 'bg-blue-900 border-blue-500' :
        error ? 'bg-red-900 border-red-500' :
        'bg-green-900 border-green-500'
      } border`}>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span className="text-white">{status}</span>
        </div>
        {!loading && savedCount > 0 && (
          <div className="mt-2 text-sm text-gray-300">
            <p>📊 Total saved: {savedCount}</p>
            <p>🗂 Path: <code>results/{eventId}</code></p>
          </div>
        )}
        {error && (
          <div className="mt-3 p-3 bg-red-800 rounded text-sm">
            <p className="font-semibold text-red-200">Troubleshooting:</p>
            <ul className="mt-1 text-red-300 list-disc list-inside">
              <li>Check Event ID validity</li>
              <li>Ensure standings are available</li>
              <li>Verify your Start.gg API key</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventStandings;
