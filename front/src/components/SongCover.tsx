import { useEffect, useRef } from "react";

interface CoverProps {
  seed: number;
  title: string;
  artist: string;
  coverUrl: string;
  className?: string;
}

function SongCover({ seed, title, artist, coverUrl, className }: CoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = coverUrl;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      ctx.drawImage(img, 0, 0, 600, 600);

      const grad = ctx.createLinearGradient(0, 350, 0, 600);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 350, 600, 250);

      ctx.fillStyle = "white";
      ctx.font = "bold 42px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(title, 30, 510, 540);

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "24px sans-serif";
      ctx.fillText(artist, 30, 550, 540);
    };
  }, [seed, title, artist, coverUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className={className}
    />
  );
}

export default SongCover;
