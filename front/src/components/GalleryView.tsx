import { useEffect, useRef } from "react";
import type { Song } from "../types/Song";
import type { Translations } from "../i18n";
import GallerySongCard from "./GallerySongCard";

interface GalleryViewProps {
  songs: Song[];
  loading: boolean;
  hasMore: boolean;
  t: Translations;
  onLoadMore: () => void;
}

function GalleryView({ songs, loading, hasMore, t, onLoadMore }: GalleryViewProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song) => (
          <GallerySongCard key={song.sequenceIndex} song={song} t={t} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="flex justify-center py-8">
          <div className="size-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && songs.length > 0 && (
        <p className="text-center text-text-muted text-xs mt-6">
          {t.noMoreTracks}
        </p>
      )}
    </div>
  );
}

export default GalleryView;
