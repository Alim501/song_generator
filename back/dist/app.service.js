"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const faker_1 = require("@faker-js/faker");
const seedrandom_1 = __importDefault(require("seedrandom"));
const tonal_1 = require("@tonaljs/tonal");
let AppService = class AppService {
    getSongs(dto) {
        const pageSize = 20;
        const combinedSeed = dto.seed + dto.page;
        const fakerInstance = dto.localization === 'ru' ? faker_1.fakerRU : faker_1.faker;
        fakerInstance.seed(combinedSeed);
        const songs = [];
        const startIndex = (dto.page - 1) * pageSize + 1;
        for (let i = 0; i < pageSize; i++) {
            const songSeed = combinedSeed + i;
            const genre = fakerInstance.music.genre();
            let songTitle = fakerInstance.lorem.words({ min: 2, max: 4 });
            songTitle =
                dto.localization === 'ru'
                    ? songTitle.charAt(0).toUpperCase() + songTitle.slice(1)
                    : faker_1.faker.music.songName();
            const artist = fakerInstance.person.fullName();
            let albumTitle = fakerInstance.lorem.words({ min: 1, max: 2 });
            albumTitle =
                dto.localization === 'ru'
                    ? albumTitle.charAt(0).toUpperCase() + albumTitle.slice(1)
                    : faker_1.faker.music.album();
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
    generateLikes(avgLikes, songSeed) {
        if (avgLikes === 0)
            return 0;
        if (avgLikes === 10)
            return 10;
        const rng = (0, seedrandom_1.default)(songSeed.toString());
        const wholePart = Math.floor(avgLikes);
        const fractionalPart = avgLikes - wholePart;
        const extra = rng() < fractionalPart ? 1 : 0;
        return wholePart + extra;
    }
    generateSong(seed, genre) {
        const rng = (0, seedrandom_1.default)(seed.toString());
        const genreParams = this.getGenreParams(genre);
        const keys = ['C major', 'G major', 'D major', 'A minor', 'E minor'];
        const key = keys[Math.floor(rng() * keys.length)];
        const scale = tonal_1.Scale.get(key).notes;
        const tempo = genreParams.tempoRange[0] +
            Math.floor(rng() * (genreParams.tempoRange[1] - genreParams.tempoRange[0]));
        const chords = genreParams.progressions[Math.floor(rng() * genreParams.progressions.length)].map((roman) => this.romanToChord(roman, key));
        const structure = genreParams.structure.map((section) => ({
            ...section,
            chords: chords,
            melody: [],
        }));
        let currentTime = 0;
        const beatDuration = 60 / tempo;
        structure.forEach((section) => {
            section.melody = this.generateMelody(rng, scale, section.bars * 4, currentTime, beatDuration, genreParams.rhythmStyle);
            currentTime += section.bars * 4 * beatDuration;
        });
        return {
            tempo,
            key,
            timeSignature: '4/4',
            structure,
        };
    }
    getGenreParams(genre) {
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
    generateMelody(rng, scale, beats, startTime, beatDuration, style) {
        const melody = [];
        const octaves = [4, 5];
        const rhythms = style === 'smooth'
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
    romanToChord(roman, key) {
        const scaleNotes = tonal_1.Scale.get(key).notes;
        const romanMap = {
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
    parseDuration(duration, beatDuration) {
        const durationMap = {
            '1n': beatDuration * 4,
            '2n': beatDuration * 2,
            '4n': beatDuration,
            '8n': beatDuration / 2,
            '16n': beatDuration / 4,
        };
        return durationMap[duration] || beatDuration;
    }
    generateCover(seed, title, artist) {
        const seedStr = encodeURIComponent(`${title}-${artist}-${seed}`);
        return `https://api.dicebear.com/9.x/shapes/svg?seed=${seedStr}&size=300`;
    }
    generateReview(seed, fakerInstance) {
        const rng = (0, seedrandom_1.default)(('review' + seed).toString());
        fakerInstance.seed(Math.floor(rng() * 1000000));
        return fakerInstance.lorem.sentences({ min: 2, max: 4 });
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map