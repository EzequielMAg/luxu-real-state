"use client";

import { useLayoutEffect } from "react";

export default function ThemeInitializer() {
  useLayoutEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (
        theme === "dark" ||
        (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (_) {}
  }, []);

  return null;
}
