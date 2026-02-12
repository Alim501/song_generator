import { useState } from "react";
import type { Song } from "../types/Song";
import type { Translations } from "../i18n";
import SongPlayer from "./SongPlayer";
import SongCover from "./SongCover";

interface TableSongRowProps {
  song: Song;
  t: Translations;
}

function TableSongRow({ song, t }: TableSongRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group rounded-xl bg-bg-secondary border border-white/5 hover:border-accent/20 transition-colors">
      <div
        className="flex items-start justify-between gap-4 p-4 cursor-pointer select-none"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-start gap-4 min-w-0">
          <SongCover
            seed={song.sequenceIndex}
            title={song.songTitle}
            artist={song.artist}
            coverUrl={song.cover}
            className="flex-shrink-0 size-10 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-text-primary truncate">
               {song.sequenceIndex}.{song.songTitle}
            </h4>
            <p className="text-sm text-text-secondary truncate">
              {song.artist}
            </p>
            <p className="text-xs text-text-muted truncate">
              {song.albumTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-text-secondary">
            {t.likes(song.likes)}
          </span>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {song.genre}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`size-4 text-text-muted transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-white/5 pt-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              <SongCover
                seed={song.sequenceIndex}
                title={song.songTitle}
                artist={song.artist}
                coverUrl={song.cover}
                className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <SongPlayer song={song} t={t} />
                <div>
                  <h5 className="text-xs font-medium text-text-secondary mb-1">
                    {t.review}
                  </h5>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {song.review}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableSongRow;
