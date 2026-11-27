import { writeFileSync } from 'node:fs';
import { portrait, roleFace } from '../src/ui/portrait';
const faces = [
  { skin: 1, hair: 0, hairStyle: 2, beard: 2, scar: false, build: 1, age: 34, female: false, mood: 10, wear: 'coroa', mantle: 'real' },
  { skin: 0, hair: 3, hairStyle: 0, beard: 1, scar: true, build: 2, age: 50, female: false, mood: -40, wear: 'nada', mantle: 'simples' },
  { skin: 2, hair: 1, hairStyle: 1, beard: 0, scar: false, build: 0, age: 24, female: false, mood: 40, wear: 'nada', mantle: 'rico' },
  { skin: 3, hair: 0, hairStyle: 0, beard: 0, scar: false, build: 0, age: 30, female: true, mood: 20, wear: 'coroa', mantle: 'real' },
  { skin: 0, hair: 5, hairStyle: 0, beard: 0, scar: false, build: 0, age: 60, female: true, mood: -20, wear: 'nada', mantle: 'simples' },
  { skin: 4, hair: 0, hairStyle: 4, beard: 2, scar: false, build: 2, age: 62, female: false, mood: 0, wear: 'nada', mantle: 'habito' },
] as const;
let h = faces.map((f, i) => portrait(f as any, 220, 'g' + i)).join('');
h += ['Capitão de Rhovan|soldado', 'Mestre dos armadores|mercador', 'Pároco|clerigo', 'Tesoureiro|tesoureiro', 'Mestre de cerimônias|nobre', 'Intendente|intendente'].map((s, i) => { const [r, f] = s.split('|'); return portrait(roleFace(r, f, -10), 220, 'r' + i); }).join('');
writeFileSync('out/gallery.html', `<body style="margin:0;background:#16110d;display:flex;flex-wrap:wrap;gap:8px;width:700px">${h}</body>`);
