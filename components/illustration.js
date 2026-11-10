export default function Illustration() {
  return (
    <svg viewBox="0 0 560 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Онлайн сургалт">
      <ellipse cx="290" cy="385" rx="265" ry="24" fill="#e3eefb" />

      {/* Навч (зүүн) */}
      <path d="M70 340 C40 280 62 232 104 205 C116 262 106 308 70 340Z" fill="#7fb0f5" />
      <path d="M100 345 C90 295 112 258 150 240 C152 288 138 322 100 345Z" fill="#4f8ff0" />
      <path d="M40 345 C30 310 44 280 70 262 C78 295 66 325 40 345Z" fill="#a9ccf8" />
      {/* Навч (баруун) */}
      <path d="M500 345 C530 290 520 240 480 214 C464 270 470 312 500 345Z" fill="#7fb0f5" />
      <path d="M470 348 C470 300 446 262 410 248 C404 292 424 326 470 348Z" fill="#4f8ff0" />

      {/* Дэлгэц */}
      <rect x="140" y="38" width="320" height="236" rx="14" fill="#1b3a8f" />
      <rect x="152" y="64" width="296" height="198" rx="6" fill="#eaf2ff" />
      <rect x="152" y="50" width="296" height="14" rx="7" fill="#f59e0b" />
      <circle cx="164" cy="57" r="3" fill="#fff" />
      <circle cx="176" cy="57" r="3" fill="#fff" />
      <rect x="288" y="274" width="24" height="34" fill="#1b3a8f" />
      <rect x="244" y="306" width="112" height="10" rx="5" fill="#1b3a8f" />

      {/* Нээлттэй ном */}
      <path d="M300 92 L186 102 L186 236 L300 226Z" fill="#fff" stroke="#c9dbf5" />
      <path d="M300 92 L414 102 L414 236 L300 226Z" fill="#fff" stroke="#c9dbf5" />
      {[116, 128, 140, 152, 164, 176, 188, 200].map((y) => (
        <g key={y}>
          <rect x="200" y={y} width="88" height="5" rx="2.5" fill="#a9c1ee" />
          <rect x="312" y={y} width="88" height="5" rx="2.5" fill="#a9c1ee" />
        </g>
      ))}

      {/* Зүүн талын зогсож буй хүн */}
      <circle cx="112" cy="150" r="15" fill="#f5cba7" />
      <path d="M96 146 C98 128 126 128 128 146 C120 140 106 140 96 146Z" fill="#f28c28" />
      <rect x="98" y="166" width="30" height="64" rx="12" fill="#f28c28" />
      <rect x="100" y="228" width="12" height="70" rx="5" fill="#1b3a8f" />
      <rect x="116" y="228" width="12" height="70" rx="5" fill="#1b3a8f" />
      <path d="M126 176 L160 150" stroke="#f5cba7" strokeWidth="8" strokeLinecap="round" />

      {/* Баруун талын зогсож буй хүн */}
      <circle cx="476" cy="146" r="15" fill="#f5cba7" />
      <path d="M461 142 C462 126 490 126 491 142Z" fill="#e8e8ef" />
      <rect x="460" y="162" width="32" height="68" rx="12" fill="#f59e0b" />
      <rect x="462" y="228" width="12" height="76" rx="5" fill="#1b3a8f" />
      <rect x="478" y="228" width="12" height="76" rx="5" fill="#1b3a8f" />
      <path d="M462 176 L426 150" stroke="#f5cba7" strokeWidth="8" strokeLinecap="round" />

      {/* Дундах суугаа хүн ба зөөврийн компьютер */}
      <circle cx="300" cy="318" r="13" fill="#f5cba7" />
      <path d="M287 314 C288 300 312 300 313 314Z" fill="#2b2f4a" />
      <rect x="286" y="332" width="30" height="34" rx="10" fill="#2f6fe4" />
      <ellipse cx="300" cy="372" rx="46" ry="12" fill="#1b3a8f" />
      <path d="M270 352 L330 352 L322 338 L278 338Z" fill="#dce8fb" stroke="#9db8e8" />
    </svg>
  );
}