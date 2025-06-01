import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

export default function ThemeToggleButton({
  darkMode,
  toggle,
}: {
  darkMode: boolean;
  toggle: () => void;
}) {
  return (
    <button onClick={toggle} className="w-5 h-[100%]">
      <FontAwesomeIcon
        onClick={toggle}
        icon={darkMode ? faSun : faMoon}
        className={
          darkMode
            ? "text-yellow-400 cursor-pointer"
            : "text-white cursor-pointer"
        }
      />
    </button>
  );
}
