import type { AudioData } from "./AudioData";

export interface Song {
  sequenceIndex: number;
  songTitle: string;
  artist: string;
  albumTitle: string;
  genre: string;
  likes: number;
  audioData: AudioData;
  cover: string;
  review: string;
}

