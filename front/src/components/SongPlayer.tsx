import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import type { Song } from "../types/Song";
import type { Translations } from "../i18n";

interface SongPlayerProps {
  song: Song;
  t: Translations;
}

function SongPlayer({ song, t: i18n }: SongPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const durationRef = useRef(0);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const duration = useMemo(() => {
    const notes = song.audioData.structure.flatMap((section) => section.melody);
    if (notes.length > 0) {
      const lastNote = notes[notes.length - 1];
      return lastNote.time + 1;
    }
    return 0;
  }, [song]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Reset buffer when song changes
  useEffect(() => {
    bufferRef.current = null;
  }, [song]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setPlaying(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
    };
  }, []);

  async function renderToBuffer(): Promise<AudioBuffer> {
    if (bufferRef.current) return bufferRef.current;

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

    const toneBuffer = await Tone.Offline(({ transport }) => {
      transport.bpm.value = song.audioData.tempo;
      const synth = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: { type: "triangle" },
        filter: { frequency: 800, type: "lowpass", rolloff: -24 },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1.5 },
        filterEnvelope: {
          attack: 0.05,
          decay: 0.5,
          sustain: 0.2,
          baseFrequency: 300,
          octaves: 2,
        },
      }).toDestination();
      synth.volume.value = -8;
      notes.forEach((n) => {
        synth.triggerAttackRelease(n.pitch, n.duration, n.time);
      });
      transport.start();
    }, dur);

    const audioBuffer = toneBuffer.get() as AudioBuffer;
    bufferRef.current = audioBuffer;
    return audioBuffer;
  }

  function updateProgress() {
    if (!ctxRef.current) return;
    const elapsed = ctxRef.current.currentTime - startTimeRef.current;
    const pct = Math.min(elapsed / durationRef.current, 1);
    setProgress(pct);
    if (pct < 1) {
      rafRef.current = requestAnimationFrame(updateProgress);
    } else {
      stop();
    }
  }

  async function handlePlay() {
    if (playing) {
      stop();
      return;
    }

    setLoading(true);
    try {
      const audioBuffer = await renderToBuffer();

      const ctx = new AudioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      ctxRef.current = ctx;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => stop();

      startTimeRef.current = ctx.currentTime;
      source.start();
      sourceRef.current = source;

      setPlaying(true);
      rafRef.current = requestAnimationFrame(updateProgress);
    } finally {
      setLoading(false);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setProgress(val);

    if (playing && ctxRef.current) {
      // Stop current, restart from new position
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }

      const seekTime = val * durationRef.current;
      const buf = bufferRef.current;
      if (!buf) return;

      const ctx = ctxRef.current;
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.connect(ctx.destination);
      source.onended = () => stop();

      startTimeRef.current = ctx.currentTime - seekTime;
      source.start(0, seekTime);
      sourceRef.current = source;
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex items-center gap-2 w-full min-w-0">
      <button
        onClick={handlePlay}
        disabled={loading}
        className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          playing
            ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
            : "bg-accent/10 text-accent hover:bg-accent/20"
        }`}
        title={playing ? i18n.stop : i18n.play}
      >
        {loading ? (
          <div className="size-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        ) : playing ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4"
          >
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4"
          >
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        )}
      </button>

      <span className="text-[10px] text-text-muted w-8 text-right flex-shrink-0">
        {formatTime(progress * duration)}
      </span>

      <input
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={progress}
        onChange={handleSeek}
        className="flex-1 min-w-0 h-1 appearance-none bg-white/10 rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer"
      />

      <span className="text-[10px] text-text-muted w-8 flex-shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
}

export default SongPlayer;
