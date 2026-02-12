import { useState } from "react";
import type { Translations } from "../i18n";

interface SeedGeneratorProps {
  t: Translations;
  onSeedChange?: (seed: string) => void;
  onLikesChange?: (likes: number) => void;
}

function generateRandom64BitSeed(): string {
  const buffer = new Uint8Array(8);
  crypto.getRandomValues(buffer);
  const hex = Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return "0x" + hex;
}

function SeedGenerator({ t, onSeedChange, onLikesChange }: SeedGeneratorProps) {
  const [seed, setSeed] = useState("");
  const [likes, setLikes] = useState("");

  const handleGenerate = () => {
    const newSeed = generateRandom64BitSeed();
    setSeed(newSeed);
    onSeedChange?.(newSeed);
  };

  const handleInternalLikesChange = (rawValue: string) => {
    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
      setLikes(rawValue);

      const num = parseFloat(rawValue);
      if (!isNaN(num)) {
        onLikesChange?.(num);
      }
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <div className="rounded-2xl bg-bg-secondary border border-white/5 p-6 sm:p-8">
        <div className="flex gap-3 items-center mb-4">
          <input
            type="text"
            inputMode="decimal"
            min="0"
            value={likes}
            onChange={(e) => handleInternalLikesChange(e.target.value)}
            placeholder={t.inputLikes}
            className="flex-1 rounded-lg bg-bg-primary border border-white/10 px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <span className="text-sm text-text-primary">{t.inputLikes}</span>
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {t.generateSeed}
        </h2>
        <p className="text-sm text-text-muted mb-6">{t.seedDescription}</p>

        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder={t.seedPlaceholder}
            className="flex-1 min-w-0 rounded-lg bg-bg-primary border border-white/10 px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <div className="flex gap-3 flex-shrink-0">
            {seed && (
              <button
                onClick={() => onSeedChange?.(seed)}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors cursor-pointer"
              >
                {t.go}
              </button>
            )}
            <button
              onClick={handleGenerate}
              className="rounded-lg bg-accent/70 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent transition-colors cursor-pointer"
            >
              {t.random}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeedGenerator;
