import { useCallback, useEffect, useRef, useState } from 'react';

export interface FlashNotice {
  kind: 'ok' | 'error';
  text: string;
}

/** A success/error message that disappears after a few seconds (a newer message restarts the timer). */
export function useFlash(durationMs = 5000) {
  const [notice, setNotice] = useState<FlashNotice | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const flash = useCallback(
    (kind: FlashNotice['kind'], text: string) => {
      window.clearTimeout(timer.current);
      setNotice({ kind, text });
      timer.current = window.setTimeout(() => setNotice(null), durationMs);
    },
    [durationMs]
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { notice, flash };
}
