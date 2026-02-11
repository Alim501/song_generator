import { Injectable } from '@nestjs/common';
import { GenerateSongDto } from './dto/GenerateSongDto.dto';
import {
  Note,
  Song,
  SongResponseDto,
  SongSection,
} from './dto/SongResponseDto.dto';
import { faker, fakerRU } from '@faker-js/faker';
import seedrandom from 'seedrandom';
import { Scale } from '@tonaljs/tonal';

interface GenreParams {
  tempoRange: [number, number];
  progressions: string[][];
  structure: Array<{ name: string; bars: number }>;
  rhythmStyle: 'smooth' | 'energetic' | 'heavy';
}

@Injectable()
export class AppService {
  getSongs(dto: GenerateSongDto): SongResponseDto[] {
    const pageSize = 20;
    const combinedSeed = dto.seed + dto.page;

    const fakerInstance = dto.localization === 'ru' ? fakerRU : faker;
    fakerInstance.seed(combinedSeed);

    const songs: SongResponseDto[] = [];
    const startIndex = (dto.page - 1) * pageSize + 1;

    for (let i = 0; i < pageSize; i++) {
      const songSeed = combinedSeed + i;
      const genre = fakerInstance.music.genre();
      let songTitle = fakerInstance.lorem.words({ min: 2, max: 4 });
      songTitle = songTitle.charAt(0).toUpperCase() + songTitle.slice(1);
      const artist = fakerInstance.person.fullName();
      let albumTitle = fakerInstance.lorem.words({ min: 1, max: 2 });
      albumTitle = albumTitle.charAt(0).toUpperCase() + albumTitle.slice(1);
      albumTitle =
        Math.random() > 0.1
          ? albumTitle
          : dto.localization === 'ru'
            ? 'Сингл'
            : 'Single';

      songs.push({
        sequenceIndex: startIndex + i,
        songTitle,
        artist,
        albumTitle,
        genre,
        likes: this.generateLikes(dto.likes, songSeed),
        audioData: this.generateSong(songSeed, genre),
        cover: this.generateCover(songSeed, songTitle, artist),
        review: this.generateReview(songSeed, fakerInstance),
      });
    }

    return songs;
  }

  private generateLikes(avgLikes: number, songSeed: number): number {
    if (avgLikes === 0) return 0;
    if (avgLikes === 10) return 10;

    const rng = seedrandom(songSeed.toString());

    const wholePart = Math.floor(avgLikes);
    const fractionalPart = avgLikes - wholePart;

    const extra = rng() < fractionalPart ? 1 : 0;

    return wholePart + extra;
  }

  private generateSong(seed: number, genre: string): Song {
    const rng = seedrandom(seed.toString());

    const genreParams = this.getGenreParams(genre);

    const keys = ['C major', 'G major', 'D major', 'A minor', 'E minor'];
    const key = keys[Math.floor(rng() * keys.length)];
    const scale = Scale.get(key).notes;

    const tempo =
      genreParams.tempoRange[0] +
      Math.floor(
        rng() * (genreParams.tempoRange[1] - genreParams.tempoRange[0]),
      );

    const chords = genreParams.progressions[
      Math.floor(rng() * genreParams.progressions.length)
    ].map((roman) => this.romanToChord(roman, key));

    const structure: SongSection[] = genreParams.structure.map((section) => ({
      ...section,
      chords: chords,
      melody: [],
    }));

    let currentTime = 0;
    const beatDuration = 60 / tempo;

    structure.forEach((section) => {
      section.melody = this.generateMelody(
        rng,
        scale,
        section.bars * 4,
        currentTime,
        beatDuration,
        genreParams.rhythmStyle,
      );
      currentTime += section.bars * 4 * beatDuration;
    });

    return {
      tempo,
      key,
      timeSignature: '4/4',
      structure,
    };
  }

