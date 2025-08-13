// TournamentService.jsx
import { ref, set } from "firebase/database";

export class TournamentService {
  constructor(database, startggKey) {
    this.database = database;
    this.startggKey = startggKey;
    this.startggURL = "https://api.start.gg/gql/alpha";
  }

  extractSlug(url) {
    const match = url.match(/start\.gg\/tournament\/[^\/]+\/event\/[^\/]+/);
    if (!match) throw new Error("Invalid start.gg event URL");
    return match[0].replace("start.gg/", "");
  }

  async fetchEventData(slugUrl) {
    const slug = this.extractSlug(slugUrl);

    const query = {
      query: `
        query EventQuery($slug: String!) {
          event(slug: $slug) {
            id
            name
            slug
            state
            startAt
            numEntrants
          }
        }
      `,
      variables: { slug }
    };

    const response = await fetch(this.startggURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.startggKey}`,
      },
      body: JSON.stringify(query),
    });

    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);

    const event = result?.data?.event;
    if (!event) throw new Error("Event not found");

    return event;
  }

  async fetchEventStandings(eventId) {
    const query = {
      query: `
        query EventStandings($eventId: ID!) {
          event(id: $eventId) {
            id
            name
            phaseGroups {
              id
              seeds(query: {page: 1}) {
                nodes {
                  id
                  standings(containerType: "groups") {
                    id
                    metadata
                  }
                }
              }
            }
          }
        }
      `,
      variables: { eventId }
    };

    const response = await fetch(this.startggURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.startggKey}`,
      },
      body: JSON.stringify(query),
    });

    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);

    const standingsData = result?.data?.event?.phaseGroups || [];
    return standingsData;
  }

  async saveTournament(eventData, category) {
    const tournamentData = {
      event_id: eventData.id,
      event_name: eventData.name,
      event_slug: eventData.slug,
      event_status: eventData.state,
      event_start: new Date(eventData.startAt * 1000).toLocaleString(),
      event_entrants: eventData.numEntrants,
      category: category,
    };

    await set(ref(this.database, `tournaments/${eventData.id}`), tournamentData);
    return tournamentData;
  }

  async saveStandings(eventId, standingsData) {
    const allStandings = [];

    for (const group of standingsData) {
      const seeds = group.seeds?.nodes || [];
      for (const seed of seeds) {
        if (seed.standings && seed.standings.metadata) {
          allStandings.push({
            seed_id: seed.id,
            standing_id: seed.standings.id,
            ...seed.standings.metadata,
          });
        }
      }
    }

    await set(ref(this.database, `standings/${eventId}`), allStandings);
    return allStandings;
  }

  async addTournament(slugUrl, category) {
    try {
      const eventData = await this.fetchEventData(slugUrl);
      const savedTournament = await this.saveTournament(eventData, category);

      const standingsData = await this.fetchEventStandings(eventData.id);
      await this.saveStandings(eventData.id, standingsData);

      return savedTournament;
    } catch (error) {
      throw error;
    }
  }
}
