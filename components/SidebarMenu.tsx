import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type CalendarEvent = {
  id?: string;
  title: string;
  start: string;
  category?: string;
};

type Props = {
  events: CalendarEvent[];
  onGoToNextMatch: () => void;
  onFilterChange: (category: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function SidebarMenu({
  events,
  onGoToNextMatch,
  onFilterChange,
  isOpen,
  onClose,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [nextMatch, setNextMatch] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const upcomingMatch = events
      .filter((e) => e.category === "match" && new Date(e.start) > new Date())
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      )[0];

    setNextMatch(upcomingMatch || null);
  }, [events]);

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: isOpen ? 0 : "-100%" }}
      transition={{ type: "tween", duration: 0.7, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-72 h-full bg-white text-white dark:bg-gray-800 shadow-lg z-50 p-4 rounded-r-2xl"
    >
      <button onClick={onClose} className="mb-4 text-lg cursor-pointer">
        x
      </button>

      {/* Prochain match */}
      {nextMatch ? (
        <div className="mt-8">
          <h3 className="font-semibold">Prochain match :</h3>
          <div className="flex items-center gap-3">
            <p className="text-sm">{nextMatch.title}</p>
            <button
              onClick={onGoToNextMatch}
              className="text-sm text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-500 dark:hover:bg-blue-600 px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              Voir
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">Aucun match à venir.</p>
      )}

      {/* Filtres par catégorie */}
      <h3 className="font-semibold mb-1 mt-8">Filtrer par catégorie</h3>
      <div className="flex flex-col gap-1">
        {["perso", "travail", "rdv", "match"].map((cat) => (
          <button
            key={cat}
            className={`text-left px-2 py-1 rounded cursor-pointer first-letter:capitalize ${
              selectedCategory === cat
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => {
              const newCat = selectedCategory === cat ? null : cat;
              setSelectedCategory(newCat);
              onFilterChange(newCat);
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
