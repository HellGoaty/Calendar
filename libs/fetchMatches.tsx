type Team = {
  name: string;
  code: string;
  image: string;
};

type Match = {
  teams: Team[];
};

type Event = {
  match?: Match;
  startTime: string;
  type: string;
  league: {
    name: string;
    slug: string;
  };
};

export async function fetchMatches(): Promise<Event[]> {
  const apiKey = process.env.RAPIDAPI_KEY;

  const url =
    "https://league-of-legends-esports.p.rapidapi.com/schedule?leagueId=98767991299243165%2C99332500638116286%2C98767991302996019";

  const response = await fetch(url, {
    headers: {
      "x-rapidapi-host": "league-of-legends-esports.p.rapidapi.com",
      "x-rapidapi-key": apiKey as string,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des matchs LoL");
  }

  const data = await response.json();

  if (!data?.data?.schedule?.events?.length) {
    throw new Error("Aucune donnée de match disponible");
  }

  const teamCodes = ["G2", "KC"];

  const filteredMatches = data.data.schedule.events.filter((event: Event) =>
    event.match?.teams?.some((team: Team) => teamCodes.includes(team.code))
  );

  return filteredMatches;
}
