import type { SongSection } from "./SongSection";

export interface AudioData {
  tempo: number;
  key: string;
  timeSignature: string;
  structure: SongSection[];
}
