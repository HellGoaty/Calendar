import { writeFile, readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";

type CustomEvent = {
  title: string;
  start: string;
  end?: string;
};

const filePath = path.join(process.cwd(), "public", "calendar-custom.json");

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const newEvent = JSON.parse(body);

    let existingData: CustomEvent[] = [];

    try {
      const fileContent = await readFile(filePath, "utf-8");
      if (fileContent.trim()) {
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          existingData = parsed;
        } else {
          console.warn(
            "Fichier JSON non conforme, initialisation à tableau vide"
          );
        }
      }
    } catch (err) {
      console.warn("Fichier inexistant ou vide, création d’un nouveau fichier");
      console.log(err);
    }

    existingData.push(newEvent);

    await writeFile(filePath, JSON.stringify(existingData, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur dans POST /custom-events :", err);
    return NextResponse.json(
      { success: false, error: "Erreur interne" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const updatedEvent = await req.json();
    const dataRaw = await fs.readFile(filePath, "utf-8").catch(() => "[]");
    const events = JSON.parse(dataRaw);

    const index = events.findIndex(
      (e: CustomEvent) =>
        e.title === updatedEvent.title && e.start === updatedEvent.originalStart
    );

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Événement non trouvé." },
        { status: 404 }
      );
    }

    // Mise à jour
    events[index] = {
      ...events[index],
      start: updatedEvent.start,
      end: updatedEvent.end ?? null,
      title: updatedEvent.title,
    };

    await fs.writeFile(filePath, JSON.stringify(events, null, 2));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const deletedEvent = await req.json();

    // Lire les événements depuis le fichier
    const dataRaw = await fs.readFile(filePath, "utf-8").catch(() => "[]");
    const events = JSON.parse(dataRaw);

    // Chercher l'événement à supprimer
    const index = events.findIndex(
      (e: CustomEvent) =>
        e.title === deletedEvent.title && e.start === deletedEvent.start
    );

    // Si l'événement n'est pas trouvé, retourner une erreur
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Événement non trouvé." },
        { status: 404 }
      );
    }

    // Supprimer l'événement du tableau
    events.splice(index, 1);

    // Réécrire le fichier sans l'événement supprimé
    await fs.writeFile(filePath, JSON.stringify(events, null, 2));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
