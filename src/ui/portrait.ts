// Retratos pintados por código: anatomia de rosto, luz lateral, idade, humor e o que a pessoa veste.
// Tudo em SVG, determinístico. Proporções clássicas: olhos no meio da cabeça, nariz a 2/3, boca a 5/6.
export interface Face {
  skin: number; // 0..4
  hair: number; // 0..5 cor
  hairStyle: number; // 0..4
  beard: number; // 0 nenhuma, 1 aparada, 2 cheia
  scar: boolean;
  build: number; // 0..2 rosto fino .. largo
  age: number;
  female: boolean;
  mood: number; // -100..100
  wear: 'coroa' | 'nada' | 'elmo' | 'capuz' | 'chapeu' | 'tonsura' | 'diadema' | 'gorro';
  mantle: 'real' | 'simples' | 'cota' | 'habito' | 'rico';
}

export const SKIN = ['#f1d3ba', '#ddb18e', '#c18b65', '#93603f', '#62402b'];
const SKIN_D = ['#c79a7f', '#b0805f', '#8e5f40', '#66402a', '#3f281a'];
export const HAIR = ['#1d1612', '#3f2819', '#6e4325', '#a8763f', '#cdb48a', '#7a3219'];
const EYES = ['#3b2414', '#5e3d1f', '#56653a', '#4d6a82', '#6b5a3a'];
const LIP = ['#c27d72', '#b26a5d', '#9a5648', '#7a4535', '#5c3427'];

function hex(s: string) { return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); }
function mix(a: string, b: string, t: number) {
  const A = hex(a), B = hex(b);
  return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, '0')).join('');
}

