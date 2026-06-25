import "./globals.css";

export const metadata = {
  title: "FlashArcade | FlashDust Games",
  description: "A premium arcade-style hub for FlashDust games, experiments, and playable web projects.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
