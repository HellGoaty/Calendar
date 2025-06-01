// EventModal.tsx
"use client";

import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";

type CalendarEvent = {
  id?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(eventToEdit?.title ?? "");
      setCategory(eventToEdit?.category ?? "perso");
      setColor(eventToEdit?.backgroundColor ?? "#3b82f6");
    }
  }, [isOpen, eventToEdit]);

  const getDefaultColor = (cat: string) => {
    switch (cat) {
      case "travail":
        return "#f59e0b"; // orange
      case "rdv":
        return "#10b981"; // vert
      case "match":
        return "#ef4444"; // rouge
      default:
        return "#3b82f6"; // bleu par défaut
    }
  };

  useEffect(() => {
    setColor(getDefaultColor(category));
  }, [category, eventToEdit]);

  const handleSubmit = async () => {
    if (!title || !date) return;

    setIsLoading(true); // start loading

    const newEvent: CalendarEvent = {
      title,
      start: date,
      backgroundColor: color,
      borderColor: color,
      category,
    };

    const endpoint = "/api/custom-events";
    const method = eventToEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          eventToEdit ? { ...newEvent, id: eventToEdit.id } : newEvent
        ),
      });

      const result = await res.json();

      if (result.success) {
        if (eventToEdit) {
          onUpdate({ ...newEvent, id: eventToEdit.id });
        } else {
          onCreate(result.event);
        }
        onClose();
      } else {
        console.error("Erreur lors de la sauvegarde");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false); // stop loading
    }
  };

  const handleDelete = async () => {
    console.log("bonjour");

    if (!eventToEdit || isLoading) return;

    setDeleting(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/custom-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventToEdit),
      });

      const result = await res.json();

      if (result.success) {
        onDelete(eventToEdit);
        onClose();
      } else {
        alert(
          "Erreur lors de la suppression : " +
            (result.message || "Erreur inconnue")
        );
      }
    } catch (err) {
      alert("Erreur réseau lors de la suppression");
      console.log(err);
    } finally {
      setIsLoading(false);
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">
            {eventToEdit ? "Modifier l’événement" : "Créer un événement"}
          </Dialog.Title>

          {/* AJOUT DU FORMULAIRE */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded mb-3"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />

            <select
              className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-gray-700 text-black dark:text-white p-2 rounded mb-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            >
              <option value="perso">Perso</option>
              <option value="travail">Travail</option>
              <option value="rdv">RDV</option>
              <option value="match">Matchs</option>
            </select>

            <input
              type="color"
              className="w-full mb-4"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={isLoading}
            />

            {isLoading && (
              <div className="mb-4 text-center text-blue-600 font-semibold">
                Chargement...
              </div>
            )}

            <div className="flex justify-center gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </button>

              {eventToEdit && (
                <button
                  type="button"
                  className="px-4 py-2 bg-red-700 text-white rounded"
                  onClick={handleDelete}
                  disabled={isLoading || deleting}
                >
                  Supprimer
                </button>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={isLoading}
              >
                {eventToEdit ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
