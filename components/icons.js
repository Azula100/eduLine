export function SurgaltIcon({ name = "", size = 96 }) {
  const n = name.toLowerCase();
  const common = { width: size, height: size, viewBox: "0 0 100 100" };

  if (n.includes("матем")) {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <rect x="6" y="6" width="88" height="88" rx="5" strokeWidth="8" />
        <path d="M50 6v88M6 50h88" strokeWidth="8" />
        <path d="M18 28h20M28 18v20" />
        <path d="M62 28h20" />
        <path d="M19 63l18 18M37 63l-18 18" />
        <path d="M62 72h20" /><circle cx="72" cy="63" r="2.5" fill="currentColor" />
        <circle cx="72" cy="81" r="2.5" fill="currentColor" />
      </svg>
    );
  }
  if (n.includes("физик")) {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="4">
        <ellipse cx="50" cy="50" rx="44" ry="17" />
        <ellipse cx="50" cy="50" rx="44" ry="17" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="44" ry="17" transform="rotate(120 50 50)" />
        <circle cx="50" cy="50" r="7" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  const pts = [[50, 10], [88, 38], [74, 84], [26, 84], [12, 38]];
  return (
    <svg {...common} fill="currentColor" stroke="currentColor">
      {pts.map(([x, y], i) => <line key={i} x1="50" y1="52" x2={x} y2={y} strokeWidth="4" />)}
      <circle cx="50" cy="52" r="11" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" />)}
    </svg>
  );
}

export function PersonAvatar({ size = 110 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M26 44c0-26 12-34 24-34s24 8 24 34v22H26z" fill="#a8641a" />
      <ellipse cx="50" cy="44" rx="15" ry="19" fill="#f7d6b5" />
      <path d="M8 100c0-24 17-34 42-34s42 10 42 34z" fill="#1f2937" />
    </svg>
  );
}