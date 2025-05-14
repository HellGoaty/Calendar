// EventModal.tsx
"use client";

import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";

type CalendarEvent = {
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  category?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: CalendarEvent) => void;
  onUpdate: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  date: string | null;
  eventToEdit?: CalendarEvent | null;
};

export default function CreateEventModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  date,
  eventToEdit,
}: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("perso");
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (isOpen) {
      setTitle(eventToEdit?.title ?? "");
      setCategory(eventToEdit?.category ?? "perso");
      setColor(eventToEdit?.backgroundColor ?? "#3b82f6");
    }
  }, [isOpen, eventToEdit]);

  const handleSubmit = async () => {
    if (!title || !date) return;

    const newEvent: CalendarEvent = {
      title,
      start: date,
      backgroundColor: color,
      borderColor: color,
      category,
    };

    const endpoint = "/api/custom-events";
    const method = eventToEdit ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });

    const result = await res.json();
    if (result.success) {
      if (eventToEdit) {
        onUpdate(newEvent);
      } else {
        onCreate(newEvent);
      }
      onClose();
    } else {
      console.error("Erreur lors de la sauvegarde");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">
            {eventToEdit ? "Modifier l’événement" : "Créer un événement"}
          </Dialog.Title>

          <input
            type="text"
            className="w-full border p-2 rounded mb-3"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded mb-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="perso">Perso</option>
            <option value="travail">Travail</option>
            <option value="rdv">RDV</option>
          </select>

          <input
            type="color"
            className="w-full mb-4"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <div className="flex justify-center gap-2">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
              Annuler
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleSubmit}
            >
              {eventToEdit ? "Mettre à jour" : "Créer"}
            </button>
            <button
              className="px-4 py-2 bg-red-700 text-white rounded"
              onClick={() => {
                if (eventToEdit) {
                  onDelete(eventToEdit);
                }
              }}
            >
              Supprimer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
