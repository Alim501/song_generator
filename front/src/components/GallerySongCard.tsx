import type { Song } from "../types/Song";
import type { Translations } from "../i18n";
import SongPlayer from "./SongPlayer";
import SongCover from "./SongCover";

interface GallerySongCardProps {
  song: Song;
  t: Translations;
}

function GallerySongCard({ song, t }: GallerySongCardProps) {
  return (
    <div className="group rounded-2xl bg-bg-secondary border border-white/5 p-5 hover:border-accent/20 transition-colors flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {song.genre}
        </span>
        <span className="text-xs text-text-muted">{t.likes(song.likes)}</span>
      </div>

      <SongCover
        seed={song.sequenceIndex}
        title={song.songTitle}
        artist={song.artist}
        coverUrl={song.cover}
        className="w-full aspect-square rounded-xl object-cover mb-4"
      />

      <h4 className="text-sm font-semibold text-text-primary truncate">
        {song.sequenceIndex}.{song.songTitle}
      </h4>
      <p className="text-sm text-text-secondary truncate">{song.artist}</p>
      <p className="text-xs text-text-muted truncate mb-3">{song.albumTitle}</p>

      <div className="mt-auto pt-3 border-t border-white/5">
        <SongPlayer song={song} t={t} />
      </div>
    </div>
  );
}

export default GallerySongCard;
