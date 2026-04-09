// app/layout.tsx
import './globals.css'  // ADD THIS IMPORT

export const metadata = {
  title: 'Math Handwriting Practice',
  description: 'Practice math by writing solutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">{children}</body>
    </html>
  );
}