  private getGenreParams(genre: string): GenreParams {
    const genreLower = genre.toLowerCase();

    if (genreLower.includes('rock') || genreLower.includes('metal')) {
      return {
        tempoRange: [120, 160],
        progressions: [
          ['I', 'V', 'vi', 'IV'],
          ['I', 'IV', 'V', 'V'],
        ],
        structure: [
          { name: 'intro', bars: 4 },
          { name: 'verse', bars: 8 },
          { name: 'chorus', bars: 8 },
          { name: 'verse', bars: 8 },
          { name: 'chorus', bars: 8 },
          { name: 'bridge', bars: 4 },
          { name: 'chorus', bars: 8 },
        ],
        rhythmStyle: 'energetic',
      };
    }

    if (genreLower.includes('jazz') || genreLower.includes('blues')) {
      return {
        tempoRange: [80, 120],
        progressions: [
          ['I', 'IV', 'I', 'V'],
          ['I', 'vi', 'ii', 'V'],
        ],
        structure: [
          { name: 'intro', bars: 4 },
          { name: 'verse', bars: 12 },
          { name: 'chorus', bars: 8 },
          { name: 'verse', bars: 12 },
        ],
        rhythmStyle: 'smooth',
      };
    }

    if (genreLower.includes('pop') || genreLower.includes('dance')) {
      return {
        tempoRange: [100, 130],
        progressions: [
          ['I', 'V', 'vi', 'IV'],
          ['vi', 'IV', 'I', 'V'],
        ],
        structure: [
          { name: 'intro', bars: 4 },
          { name: 'verse', bars: 8 },
          { name: 'chorus', bars: 8 },
          { name: 'verse', bars: 8 },
          { name: 'chorus', bars: 8 },
        ],
        rhythmStyle: 'energetic',
      };
    }

    return {
      tempoRange: [60, 100],
      progressions: [
        ['I', 'IV', 'V', 'I'],
        ['I', 'vi', 'IV', 'V'],
      ],
      structure: [
        { name: 'intro', bars: 8 },
        { name: 'main', bars: 16 },
        { name: 'outro', bars: 8 },
      ],
      rhythmStyle: 'smooth',
    };
  }

  private generateMelody(
    rng: () => number,
    scale: string[],
    beats: number,
    startTime: number,
    beatDuration: number,
    style: 'smooth' | 'energetic' | 'heavy',
  ): Note[] {
    const melody: Note[] = [];
    const octaves = [4, 5];

    const rhythms =
      style === 'smooth'
        ? [
            ['4n', '4n', '2n'],
            ['4n', '8n', '8n', '4n'],
          ]
        : style === 'energetic'
          ? [
              ['8n', '8n', '8n', '8n'],
              ['16n', '16n', '8n', '8n'],
            ]
          : [['4n', '4n', '4n', '4n']];

    const rhythm = rhythms[Math.floor(rng() * rhythms.length)];

    let time = startTime;
    let rhythmIndex = 0;

    for (let i = 0; i < beats; i++) {
      const note = scale[Math.floor(rng() * scale.length)];
      const octave = octaves[Math.floor(rng() * octaves.length)];
      const pitch = note + octave;
      const duration = rhythm[rhythmIndex % rhythm.length];
      rhythmIndex++;

      const playProbability = style === 'energetic' ? 0.9 : 0.7;

      if (rng() < playProbability) {
        melody.push({ pitch, duration, time });
      }

      const durationValue = this.parseDuration(duration, beatDuration);
      time += durationValue;
    }

    return melody;
  }

  private romanToChord(roman: string, key: string): string {
    const scaleNotes = Scale.get(key).notes;

    const romanMap: { [key: string]: number } = {
      I: 0,
      II: 1,
      III: 2,
      IV: 3,
      V: 4,
      VI: 5,
      VII: 6,
      i: 0,
      ii: 1,
      iii: 2,
      iv: 3,
      v: 4,
      vi: 5,
      vii: 6,
    };

    const index = romanMap[roman];
    const chordRoot = scaleNotes[index];

    const isMinor = roman === roman.toLowerCase();
    const chordType = isMinor ? 'm' : '';

    return chordRoot + chordType;
  }

  private parseDuration(duration: string, beatDuration: number): number {
    const durationMap: { [key: string]: number } = {
      '1n': beatDuration * 4,
      '2n': beatDuration * 2,
      '4n': beatDuration,
      '8n': beatDuration / 2,
      '16n': beatDuration / 4,
    };

    return durationMap[duration] || beatDuration;
  }

  private generateCover(seed: number, title: string, artist: string): string {
    const seedStr = encodeURIComponent(`${title}-${artist}-${seed}`);
    return `https://api.dicebear.com/9.x/shapes/svg?seed=${seedStr}&size=300`;
  }

  private generateReview(seed: number, fakerInstance: typeof faker): string {
    const rng = seedrandom(('review' + seed).toString());
    fakerInstance.seed(Math.floor(rng() * 1000000));
    return fakerInstance.lorem.sentences({ min: 2, max: 4 });
  }
}
