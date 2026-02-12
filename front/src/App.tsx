import { useState } from "react";
import * as Tone from "tone";
import JSZip from "jszip";
import { Mp3Encoder } from "@breezystack/lamejs";
import Navbar from "./components/Navbar";
import SeedGenerator from "./components/SeedGenerator";
import TableView from "./components/TableView";
import GalleryView from "./components/GalleryView";
import type { Song } from "./types/Song";
import { t, type Locale } from "./i18n";

type ViewMode = "table" | "gallery";
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [seed, setSeed] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [view, setView] = useState<ViewMode>("table");
  const [likes, setLikes] = useState(5);

  const [tableSongs, setTableSongs] = useState<Song[]>([]);
  const [tablePage, setTablePage] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableHasMore, setTableHasMore] = useState(true);

  const [gallerySongs, setGallerySongs] = useState<Song[]>([]);
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryHasMore, setGalleryHasMore] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const i18n = t(locale);

  async function fetchSongs(
    seedStr: string,
    page: number,
    loc: string,
    likesVal: number
  ): Promise<Song[]> {
    const seedNumber = parseInt(seedStr.replace("0x", ""), 16);
    const res = await fetch(
      `${API_URL}/?seed=${seedNumber}&page=${page}&likes=${likesVal}&localization=${loc}`
    );
    if (!res.ok) throw new Error(`${i18n.error}: ${res.status}`);
    return res.json();
  }

  async function loadTablePage(seedStr: string, page: number, loc: string, likesVal: number) {
    setTableLoading(true);
    setError(null);
    try {
      const data = await fetchSongs(seedStr, page, loc, likesVal);
      setTableSongs(data);
      setTableHasMore(data.length > 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.error);
    } finally {
      setTableLoading(false);
    }
  }

  async function loadGalleryPage(
    seedStr: string,
    page: number,
    loc: string,
    likesVal: number,
    reset: boolean
  ) {
    setGalleryLoading(true);
    setError(null);
    try {
      const data = await fetchSongs(seedStr, page, loc, likesVal);
      setGallerySongs((prev) => (reset ? data : [...prev, ...data]));
      setGalleryHasMore(data.length > 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n.error);
    } finally {
      setGalleryLoading(false);
    }
  }

  function handleSeedChange(newSeed: string) {
    setSeed(newSeed);
    setTableSongs([]);
    setTablePage(1);
    setTableHasMore(true);
    setGallerySongs([]);
    setGalleryPage(1);
    setGalleryHasMore(true);
    setError(null);
    loadTablePage(newSeed, 1, locale, likes);
    loadGalleryPage(newSeed, 1, locale, likes, true);
  }

  function handleLikesChange(newLikes: number) {
    setLikes(newLikes);
    if (seed) {
      loadTablePage(seed, tablePage, locale, newLikes);
      loadGalleryPage(seed, 1, locale, newLikes, true);
      setGalleryPage(1);
    }
  }

  function handleLocaleChange(newLocale: string) {
    const loc = newLocale as Locale;
    setLocale(loc);
    if (seed) {
      loadTablePage(seed, tablePage, loc, likes);
      loadGalleryPage(seed, 1, loc, likes, true);
      setGalleryPage(1);
    }
  }

  function handleTablePageChange(newPage: number) {
    if (!seed) return;
    setTablePage(newPage);
    loadTablePage(seed, newPage, locale, likes);
  }

  function handleLoadMoreGallery() {
    if (!seed || galleryLoading || !galleryHasMore) return;
    const nextPage = galleryPage + 1;
    setGalleryPage(nextPage);
    loadGalleryPage(seed, nextPage, locale, likes, false);
  }

  const songs = view === "table" ? tableSongs : gallerySongs;
  const loading = view === "table" ? tableLoading : galleryLoading;

  async function renderSongToBuffer(song: Song): Promise<AudioBuffer> {
    const notes = song.audioData.structure.flatMap((section) =>
      section.melody.map((note) => ({
        time: note.time,
        pitch: note.pitch,
        duration: note.duration,
      }))
    );
    if (notes.length === 0) {
      return new AudioBuffer({ length: 1, sampleRate: 44100, numberOfChannels: 1 });
    }
    const lastNote = notes[notes.length - 1];
    const dur = lastNote.time + 2;

    const buffer = await Tone.Offline(({ transport }) => {
      transport.bpm.value = song.audioData.tempo;
      const synth = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: { type: "triangle" },
        filter: { frequency: 800, type: "lowpass", rolloff: -24 },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1.5 },
        filterEnvelope: {
          attack: 0.05, decay: 0.5, sustain: 0.2,
          baseFrequency: 300, octaves: 2,
        },
      }).toDestination();
      synth.volume.value = -8;
      notes.forEach((n) => {
        synth.triggerAttackRelease(n.pitch, n.duration, n.time);
      });
      transport.start();
    }, dur);
    return buffer.get() as AudioBuffer;
  }

  function encodeToMp3(audioBuffer: AudioBuffer): Uint8Array {
    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    const encoder = new Mp3Encoder(numChannels, sampleRate, 128);
    const left = audioBuffer.getChannelData(0);
    const right = numChannels > 1 ? audioBuffer.getChannelData(1) : left;
    const sampleBlockSize = 1152;
    const mp3Data: Uint8Array[] = [];

    const toInt16 = (floatArr: Float32Array): Int16Array => {
      const int16 = new Int16Array(floatArr.length);
      for (let i = 0; i < floatArr.length; i++) {
        const s = Math.max(-1, Math.min(1, floatArr[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return int16;
    };

    const leftInt16 = toInt16(left);
    const rightInt16 = toInt16(right);

    for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
      const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }

    const end = encoder.flush();
    if (end.length > 0) mp3Data.push(end);

    const totalLength = mp3Data.reduce((sum, buf) => sum + buf.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of mp3Data) {
      result.set(new Uint8Array(buf.buffer, buf.byteOffset, buf.length), offset);
      offset += buf.length;
    }
    return result;
  }

  async function handleExport() {
    const songsToExport = view === "table" ? tableSongs : gallerySongs;
    if (songsToExport.length === 0) return;

    setExporting(true);
    try {
      const zip = new JSZip();

      for (const song of songsToExport) {
        const audioBuffer = await renderSongToBuffer(song);
        const mp3Data = encodeToMp3(audioBuffer);
        const filename = `${song.songTitle} - ${song.albumTitle} - ${song.artist}.mp3`;
        zip.file(filename, mp3Data);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "songs.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      setError(e instanceof Error ? e.message : i18n.error);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar t={i18n} onLocalizationChange={handleLocaleChange} />
      <SeedGenerator
        t={i18n}
        onSeedChange={handleSeedChange}
        onLikesChange={handleLikesChange}
      />

      <section className="max-w-5xl mx-auto px-6 pb-12">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        {seed && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex rounded-lg bg-bg-secondary border border-white/5 p-1">
                <button
                  onClick={() => setView("table")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    view === "table"
                      ? "bg-accent text-white"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {i18n.table}
                </button>
                <button
                  onClick={() => setView("gallery")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    view === "gallery"
                      ? "bg-accent text-white"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {i18n.gallery}
                </button>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting || songs.length === 0}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {i18n.exporting}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {i18n.exportZip}
                  </>
                )}
              </button>
            </div>

            {view === "table" ? (
              <TableView
                songs={tableSongs}
                page={tablePage}
                loading={tableLoading}
                hasMore={tableHasMore}
                t={i18n}
                onPageChange={handleTablePageChange}
              />
            ) : (
              <GalleryView
                songs={gallerySongs}
                loading={galleryLoading}
                hasMore={galleryHasMore}
                t={i18n}
                onLoadMore={handleLoadMoreGallery}
              />
            )}

            {loading && songs.length === 0 && (
              <div className="flex justify-center py-12">
                <div className="size-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {!seed && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-30">&#9835;</div>
            <p className="text-text-muted text-sm">{i18n.generateToDiscover}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
