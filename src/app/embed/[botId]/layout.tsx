export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <body className="bg-transparent">{children}</body>;
}
