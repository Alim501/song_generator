import type { Song } from "../types/Song";
import type { Translations } from "../i18n";
import TableSongRow from "./TableSongRow";

interface TableViewProps {
  songs: Song[];
  page: number;
  loading: boolean;
  hasMore: boolean;
  t: Translations;
  onPageChange: (page: number) => void;
}

function TableView({ songs, page, loading, hasMore, t, onPageChange }: TableViewProps) {
  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="size-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {songs.map((song) => (
            <TableSongRow key={song.sequenceIndex} song={song} t={t} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg bg-bg-secondary border border-white/5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-accent/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t.previous}
        </button>
        <span className="text-sm font-medium text-text-muted tabular-nums">
          {t.page(page)}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore}
          className="rounded-lg bg-bg-secondary border border-white/5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-accent/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t.next}
        </button>
      </div>
    </div>
  );
}

export default TableView;
