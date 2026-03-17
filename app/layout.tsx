// app/layout.tsx
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
      <body>{children}</body>
    </html>
  );
}