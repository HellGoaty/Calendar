"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";

type EventData = {
  start: string;
  title: string;
  team1: { code: string; logo: string };
  team2: { code: string; logo: string };
};

type CalendarEvent = { title: string; start: string };

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Charger les matchs e-sport
        const esportRes = await fetch("/calendar-esport.json");
        if (!esportRes.ok) {
          console.error("Erreur lors du chargement des matchs e-sport");
          return;
        }
        const esportData: EventData[] = await esportRes.json();

        // Charger les matchs du Barça
        const barcelonaRes = await fetch("/calendar-barcelona.json");
        if (!barcelonaRes.ok) {
          console.error("Erreur lors du chargement des matchs du Barça");
          return;
        }
        const barcelonaData: EventData[] = await barcelonaRes.json();

        // Charger les matchs de la France
        const franceRes = await fetch("/calendar-france.json");
        if (!franceRes.ok) {
          console.error("Erreur lors du chargement des matchs de la France");
          return;
        }
        const franceData: EventData[] = await franceRes.json();

        // Combiner les deux jeux de données
        const combinedData = [...esportData, ...barcelonaData, ...franceData];

        // Filtrer et formater les événements
        const formattedEvents = combinedData
          .filter((event) => event.team1 && event.team2 && event.start)
          .map((event) => {
            // Retourne l'événement formaté
            return {
              title: event.title,
              start: event.start,
            };
          });

        console.log(formattedEvents);
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Erreur lors du chargement des matchs :", err);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="p-4">
      <FullCalendar
        locale={frLocale}
        timeZone="Europe/Paris"
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        events={events}
        height="auto"
      />
    </div>
  );
}
