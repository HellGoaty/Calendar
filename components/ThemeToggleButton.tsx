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
    <button onClick={toggle}>
      <FontAwesomeIcon
        icon={darkMode ? faSun : faMoon}
        className={darkMode ? "text-yellow-400" : "text-blue-700"}
      />
    </button>
  );
}