export function portrait(f: Face, size = 96, id = 'p'): string {
  const k = f.skin % 5;
  const skin = SKIN[k], skinD = SKIN_D[k], skinL = mix(skin, '#fff4e8', 0.22);
  // sombra fria e luz quente, como numa pintura a óleo expressionista
  const cool = mix(skinD, '#2f3d58', 0.38), warm = '#ffcf98';
  const seed = (f.skin * 13 + f.hair * 7 + f.hairStyle * 3 + f.build + (f.female ? 5 : 0)) % 97;
  const bgTone = ['#4a3c2a', '#2f3d3b', '#45302f', '#363547', '#3d3a26'][seed % 5];
  const gray = Math.max(0, Math.min(1, (f.age - 40) / 28));
  const hair = mix(HAIR[f.hair % 6], '#cfcac0', gray * 0.8);
  const hairD = mix(hair, '#000000', 0.45), hairL = mix(hair, '#f2e6d0', 0.28);
  const eyeC = EYES[(f.hair + f.skin * 2 + f.hairStyle) % 5];
  const lip = mix(LIP[k], f.female ? '#b0414a' : LIP[k], f.female ? 0.25 : 0);
  const w = f.female ? 0 : [0, 2.5, 5][f.build % 3];
  const m = Math.max(-1, Math.min(1, f.mood / 70));
  const old = f.age > 44, older = f.age > 56;
  const covered = ['elmo', 'capuz'].includes(f.wear);
  const u = id; // prefixo dos ids internos

  // ---------- definições ----------
  const defs = `<defs>
    <clipPath id="${u}c"><rect width="100" height="120" rx="5"/></clipPath>
    <radialGradient id="${u}bg" cx="40%" cy="30%" r="85%"><stop offset="0" stop-color="${mix(bgTone, '#e8c890', 0.25)}"/><stop offset=".55" stop-color="${bgTone}"/><stop offset="1" stop-color="#0e0b09"/></radialGradient>
    <filter id="${u}p" x="-6%" y="-6%" width="112%" height="112%">
      <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="${seed}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="${size < 60 ? 1.2 : 2.4}" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="1" seed="${seed + 3}" result="f"/>
      <feDisplacementMap in="d" in2="f" scale="${size < 60 ? 0.6 : 1.3}" xChannelSelector="G" yChannelSelector="R"/>
    </filter>
    <radialGradient id="${u}sk" cx="36%" cy="38%" r="72%"><stop offset="0" stop-color="${mix(skinL, '#ffd2a0', 0.25)}"/><stop offset=".5" stop-color="${skin}"/><stop offset="1" stop-color="${cool}"/></radialGradient>
    <linearGradient id="${u}nk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(skinD, '#000', 0.25)}"/><stop offset="1" stop-color="${skin}"/></linearGradient>
    <linearGradient id="${u}hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hairL}"/><stop offset=".45" stop-color="${hair}"/><stop offset="1" stop-color="${hairD}"/></linearGradient>
    <linearGradient id="${u}lt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff2dc" stop-opacity=".10"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0d05" stop-opacity=".38"/></linearGradient>
    <linearGradient id="${u}au" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d488"/><stop offset=".5" stop-color="#c39338"/><stop offset="1" stop-color="#7a561a"/></linearGradient>
    <filter id="${u}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="${u}s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".55"/></filter>
    <filter id="${u}t"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${(f.skin * 7 + f.hair) % 50}"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .14  0 0 0 0 .08  0 0 0 .22 0"/></filter>
    <clipPath id="${u}ey"><path d="M33.6 55.3 Q37.8 ${51.4 + (m < -0.5 ? 1 : 0)} 44.4 54.6 Q40 58.2 33.6 55.3Z"/></clipPath>
  </defs>`;

  // ---------- cabelo de trás ----------
  let back = '';
  if (!covered) {
    if (f.female) back = `<path d="M${25} 46 C 18 70, 16 96, 20 116 L 80 116 C 84 96, 82 70, 75 46 C 72 26, 28 26, 25 46Z" fill="url(#${u}hr)"/>`;
    else if (f.hairStyle === 3) back = `<path d="M${25 - w} 48 C 19 70, 20 92, 24 104 L 76 104 C 80 92, 81 70, ${75 + w} 48 C 72 26, 28 26, ${25 - w} 48Z" fill="url(#${u}hr)"/>`;
    else if (f.hairStyle === 2) back = `<path d="M${25 - w} 48 C 21 64, 23 78, 27 84 L 73 84 C 77 78, 79 64, ${75 + w} 48 C 72 26, 28 26, ${25 - w} 48Z" fill="url(#${u}hr)"/>`;
  }

  // ---------- roupa ----------
  const shoulders = 'M2 120 C 4 104, 18 97, 37 94.5 L 63 94.5 C 82 97, 96 104, 98 120Z';
  const ermine = Array.from({ length: 9 }, (_, i) => `<path d="M${30 + i * 5} ${99 + (i % 2) * 2} l.8 2.2 l.8 -2.2Z" fill="#141010"/>`).join('');
  const mantle: Record<Face['mantle'], string> = {
    real: `<linearGradient id="${u}rv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8e2a34"/><stop offset=".6" stop-color="#5a1820"/><stop offset="1" stop-color="#2e0b10"/></linearGradient>
      <path d="${shoulders}" fill="url(#${u}rv)"/>
      <path d="M14 106 Q20 112 22 120 M84 106 Q80 112 78 120" stroke="#2a080c" stroke-width="2" fill="none" opacity=".6"/>
      <path d="M26 96 C 36 93, 64 93, 74 96 C 72 104, 62 108, 50 108 C 38 108, 28 104, 26 96Z" fill="#efe8da"/>
      <path d="M26 96 C 36 93, 64 93, 74 96 C 72 104, 62 108, 50 108 C 38 108, 28 104, 26 96Z" fill="url(#${u}lt)"/>${ermine}
      <path d="M36 104 Q50 116 64 104" fill="none" stroke="url(#${u}au)" stroke-width="1.6"/><circle cx="50" cy="111" r="2.4" fill="url(#${u}au)"/>`,
    simples: `<path d="${shoulders}" fill="#5d5345"/><path d="${shoulders}" fill="url(#${u}lt)"/><path d="M40 94.5 Q50 106 60 94.5" fill="#463d32"/><path d="M40 94.5 Q50 106 60 94.5" fill="none" stroke="#2f2820" stroke-width="1.2"/><path d="M20 108 Q24 114 25 120 M78 108 Q76 114 75 120" stroke="#3a3229" stroke-width="1.4" fill="none"/>`,
    cota: `<pattern id="${u}ml" width="3" height="2.4" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.2" r="1" fill="none" stroke="#3e4245" stroke-width=".55"/></pattern>
      <path d="${shoulders}" fill="#80858a"/><path d="${shoulders}" fill="url(#${u}ml)"/><path d="${shoulders}" fill="url(#${u}lt)"/>
      <path d="M33 104 L33 120 L67 120 L67 104 Q50 110 33 104Z" fill="#7a2424"/><path d="M38 94.5 Q50 102 62 94.5" fill="none" stroke="#55595c" stroke-width="3"/>`,
    habito: `<path d="${shoulders}" fill="#2c2621"/><path d="M22 99 C 30 108, 38 110, 50 110 C 62 110, 70 108, 78 99" fill="none" stroke="#1a1612" stroke-width="2.2"/><path d="${shoulders}" fill="url(#${u}lt)"/><path d="M44 112 h12 M50 107 v11" stroke="#b08a4a" stroke-width="1.6"/>`,
    rico: `<linearGradient id="${u}gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3c6151"/><stop offset="1" stop-color="#16291f"/></linearGradient>
      <path d="${shoulders}" fill="url(#${u}gr)"/><path d="M36 94.5 Q50 106 64 94.5" fill="none" stroke="url(#${u}au)" stroke-width="2.4"/><path d="M50 103 V120" stroke="url(#${u}au)" stroke-width="1.2"/><circle cx="50" cy="108" r="1" fill="#e8d6a0"/><circle cx="50" cy="114" r="1" fill="#e8d6a0"/>`,
  };

  // ---------- pescoço, orelhas, rosto ----------
  const head = `M50 21 C 66 21, ${74 + w} 33, ${74 + w} 50 C ${74 + w} 63, ${70 + w * 0.6} 75, 61 83 C 57 87, 53.5 88.5, 50 88.5 C 46.5 88.5, 43 87, 39 83 C ${30 - w * 0.6} 75, ${26 - w} 63, ${26 - w} 50 C ${26 - w} 33, 34 21, 50 21Z`;
  const neck = `<path d="M40.5 78 L39.5 97 Q50 102 60.5 97 L59.5 78Z" fill="url(#${u}nk)"/>`;
  const ears = [-1, 1].map((s) => {
    const x = 50 + s * (24.5 + w);
    return `<path d="M${x} 50 C ${x + s * 4.5} 49, ${x + s * 5} 58, ${x + s * 3.2} 63 C ${x + s * 2} 65.5, ${x} 64, ${x - s * 0.4} 61Z" fill="${s < 0 ? skin : skinD}"/><path d="M${x + s * 1} 52.5 C ${x + s * 3.4} 53, ${x + s * 3} 58, ${x + s * 1.6} 60.5" fill="none" stroke="${mix(skinD, '#000', 0.3)}" stroke-width=".7" opacity=".7"/>`;
  }).join('');
  const shading = `
    <path d="${head}" fill="url(#${u}sk)"/>
    <g filter="url(#${u}b)" opacity=".55">
      <path d="M${66 + w} 30 C ${74 + w} 44, ${73 + w} 66, 58 84 C 64 70, 66 52, ${66 + w} 30Z" fill="${cool}"/>
      <ellipse cx="38.5" cy="55.5" rx="7" ry="4.2" fill="${skinD}" opacity=".55"/><ellipse cx="61.5" cy="55.5" rx="7" ry="4.2" fill="${skinD}" opacity=".7"/>
      <ellipse cx="37" cy="68" rx="6" ry="4" fill="#c6655c" opacity="${f.female ? 0.45 : 0.28}"/><ellipse cx="63" cy="68" rx="6" ry="4" fill="#b05a52" opacity="${f.female ? 0.4 : 0.22}"/>
      <ellipse cx="50" cy="84.5" rx="7" ry="2.5" fill="${skinD}" opacity=".5"/>
      <ellipse cx="44" cy="36" rx="9" ry="5" fill="${skinL}" opacity=".7"/>
    </g>
    <g fill="none" stroke-linecap="round">
      <path d="M37 31 q7 -3.5 15 -.6" stroke="${warm}" stroke-width="3.6" opacity=".28"/>
      <path d="M${29 - w} 60 q3 -5 10 -5.6" stroke="${warm}" stroke-width="3" opacity=".3"/>
      <path d="M49.2 57 l-.4 11" stroke="${warm}" stroke-width="1.8" opacity=".35"/>
      <path d="M${28 - w} 46 q-1 10 2 19" stroke="${warm}" stroke-width="1.6" opacity=".4"/>
      <path d="M58 67 q6 3.4 ${11 + w} -1" stroke="${cool}" stroke-width="3.4" opacity=".38"/>
      <path d="M57 84 q8 -4 ${13 + w} -15" stroke="${cool}" stroke-width="3" opacity=".35"/>
      <path d="M${69 + w} 36 q3 6 3 13" stroke="${cool}" stroke-width="3" opacity=".3"/>
      <path d="M40 85 q5 3 10 3.2" stroke="${cool}" stroke-width="2.2" opacity=".3"/>
    </g>`;

  // ---------- olhos e sobrancelhas (lado esquerdo, espelhado para o direito) ----------
  const squint = m < -0.5 ? 0.8 : 0;
  const browIn = m < -0.3 ? 1.6 : m > 0.4 ? -0.6 : 0; // sobrancelha franzida baixa por dentro
  const browC = mix(hair, '#1a120c', 0.35);
  const half = `
    <path d="M33 53.6 Q38 ${50 + squint} 45 53.2" fill="none" stroke="${skinD}" stroke-width="1" opacity=".55" filter="url(#${u}s)"/>
    <path d="M33.6 55.3 Q37.8 ${51.4 + squint} 44.4 54.6 Q40 58.2 33.6 55.3Z" fill="#ece3d6"/>
    <g clip-path="url(#${u}ey)"><circle cx="39.4" cy="55" r="2.55" fill="${eyeC}"/><circle cx="39.4" cy="55" r="2.55" fill="none" stroke="#120a06" stroke-width=".5"/><circle cx="39.4" cy="55" r="1.15" fill="#0b0705"/><circle cx="38.6" cy="54.2" r=".6" fill="#fff" opacity=".85"/>
      <path d="M33.6 55.3 Q37.8 ${51.4 + squint} 44.4 54.6 L44.4 53 L33.6 53Z" fill="${skinD}" opacity=".35"/></g>
    <path d="M33.4 55.4 Q37.8 ${51.2 + squint} 44.6 54.6" fill="none" stroke="#24160d" stroke-width="${f.female ? 1.25 : 0.95}" stroke-linecap="round"/>
    ${f.female ? `<path d="M33.4 55.4 l-1.3 -.9 M34.6 54.1 l-1 -1.1" stroke="#24160d" stroke-width=".55"/>` : ''}
    <path d="M35 57.3 Q39.5 58.6 43.6 55.6" fill="none" stroke="${skinD}" stroke-width=".55" opacity=".8"/>
    ${old ? `<path d="M35.2 59.2 Q39.5 60.6 43.4 58" fill="none" stroke="${skinD}" stroke-width=".6" opacity=".7"/><path d="M32.4 56 l-2.2 .6 M32.6 57.2 l-2 1.4" stroke="${skinD}" stroke-width=".5"/>` : ''}
    <path d="M32.4 ${50.6} Q37.5 ${f.female ? 46.6 : 47.6} 45 ${49.4 + browIn} L44.8 ${50.9 + browIn} Q38 ${f.female ? 48.1 : 49.4} 32.7 51.7Z" fill="${browC}"/>`;
  const eyes = `<g>${half}</g><g transform="matrix(-1 0 0 1 100 0)">${half}</g>`;

  // ---------- nariz ----------
  const nose = `
    <g filter="url(#${u}s)"><path d="M52.2 56 C 53.4 62, 54.6 66, 55 70" fill="none" stroke="${skinD}" stroke-width="1.6" opacity=".55"/>
    <ellipse cx="50" cy="73.2" rx="5.2" ry="1.6" fill="${skinD}" opacity=".55"/></g>
    <path d="M45.6 70.6 C 44.6 72.4, 46.6 73.6, 48 72.9 M54.4 70.6 C 55.4 72.4, 53.4 73.6, 52 72.9" fill="none" stroke="${mix(skinD, '#000', 0.35)}" stroke-width=".8" stroke-linecap="round"/>
    <ellipse cx="47.3" cy="72.4" rx="1.1" ry=".55" fill="${mix(skinD, '#000', 0.5)}"/><ellipse cx="52.7" cy="72.4" rx="1.1" ry=".55" fill="${mix(skinD, '#000', 0.5)}"/>
    <ellipse cx="49.6" cy="69.4" rx="1.6" ry="1.1" fill="#fff" opacity=".2"/>`;

  // ---------- boca ----------
  const cy = 78.4, cr = -m * 1.4; // cantos sobem com bom humor
  const lw = f.female ? 6.8 : 6.4;
  const mouth = `
    <path d="M${50 - lw} ${cy + cr} Q46.5 ${cy - 2.4} 50 ${cy - 1.4} Q53.5 ${cy - 2.4} ${50 + lw} ${cy + cr} Q50 ${cy + 0.6} ${50 - lw} ${cy + cr}Z" fill="${mix(lip, skinD, 0.35)}"/>
    <path d="M${50 - lw + 0.6} ${cy + cr + 0.3} Q50 ${cy + 1} ${50 + lw - 0.6} ${cy + cr + 0.3} Q54 ${cy + (f.female ? 4.4 : 3.6)} 50 ${cy + (f.female ? 4.6 : 3.8)} Q46 ${cy + (f.female ? 4.4 : 3.6)} ${50 - lw + 0.6} ${cy + cr + 0.3}Z" fill="${lip}"/>
    <path d="M${50 - lw} ${cy + cr} Q50 ${cy + 0.8 + m * 1.2} ${50 + lw} ${cy + cr}" fill="none" stroke="${mix(lip, '#2a120c', 0.55)}" stroke-width=".55" stroke-linecap="round"/>
    <ellipse cx="49" cy="${cy + 2.4}" rx="2" ry=".7" fill="#fff" opacity=".22"/>
    <ellipse cx="50" cy="${cy + 6.5}" rx="4.5" ry="1.4" fill="${skinD}" opacity=".35" filter="url(#${u}s)"/>`;

  // ---------- marcas da idade e cicatriz ----------
  const ageMarks = (old ? `<path d="M44.6 70 C 41 73, 40.6 77, 42 80.5 M55.4 70 C 59 73, 59.4 77, 58 80.5" fill="none" stroke="${skinD}" stroke-width=".8" opacity=".75"/>` : '')
    + (older ? `<path d="M40 39.5 Q50 37.6 60 39.5 M41.5 42.6 Q50 41 58.5 42.6" fill="none" stroke="${skinD}" stroke-width=".6" opacity=".7"/><path d="M38 82 Q40 86 44 87.6 M62 82 Q60 86 56 87.6" fill="none" stroke="${skinD}" stroke-width=".6" opacity=".6"/>` : '');
  const scar = f.scar ? `<path d="M63.5 47 C 64.6 53, 65.4 60, 64.4 67" fill="none" stroke="${mix(skinD, '#5a2018', 0.4)}" stroke-width="1.5" stroke-linecap="round" opacity=".8"/><path d="M63.5 47 C 64.6 53, 65.4 60, 64.4 67" fill="none" stroke="${mix(skin, '#f3c8b8', 0.5)}" stroke-width=".55"/><path d="M62.6 52 l2.8 -.4 M62.9 57 l2.9 -.3 M63 62 l2.7 0" stroke="${mix(skinD, '#5a2018', 0.3)}" stroke-width=".45"/>` : '';

  // ---------- barba ----------
  let beard = '';
  if (!f.female) {
    const chin = f.beard === 2 ? 98 : 92.5;
    const jaw = `M${27 - w} 60 C ${27 - w} 76, 37 ${chin - 6}, 50 ${chin} C 63 ${chin - 6}, ${73 + w} 76, ${73 + w} 60 C ${71 + w} 68, 66 76, 60.5 77.4 C 57 75.6, 53.5 76.2, 50 77.4 C 46.5 76.2, 43 75.6, 39.5 77.4 C 34 76, ${29 - w} 68, ${27 - w} 60Z`;
    const strands = Array.from({ length: 14 }, (_, i) => {
      const x = 34 + i * 2.4, y0 = 80 + Math.abs(i - 6.5) * -0.3;
      return `<path d="M${x} ${y0} q${(i - 6.5) * 0.18} ${f.beard === 2 ? 8 : 5} ${(i - 6.5) * 0.35} ${f.beard === 2 ? 13 : 8}" stroke="${i % 2 ? hairL : hairD}" stroke-width=".55" fill="none" opacity=".55"/>`;
    }).join('');
    const stache = `<path d="M41.5 76.6 C 44 73.4, 48 73.6, 50 74.8 C 52 73.6, 56 73.4, 58.5 76.6 C 55.5 76, 53 76.4, 50 76.2 C 47 76.4, 44.5 76, 41.5 76.6Z" fill="url(#${u}hr)"/>`;
    if (f.beard >= 1) beard = `<path d="${jaw}" fill="url(#${u}hr)" opacity="${f.beard === 2 ? 1 : 0.92}"/>${strands}${stache}`;
    else beard = `<path d="${jaw}" fill="${hair}" opacity="${f.age > 24 ? 0.13 : 0.06}" filter="url(#${u}s)"/>`;
  }

  // ---------- cabelo da frente ----------
  let top = '';
  const str = (n: number, x0: number, x1: number, y: number, len: number) => Array.from({ length: n }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    return `<path d="M${x} ${y} q${(x - 50) * 0.12} ${len * 0.5} ${(x - 50) * 0.3} ${len}" stroke="${i % 3 ? hairL : hairD}" stroke-width=".5" fill="none" opacity=".5"/>`;
  }).join('');
  const withStrands = (d: string, strands: string) => `<clipPath id="${u}hc"><path d="${d}"/></clipPath><path d="${d}" fill="url(#${u}hr)"/><g clip-path="url(#${u}hc)">${strands}</g>`;
  if (!['elmo', 'capuz', 'tonsura'].includes(f.wear)) {
    if (f.female) top = withStrands(`M24 58 C 21 30, 36 17, 50 17.5 C 64 17, 79 30, 76 58 C 73 44, 64 31, 52 30 C 51 34, 49 34, 48 30 C 36 31, 27 44, 24 58Z`, str(9, 30, 70, 19, 22));
    else if (f.hairStyle === 4) top = `<path d="M${25 - w} 56 C ${23 - w} 44, 26 38, 31 35 C 29 42, 29 48, ${28 - w} 56Z M${75 + w} 56 C ${77 + w} 44, 74 38, 69 35 C 71 42, 71 48, ${72 + w} 56Z" fill="url(#${u}hr)"/><path d="M34 31 Q50 24 66 31" stroke="${hair}" stroke-width="1" opacity=".35" fill="none"/>`;
    else if (f.hairStyle === 1) top = withStrands(`M${25 - w} 55 C ${22 - w} 30, 36 16, 52 17 C 68 18, ${79 + w} 31, ${75 + w} 55 C 73 42, 70 35, 64 32 C 56 36, 44 41, 33 43 C 30 46, ${27 - w} 50, ${25 - w} 55Z`, str(8, 30, 70, 18, 22));
    else top = withStrands(`M${25 - w} 55 C ${23 - w} 31, 36 17, 50 17 C 64 17, ${77 + w} 31, ${75 + w} 55 C 73.5 42, 69 33, 60 31.5 C 54 33.5, 46 33.5, 40 31.5 C 31 33, ${26.5 - w} 42, ${25 - w} 55Z`, str(11, 28, 72, 17, 18));
  }

  // ---------- o que vai na cabeça ----------
  const gem = (x: number, y: number, c: string, r = 1.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff" opacity=".7"/>`;
  const wear: Record<Face['wear'], string> = {
    coroa: `<path d="M29 31.5 L28 13 L36.5 22.5 L43 9.5 L50 21 L57 9.5 L63.5 22.5 L72 13 L71 31.5Z" fill="url(#${u}au)" stroke="#5c3f12" stroke-width=".9" stroke-linejoin="round"/>
      ${gem(28, 12.5, '#e7d9a8', 1.3)}${gem(43, 9, '#e7d9a8', 1.3)}${gem(57, 9, '#e7d9a8', 1.3)}${gem(72, 12.5, '#e7d9a8', 1.3)}
      <path d="M28.4 27.5 Q50 24.6 71.6 27.5 L71.8 34 Q50 31 28.2 34Z" fill="url(#${u}au)" stroke="#5c3f12" stroke-width=".9"/>
      ${gem(50, 30.4, '#9c1c2c', 2)}${gem(39.5, 31, '#24614a', 1.4)}${gem(60.5, 31, '#24614a', 1.4)}
      <path d="M30 28.5 Q50 26 70 28.5" stroke="#fff3c8" stroke-width=".5" opacity=".6" fill="none"/>`,
    nada: '',
    elmo: `<linearGradient id="${u}st" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9bec2"/><stop offset=".5" stop-color="#777c80"/><stop offset="1" stop-color="#3a3e41"/></linearGradient>
      <path d="M${22 - w} 60 C ${19 - w} 26, 34 14, 50 14 C 66 14, ${81 + w} 26, ${78 + w} 60 L${74 + w} 61 C ${73 + w} 42, 68 33, 50 33 C 32 33, ${27 - w} 42, ${26 - w} 61Z" fill="url(#${u}st)" stroke="#2c3033" stroke-width=".9"/>
      <path d="M47.8 33 L52.2 33 L51.4 66 L48.6 66Z" fill="url(#${u}st)" stroke="#2c3033" stroke-width=".7"/><path d="M26 41 Q50 31 74 41" stroke="#2c3033" stroke-width="1" fill="none"/>
      ${Array.from({ length: 7 }, (_, i) => `<circle cx="${30 + i * 6.6}" cy="${38.5 - Math.sin((i / 6) * Math.PI) * 4}" r=".7" fill="#d8dcdf"/>`).join('')}`,
    capuz: `<linearGradient id="${u}hd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b5d49"/><stop offset="1" stop-color="#2f271e"/></linearGradient>
      <path d="M10 120 C 8 56, 26 15, 50 15 C 74 15, 92 56, 90 120 L${76 + w} 120 C ${80 + w} 92, ${78 + w} 62, ${74 + w} 46 C 70 31, 61 27, 50 27 C 39 27, 30 31, ${26 - w} 46 C ${22 - w} 62, ${20 - w} 92, ${24 - w} 120Z" fill="url(#${u}hd)"/>
      <path d="M${26 - w} 46 C 30 31, 39 27, 50 27 C 61 27, 70 31, ${74 + w} 46" fill="none" stroke="#1b150f" stroke-width="2.4" opacity=".7"/>`,
    chapeu: `<ellipse cx="50" cy="32" rx="35" ry="7" fill="#2f251c"/><path d="M32 32 C 32 18, 40 11, 51 11 C 62 11, 68 18, 68 32Z" fill="#45362a"/><path d="M32.4 28 Q50 25 67.6 28 L68 31.5 Q50 28.6 32 31.5Z" fill="#8b6a3a"/><path d="M66 22 C 76 16, 86 18, 92 12" stroke="#7a2e22" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    tonsura: `<path d="M${25 - w} 56 C ${23 - w} 40, 27 33, 33 30.5 C 36 39, 43 42, 50 42 C 57 42, 64 39, 67 30.5 C 73 33, ${77 + w} 40, ${75 + w} 56 C 72 47, 66 44.5, 60 45 C 54 46.6, 46 46.6, 40 45 C 34 44.5, 28 47, ${25 - w} 56Z" fill="url(#${u}hr)"/>`,
    diadema: `<path d="M27.5 39 Q50 30.5 72.5 39" fill="none" stroke="#d9d2c0" stroke-width="2"/><path d="M27.5 39 Q50 30.5 72.5 39" fill="none" stroke="#fff" stroke-width=".5" opacity=".7"/>${gem(50, 34, '#3a6a92', 2)}`,
    gorro: `<path d="M26.5 41 C 27 23, 37 15, 50 15 C 63 15, 73 23, 73.5 41 C 60 36, 40 36, 26.5 41Z" fill="#6b2626"/><path d="M26.5 41 C 40 36, 60 36, 73.5 41 L74 44.5 C 60 39.5, 40 39.5, 26 44.5Z" fill="#4a1919"/><path d="M40 18 Q46 26 44 37 M58 18 Q54 26 56 37" stroke="#4a1919" stroke-width=".8" fill="none"/>`,
  };

  let r = seed * 9301 + 49297;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const palette = [mix(bgTone, '#000', 0.4), mix(bgTone, '#d8b47a', 0.18), mix(bgTone, '#5f8282', 0.22), mix(bgTone, '#8a3e30', 0.2), mix(bgTone, '#000', 0.2)];
  const bgStrokes = Array.from({ length: 34 }, (_, i) => {
    const x = rnd() * 112 - 6, y = rnd() * 124 - 2, l = 10 + rnd() * 20, dy = -l * (0.5 + rnd() * 0.5);
    const far = Math.hypot(x - 42, y - 36) / 70; // mais escuro longe da luz
    const c = palette[far > 0.7 ? (i % 2 ? 0 : 4) : Math.floor(rnd() * 4)];
    return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(l * 0.4).toFixed(1)} ${(dy * 0.6).toFixed(1)} ${(l * 0.7).toFixed(1)} ${dy.toFixed(1)}" stroke="${c}" stroke-width="${(3 + rnd() * 7).toFixed(1)}" opacity="${(0.3 + rnd() * 0.4).toFixed(2)}"/>`;
  }).join('');
  return `<svg class="portrait" viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" role="img" aria-label="retrato">${defs}
    <g clip-path="url(#${u}c)">
      <rect width="100" height="120" fill="url(#${u}bg)"/>
      <g fill="none" stroke-linecap="round" filter="url(#${u}p)">${bgStrokes}</g>
      <g filter="url(#${u}p)">
      ${back}${mantle[f.mantle]}${neck}
      <ellipse cx="50" cy="91" rx="10" ry="3" fill="#000" opacity=".3" filter="url(#${u}b)"/>
      ${ears}${shading}${ageMarks}${eyes}${nose}${beard}${mouth}${scar}${top}${wear[f.wear]}
      <path d="${head}" fill="url(#${u}lt)"/>
      </g>
      <rect width="100" height="120" filter="url(#${u}t)" opacity=".9"/>
    </g></svg>`;
}

export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Rosto de quem pede audiência, estável pelo nome do papel. */
export function roleFace(role: string, face: string, mood: number): Face {
  const h = hashStr(role);
  const wear: Face['wear'] = ({ soldado: 'elmo', mercador: 'chapeu', campones: 'capuz', clerigo: 'tonsura', nobre: 'diadema', tesoureiro: 'gorro', intendente: 'gorro', espiao: 'capuz' } as Record<string, Face['wear']>)[face] ?? 'nada';
  const mantle: Face['mantle'] = ({ soldado: 'cota', mercador: 'rico', campones: 'simples', clerigo: 'habito', nobre: 'rico', tesoureiro: 'rico', intendente: 'simples', espiao: 'simples' } as Record<string, Face['mantle']>)[face] ?? 'simples';
  return {
    skin: h % 5, hair: (h >>> 3) % 6, hairStyle: (h >>> 6) % 5, beard: (h >>> 9) % 3, scar: (h >>> 11) % 7 === 0,
    build: (h >>> 13) % 3, age: 26 + ((h >>> 15) % 38), female: (h >>> 20) % 4 === 0 && face !== 'soldado', mood, wear, mantle,
  };
}
