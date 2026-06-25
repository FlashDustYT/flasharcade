import "./globals.css";

export const metadata = {
  title: "FlashArcade | FlashDust Games",
  description: "The official FlashDust game hub.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
