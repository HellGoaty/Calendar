"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";
import { EventClickArg } from "@fullcalendar/core";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import EventModal from "@/components/EventModal";

import { createRoot } from "react-dom/client";
import ThemeToggleButton from "./ThemeToggleButton";

type CalendarEvent = {
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  category?: string;
};

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [darkMode, setDarkMode] = useState(false); // État pour basculer entre les modes

  const themeButtonRootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
    }

    const loadEvents = async () => {
      try {
        const esportRes = await fetch("/calendar-esport.json");
        const barcelonaRes = await fetch("/calendar-barcelona.json");
        const franceRes = await fetch("/calendar-france.json");
        const customRes = await fetch("/calendar-custom.json");

        const esportData = esportRes.ok ? await esportRes.json() : [];
        const barcelonaData = barcelonaRes.ok ? await barcelonaRes.json() : [];
        const franceData = franceRes.ok ? await franceRes.json() : [];

        let customData: CalendarEvent[] = [];
        if (customRes.ok) {
          const text = await customRes.text();
          if (text.trim() !== "") {
            customData = JSON.parse(text);
          }
        }

        const allData = [
          ...esportData,
          ...barcelonaData,
          ...franceData,
          ...customData,
        ];

        const formatted = allData
          .filter((e) => e.start)
          .map((e) => ({
            title: e.title,
            start: e.start,
            end: e.end,
            backgroundColor: e.backgroundColor,
            borderColor: e.borderColor,
            category: e.category,
          }));

        setEvents(formatted);
      } catch (err) {
        console.error("Erreur chargement des données :", err);
      }
    };

    loadEvents();
  }, [darkMode]); // Recharger les événements si on change le mode

  const handleCreateNewEvent = (newEvent: CalendarEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.start === updatedEvent.start && ev.title === updatedEvent.title
          ? updatedEvent
          : ev
      )
    );
  };

  const handleDeleteEvent = async (eventToDelete: CalendarEvent) => {
    setEvents((prev) =>
      prev.filter(
        (ev) =>
          ev.start !== eventToDelete.start || ev.title !== eventToDelete.title
      )
    );

    const response = await fetch("/api/custom-events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: eventToDelete.title,
        start: eventToDelete.start,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Événement supprimé avec succès");
    } else {
      console.error("Erreur lors de la suppression de l'événement");
    }
  };

  useEffect(() => {
    const btnEl = document.querySelector(".fc-toggleTheme-button");

    if (btnEl) {
      let container = btnEl.querySelector("#react-theme-toggle");

      if (!container) {
        container = document.createElement("div");
        container.id = "react-theme-toggle";

        btnEl.innerHTML = ""; // vide le contenu natif du bouton FullCalendar
        btnEl.appendChild(container);

        themeButtonRootRef.current = createRoot(container);
      }

      if (themeButtonRootRef.current) {
        themeButtonRootRef.current.render(
          <ThemeToggleButton
            darkMode={darkMode}
            toggle={() => setDarkMode((prev) => !prev)}
          />
        );
      }
    }
  }, [darkMode]);

  return (
    <div className="p-4">
      <FullCalendar
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        locale={frLocale}
        nowIndicator={true}
        timeZone="Europe/Paris"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        editable={true}
        dateClick={(info: DateClickArg) => {
          setSelectedDate(info.dateStr);
          setEventToEdit(null);
          setIsModalOpen(true);
        }}
        eventClick={(info: EventClickArg) => {
          const clickedEvent = {
            title: info.event.title,
            start: info.event.startStr,
            end: info.event.endStr ?? undefined,
            backgroundColor: info.event.backgroundColor,
            borderColor: info.event.borderColor,
            category: info.event.extendedProps.category,
          };
          setEventToEdit(clickedEvent);
          setSelectedDate(clickedEvent.start);
          setIsModalOpen(true);
        }}
        eventDrop={(info) => {
          const updated = {
            title: info.event.title,
            originalStart: info.oldEvent.startStr,
            start: info.event.startStr,
            end: info.event.endStr,
          };

          fetch("/api/custom-events", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          });
        }}
        eventResize={(info) => {
          const updated = {
            title: info.event.title,
            originalStart: info.event.startStr,
            start: info.event.startStr,
            end: info.event.endStr,
          };

          fetch("/api/custom-events", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          });
        }}
        contentHeight={600}
        customButtons={{
          toggleTheme: {
            text: "", // on injecte une icône manuellement ensuite
            click: () => setDarkMode((prev) => !prev),
          },
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "toggleTheme timeGridWeek,dayGridMonth",
        }}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        onCreate={handleCreateNewEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        eventToEdit={eventToEdit}
      />
    </div>
  );
}
