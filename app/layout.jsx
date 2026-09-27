export const metadata = {
  title: "Advanced VLSI — live training and internships",
  description:
    "Live VLSI, embedded, AI and software training with working engineers. Small batches, recorded sessions, certificate on completion.",
  icons: { icon: "/logo.jpg" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
