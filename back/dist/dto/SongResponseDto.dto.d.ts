export declare class SongResponseDto {
    sequenceIndex: number;
    songTitle: string;
    artist: string;
    albumTitle: string;
    genre: string;
    likes: number;
    audioData: Song;
    cover: string;
    review: string;
}
export interface Song {
    tempo: number;
    key: string;
    timeSignature: string;
    structure: SongSection[];
}
export interface SongSection {
    name: string;
    bars: number;
    chords: string[];
    melody: Note[];
}
export interface Note {
    pitch: string;
    duration: string;
    time: number;
}
