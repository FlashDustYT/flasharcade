"use client";

import { useEffect } from "react";

export default function RedirectGame() {
  useEffect(() => {
    window.location.replace("/play/how-many-rings");
  }, []);

  return <main style={{padding: 40}}>Opening game...</main>;
}
