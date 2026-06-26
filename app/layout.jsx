import "./globals.css";

export const metadata = {
  title: "FlashPortal | Discover & Publish Browser Games",
  description:
    "Play, rate, save, and publish browser games. FlashPortal is a creator-first platform for modern web games.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
