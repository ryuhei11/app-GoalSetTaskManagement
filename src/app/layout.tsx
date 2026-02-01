export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-[#f8f8ff] text-[#2f4f4f]">
        {children}
      </body>
    </html>
  );
}
