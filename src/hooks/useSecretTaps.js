import { useRef, useState } from 'react';

/**
 * Detects N consecutive taps on an element within a time window, then fires
 * `onUnlock`. Returns { count, onTap } — `count` lets the UI show progress so
 * the gesture is discoverable for frictionless testing.
 */
export default function useSecretTaps(onUnlock, { required = 5, windowMs = 2500 } = {}) {
  const [count, setCount] = useState(0);
  const timer = useRef(null);

  const onTap = () => {
    const next = count + 1;
    clearTimeout(timer.current);

    if (next >= required) {
      setCount(0);
      onUnlock();
      return;
    }

    setCount(next);
    timer.current = setTimeout(() => setCount(0), windowMs);
  };

  return { count, required, onTap };
}
