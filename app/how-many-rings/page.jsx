"use client";

import { useEffect } from "react";

export default function RedirectGame() {
  useEffect(() => {
    window.location.replace("/play/how-many-rings");
  }, []);

  return <main style={{padding: 40, color: "white", background: "black", minHeight: "100vh"}}>Opening game...</main>;
}
