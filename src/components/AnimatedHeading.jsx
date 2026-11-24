// Page headline that reveals word by word. The highlighted words get the
// brand gradient plus one gentle shimmer. Motion is switched off for users
// who ask their device to reduce motion (see animations.css).
function AnimatedHeading({ lead, highlight, as: Tag = "h1", className = "" }) {
  const leadWords = lead.trim().split(/\s+/);
  const highlightWords = highlight ? highlight.trim().split(/\s+/) : [];

  return (
    <Tag className={`animated-heading ${className}`.trim()} aria-label={`${lead} ${highlight || ""}`.trim()}>
      {leadWords.map((word, i) => (
        <span key={`l${i}`} className="reveal-word" style={{ "--i": i }} aria-hidden="true">
          {word}
        </span>
      ))}
      {highlightWords.map((word, i) => (
        <span
          key={`h${i}`}
          className="reveal-word gradient-text shimmer-text"
          style={{ "--i": leadWords.length + i }}
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}

export default AnimatedHeading;
