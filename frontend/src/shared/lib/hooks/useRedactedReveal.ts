import { useEffect, useRef, useState } from "react";
import { REDACTED_LABEL } from "@/shared/lib/constants";
import { rand } from "../utils/rand";

const PAUSE_MS = 80;
const ON_COMPLETE_DELAY_MS = 30;
const CHUNK = { min: 1, max: 4 };
const DELAY = { min: 10, max: 50 };

export function useRedactedReveal(onComplete?: () => void): string {
  const [visible, setVisible] = useState("");
  const onCompleteRef = useRef(onComplete);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setVisible("");
    let i = 0;

    const tick = () => {
      if (i >= REDACTED_LABEL.length) {
        timerRef.current = setTimeout(() => onCompleteRef.current?.(), ON_COMPLETE_DELAY_MS);
        return;
      }
      const next = Math.min(i + rand(CHUNK.min, CHUNK.max), REDACTED_LABEL.length);
      timerRef.current = setTimeout(
        () => {
          setVisible(REDACTED_LABEL.slice(0, next));
          i = next;
          tick();
        },
        rand(DELAY.min, DELAY.max)
      );
    };

    timerRef.current = setTimeout(tick, PAUSE_MS);
    return () => clearTimeout(timerRef.current);
  }, []);

  return visible;
}
