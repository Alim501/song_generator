import type { Note } from "./Note";

export interface SongSection {
  name: string;
  bars: number;
  chords: string[];
  melody: Note[];
}
