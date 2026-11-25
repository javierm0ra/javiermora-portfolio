import type { ReactNode } from "react";
import type { ProjectId } from "../data/projects";

// Colores = tokens de styles.css (paleta Stabily). Los atributos SVG no leen var(), por eso van literales.
const B = "#177eb9";
const N = "#1a335d";
const O = "#f08c2e";
const G = "#1d7a45";
const GB = "#e5f4ea";
const L = "#dfe6ee";
const S = "#f3f7fa";
const TB = "#e3f1f9";
const OB = "#fdf0e1";

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" aria-hidden="true" focusable="false">
      <rect width="320" height="200" fill="#fff" />
      <rect width="320" height="26" fill={S} />
      <line x1="0" y1="26" x2="320" y2="26" stroke={L} />
      <circle cx="16" cy="13" r="3.5" fill={L} />
      <circle cx="28" cy="13" r="3.5" fill={L} />
      <circle cx="40" cy="13" r="3.5" fill={L} />
      {children}
    </svg>
  );
}

function Stabily() {
  return (
    <Frame>
      <rect x="22" y="42" width="90" height="9" rx="4" fill={N} />
      <rect x="22" y="57" width="52" height="6" rx="3" fill={L} />
      {[48, 72, 40, 88, 60].map((h, i) => (
        <rect key={i} x={30 + i * 30} y={178 - h} width="20" height={h} rx="4" fill={i === 3 ? O : B} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="196" y={48 + i * 40} width="102" height="32" rx="8" fill={S} stroke={L} />
          <circle cx="212" cy={64 + i * 40} r="7" fill={i === 1 ? OB : TB} stroke={i === 1 ? O : B} />
          <rect x="226" y={57 + i * 40} width="44" height="6" rx="3" fill={N} />
          <rect x="226" y={68 + i * 40} width="28" height="5" rx="2.5" fill={L} />
        </g>
      ))}
    </Frame>
  );
}

function KasaNode() {
  return (
    <Frame>
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${22 + i * 148} 42)`}>
          <rect width="128" height="78" rx="10" fill={TB} />
          <polygon points="64,12 100,40 28,40" fill={B} />
          <rect x="38" y="40" width="52" height="28" fill="#fff" />
          <rect x="58" y="50" width="12" height="18" fill={i ? O : N} />
        </g>
      ))}
      <rect x="22" y="132" width="276" height="44" rx="10" fill={S} stroke={L} />
      <rect x="36" y="144" width="96" height="7" rx="3.5" fill={N} />
      <rect x="36" y="158" width="64" height="6" rx="3" fill={L} />
      <rect x="222" y="146" width="62" height="18" rx="9" fill={GB} />
      <circle cx="234" cy="155" r="3.5" fill={G} />
      <rect x="243" y="152" width="32" height="6" rx="3" fill={G} />
    </Frame>
  );
}

function KondoNode() {
  return (
    <Frame>
      <rect x="22" y="40" width="110" height="9" rx="4" fill={N} />
      <rect x="236" y="38" width="62" height="14" rx="7" fill={TB} />
      <rect x="246" y="43" width="42" height="5" rx="2.5" fill={B} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(22 ${62 + i * 29})`}>
          <rect width="276" height="23" rx="7" fill={S} />
          <circle cx="14" cy="11.5" r="6" fill={GB} />
          <path d="M11 11.5l2.4 2.4 4.2-4.6" stroke={G} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30" y="8" width={100 + i * 16} height="6" rx="3" fill={N} opacity=".75" />
          <rect x="226" y="8" width="38" height="6" rx="3" fill={i === 1 ? O : B} />
        </g>
      ))}
    </Frame>
  );
}

function Parilink() {
  return (
    <Frame>
      <rect x="96" y="36" width="128" height="150" rx="12" fill={S} stroke={L} />
      <rect x="96" y="36" width="128" height="40" rx="12" fill={B} />
      <rect x="96" y="60" width="128" height="16" fill={B} />
      <circle cx="150" cy="104" r="15" fill="none" stroke={O} strokeWidth="4" />
      <circle cx="170" cy="104" r="15" fill="none" stroke={N} strokeWidth="4" />
      <rect x="124" y="132" width="72" height="8" rx="4" fill={N} />
      <rect x="136" y="146" width="48" height="6" rx="3" fill={L} />
      <rect x="132" y="160" width="56" height="16" rx="8" fill={O} />
      <circle cx="48" cy="70" r="5" fill={OB} stroke={O} />
      <circle cx="270" cy="150" r="6" fill={TB} stroke={B} />
      <circle cx="62" cy="150" r="3.5" fill={TB} stroke={B} />
    </Frame>
  );
}

function Medicatio() {
  const days = [0, 1, 2, 3, 4];
  const rows = [0, 1, 2, 3];
  return (
    <Frame>
      {days.map((c) => (
        <rect key={c} x={56 + c * 48} y="38" width="40" height="7" rx="3.5" fill={L} />
      ))}
      {rows.map((r) => (
        <rect key={r} x="22" y={52 + r * 32} width="22" height="6" rx="3" fill={L} />
      ))}
      {rows.flatMap((r) =>
        days.map((c) => <rect key={`${r}-${c}`} x={56 + c * 48} y={50 + r * 32} width="40" height="26" rx="6" fill={S} />),
      )}
      <rect x="56" y="50" width="40" height="26" rx="6" fill={TB} stroke={B} />
      <rect x="104" y="82" width="40" height="58" rx="6" fill={GB} stroke={G} />
      <rect x="152" y="114" width="40" height="26" rx="6" fill={OB} stroke={O} />
      <rect x="248" y="50" width="40" height="58" rx="6" fill={TB} stroke={B} />
      <rect x="200" y="146" width="40" height="26" rx="6" fill={GB} stroke={G} />
    </Frame>
  );
}

function AhiNosVemos() {
  const pins: [number, number][] = [
    [62, 62],
    [268, 70],
    [90, 162],
  ];
  return (
    <Frame>
      <rect x="16" y="32" width="288" height="154" fill="#eaf3ee" />
      <path d="M16 120 C90 96 150 150 304 88" stroke="#fff" strokeWidth="10" fill="none" />
      <path d="M110 32 C130 90 90 130 118 186" stroke="#fff" strokeWidth="7" fill="none" />
      <path d="M220 32 L236 186" stroke="#fff" strokeWidth="6" fill="none" />
      <g stroke={B} strokeWidth="2" strokeDasharray="5 5" fill="none">
        {pins.map(([x, y]) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2="160" y2="110" />
        ))}
      </g>
      {pins.map(([x, y]) => (
        <circle key={`p${x}-${y}`} cx={x} cy={y} r="9" fill={B} stroke="#fff" strokeWidth="3" />
      ))}
      <circle cx="160" cy="110" r="19" fill={O} opacity=".25" />
      <circle cx="160" cy="110" r="11" fill={O} stroke="#fff" strokeWidth="3" />
    </Frame>
  );
}

const ART: Record<ProjectId, () => ReactNode> = {
  stabily: Stabily,
  kasanode: KasaNode,
  kondonode: KondoNode,
  parilink: Parilink,
  medicatio: Medicatio,
  ahinosvemos: AhiNosVemos,
};

export function Illustration({ id }: { id: ProjectId }) {
  const Art = ART[id];
  return <Art />;
}
