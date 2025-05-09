import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { fetchMatches } from "@/libs/fetchMatches";
import path from "path";

export async function GET() {
  try {
    const matches = await fetchMatches();

    const calendarEvents = matches
      .map((event) => {
        if (!event.match) {
          return null;
        }

        const [team1, team2] = event.match.teams;

        return {
          title: `${team1.code} vs ${team2.code}`,
          start: event.startTime,
          team1: {
            code: team1.code,
            logo: team1.image,
          },
          team2: {
            code: team2.code,
            logo: team2.image,
          },
        };
      })
      .filter((event) => event !== null); // Filtre les événements qui sont null (lorsque `event.match` était undefined)

    // Chemin pour enregistrer le fichier JSON
    const filePath = path.join(process.cwd(), "public", "calendar-esport.json");

    // Écriture du fichier JSON
    await writeFile(filePath, JSON.stringify(calendarEvents, null, 2), "utf8");

    // Réponse JSON avec les événements générés
    return NextResponse.json({
      success: true,
      message: "Événements esport générés avec succès",
      events: calendarEvents,
    });
  } catch (error) {
    // Gestion des erreurs
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
