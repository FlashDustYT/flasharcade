import "./globals.css";

export const metadata = {
  title: "FlashPortal | Discover & Publish Browser Games",
  description: "Play, rate, review, and publish browser games. FlashPortal is the creator-first platform for modern web games.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
