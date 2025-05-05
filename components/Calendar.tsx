"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";

type EventData = {
  start: string;
  team1: { code: string; logo: string };
  team2: { code: string; logo: string };
};

type CalendarEvent = { title: string; start: string };

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch("/calendar-esport.json");

        if (!res.ok) {
          console.error("Erreur lors du chargement du fichier JSON");
          return;
        }

        const data: EventData[] = await res.json();
        console.log(data);

        const formattedEvents = data
          .filter((event) => event.team1 && event.team2 && event.start)
          .map((event) => {
            console.log("oui");

            const teamNames = `${event.team1.code} vs ${event.team2.code}`;

            // Retourne l'événement formaté
            return {
              title: teamNames,
              start: event.start,
            };
          });

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
