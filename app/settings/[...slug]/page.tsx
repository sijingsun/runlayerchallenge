export default async function SettingsSubPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const label = slug
    .join(" / ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex items-start py-8">
      <p style={{ fontSize: "14px", color: "#78716c" }}>
        {label} settings coming soon.
      </p>
    </div>
  );
}
