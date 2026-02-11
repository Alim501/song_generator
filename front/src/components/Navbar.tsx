import type { Translations } from "../i18n";

interface NavbarProps {
  t: Translations;
  onLocalizationChange?: (locale: string) => void;
}

function Navbar({ t, onLocalizationChange }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-10 backdrop-blur-md bg-bg-primary/80 border-b border-white/5">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">
            {t.musicGenerator}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-text-secondary">EN</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              onChange={(e) =>
                onLocalizationChange?.(e.target.checked ? "ru" : "en")
              }
            />
            <div className="w-9 h-5 rounded-full bg-bg-tertiary peer-checked:bg-accent transition-colors" />
            <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
          </label>
          <span className="text-text-secondary">RU</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
