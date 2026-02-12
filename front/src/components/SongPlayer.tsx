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
  const [progress, setProgress] = useState(0);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partRef = useRef<Tone.Part | null>(null);
  const rafRef = useRef<number>(0);
  const durationRef = useRef(0);

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

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    partRef.current?.stop();
    partRef.current?.dispose();
    partRef.current = null;
    synthRef.current?.dispose();
    synthRef.current = null;
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    setPlaying(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      partRef.current?.stop();
      partRef.current?.dispose();
      synthRef.current?.dispose();
      Tone.getTransport().stop();
    };
  }, []);

  function updateProgress() {
    const elapsed = Tone.getTransport().seconds;
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

    await Tone.start();
    const ctx = Tone.getContext().rawContext;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    Tone.getTransport().bpm.value = song.audioData.tempo;

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
    synthRef.current = synth;

    const notes = song.audioData.structure.flatMap((section) =>
      section.melody.map((note) => ({
        time: note.time,
        pitch: note.pitch,
        duration: note.duration,
      }))
    );

    if (notes.length === 0) {
      synth.dispose();
      return;
    }

    const events = notes.map((n) => ({
      time: n.time,
      pitch: n.pitch,
      dur: n.duration,
    }));

    const part = new Tone.Part((time, value) => {
      synth.triggerAttackRelease(value.pitch, value.dur, time);
    }, events);
    partRef.current = part;

    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    part.start(0);
    Tone.getTransport().start();
    setPlaying(true);
    rafRef.current = requestAnimationFrame(updateProgress);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setProgress(val);

    if (playing) {
      const seekTime = val * durationRef.current;
      Tone.getTransport().seconds = seekTime;
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={handlePlay}
        className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          playing
            ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
            : "bg-accent/10 text-accent hover:bg-accent/20"
        }`}
        title={playing ? i18n.stop : i18n.play}
      >
        {playing ? (
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
        className="flex-1 h-1 appearance-none bg-white/10 rounded-full cursor-pointer
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
