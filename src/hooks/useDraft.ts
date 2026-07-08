"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export function useDraft<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  // localStorage is unavailable during SSR/prerender, so the draft is hydrated
  // client-side after mount rather than via a useState lazy initializer
  // (which would otherwise crash on the server or cause a hydration mismatch).
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue((prev) => ({ ...prev, ...JSON.parse(raw) }));
        setSavedAt(new Date());
      }
    } catch { /* ignore */ }
  }, [key]);

  const save = useCallback((v: T) => {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(v));
        setSavedAt(new Date());
      } catch { /* ignore */ }
    }, 500);
  }, [key]);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    setValue(initial);
    setSavedAt(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { value, save, clear, savedAt };
}
