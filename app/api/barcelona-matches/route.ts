import { NextResponse } from "next/server";
import axios from "axios";
import { writeFile } from "fs/promises";
import path from "path";

interface TeamInfo {
  id: number;
  name: string;
  date: string;
  logo: string;
}

interface FixtureInfo {
  fixture: {
    id: number;
    date: string;
  };
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
}

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  const teamCode = 529; //Barcelone
  const timezone = "Europe/Paris";

  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?team=${teamCode}&next=50&timezone=${timezone}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "x-rapidapi-key": apiKey as string,
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      },
    });

    const fixtures = response.data.response;

    const formattedMatches = fixtures.map((fixture: FixtureInfo) => ({
      title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
      start: fixture.fixture.date,
      team1: {
        id: fixture.teams.home.id,
        name: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
      },
      team2: {
        id: fixture.teams.away.id,
        name: fixture.teams.away.name,
        logo: fixture.teams.away.logo,
      },
    }));

    // Chemin pour enregistrer le fichier JSON
    const filePath = path.join(
      process.cwd(),
      "public",
      "calendar-barcelona.json"
    );

    // Écriture du fichier JSON
    await writeFile(
      filePath,
      JSON.stringify(formattedMatches, null, 2),
      "utf8"
    );

    return NextResponse.json({ success: true, matches: formattedMatches });
  } catch (error) {
    console.error("Erreur API :", error);

    if (axios.isAxiosError(error)) {
      // Afficher les informations supplémentaires de l'erreur Axios
      if (error.response) {
        console.error("Détails de la réponse d'erreur:", error.response.data);
        console.error("Code d'état HTTP:", error.response.status);
      } else {
        console.error("Erreur sans réponse:", error.message);
      }
    }

    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des matchs" },
      { status: 500 }
    );
  }
}
