/* ═══════════════════════════════════════════════════════════
   Reads the detection overlay burned into a recorded UAV video
   (top-left box: risk level, Rescuers Needed, Already Present,
   Dispatch Count) with in-browser OCR while the video plays.
   ═══════════════════════════════════════════════════════════ */

import { RefObject, useEffect, useRef, useState } from 'react';
import type { Worker } from 'tesseract.js';

export interface OverlayReading {
  risk: string | null;
  rescuersNeeded: number | null;
  alreadyPresent: number | null;
  dispatchCount: number | null;
  /** Position in the video, in seconds. */
  videoTime: number;
  readAt: string;
}

export type OverlayStatus = 'idle' | 'loading' | 'reading' | 'error';

const SAMPLE_MS = 1_000;
// The overlay box sits in the top-left ~23% x 21% of the frame; leave a little margin.
const CROP_W = 0.25;
const CROP_H = 0.22;
const UPSCALE = 2;

function num(text: string, label: RegExp): number | null {
  const m = text.match(new RegExp(label.source + String.raw`\s*[:;.]?\s*(\d+)`, 'i'));
  return m ? Number(m[1]) : null;
}

export function parseOverlay(text: string): Omit<OverlayReading, 'videoTime' | 'readAt'> {
  const risk = text.match(/\b(CRITICAL|HIGH|MEDIUM|LOW)\b/i)?.[1].toUpperCase() ?? null;
  return {
    risk,
    rescuersNeeded: num(text, /Rescuers?\s*Needed/),
    alreadyPresent: num(text, /Already\s*Present/),
    dispatchCount: num(text, /Dispatch\s*Count/)
  };
}

const sameValues = (a: OverlayReading, b: OverlayReading) =>
  a.risk === b.risk && a.rescuersNeeded === b.rescuersNeeded &&
  a.alreadyPresent === b.alreadyPresent && a.dispatchCount === b.dispatchCount;

/** Copies the overlay corner of the current frame, as black text on white, for OCR. */
function cropOverlay(video: HTMLVideoElement, canvas: HTMLCanvasElement): HTMLCanvasElement {
  const sw = Math.round(video.videoWidth * CROP_W);
  const sh = Math.round(video.videoHeight * CROP_H);
  canvas.width = sw * UPSCALE;
  canvas.height = sh * UPSCALE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(video, 0, 0, sw, sh, 0, 0, canvas.width, canvas.height);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = img.data;
  for (let i = 0; i < px.length; i += 4) {
    // Overlay text is white or a bright risk colour on a dark box: keep anything bright.
    const v = Math.max(px[i], px[i + 1], px[i + 2]) > 150 ? 0 : 255;
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * While the video at `videoRef` plays, OCRs its overlay about once a second.
 * `history` gets a new entry whenever the values change (newest first); it resets when `src` changes.
 */
export function useVideoOverlay(videoRef: RefObject<HTMLVideoElement | null>, src: string | null) {
  const [latest, setLatest] = useState<OverlayReading | null>(null);
  const [history, setHistory] = useState<OverlayReading[]>([]);
  const [status, setStatus] = useState<OverlayStatus>('idle');
  const workerRef = useRef<Promise<Worker> | null>(null);

  useEffect(() => {
    setLatest(null);
    setHistory([]);
    setStatus('idle');
    if (!src) return;

    let cancelled = false;
    let busy = false;
    let last: OverlayReading | null = null;
    const canvas = document.createElement('canvas');

    const tick = async () => {
      const video = videoRef.current;
      if (busy || !video || video.paused || video.ended || video.readyState < 2 || !video.videoWidth) return;
      busy = true;
      try {
        if (!workerRef.current) {
          setStatus('loading');
          workerRef.current = import('tesseract.js').then((t) =>
            t.createWorker('eng', 1, { langPath: '/', gzip: false })
          );
        }
        const worker = await workerRef.current;
        const videoTime = video.currentTime;
        const { data } = await worker.recognize(cropOverlay(video, canvas));
        if (cancelled) return;
        setStatus('reading');
        const parsed = parseOverlay(data.text);
        if (parsed.rescuersNeeded === null && parsed.alreadyPresent === null && parsed.dispatchCount === null) return;
        // OCR occasionally drops one field on a frame; keep the previous value rather than log a fake change.
        const reading: OverlayReading = {
          risk: parsed.risk ?? last?.risk ?? null,
          rescuersNeeded: parsed.rescuersNeeded ?? last?.rescuersNeeded ?? null,
          alreadyPresent: parsed.alreadyPresent ?? last?.alreadyPresent ?? null,
          dispatchCount: parsed.dispatchCount ?? last?.dispatchCount ?? null,
          videoTime,
          readAt: new Date().toISOString()
        };
        setLatest(reading);
        if (!last || !sameValues(last, reading)) setHistory((prev) => [reading, ...prev]);
        last = reading;
      } catch {
        // A cross-origin stream taints the canvas and can't be read; so can a failed model download.
        if (!cancelled) setStatus('error');
      } finally {
        busy = false;
      }
    };

    const t = setInterval(tick, SAMPLE_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [src, videoRef]);

  useEffect(() => () => {
    workerRef.current?.then((w) => w.terminate()).catch(() => undefined);
  }, []);

  return { latest, history, status };
}
