"use client";

import { useEffect } from "react";

export default function RedirectGame() {
  useEffect(() => {
    window.location.replace("/play/legacy-league");
  }, []);

  return <main style={{padding: 40}}>Opening game...</main>;
}
