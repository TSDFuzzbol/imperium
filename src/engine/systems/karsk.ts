// Karsk: o único vizinho ativo nesta fase. Age pelo que acredita ver em Rhovan (informação imperfeita).
import { chron, clamp, fact, latest, monthIndex, remember } from '../core';
import { chance, gauss, range } from '../rng';
import { PROVS } from '../types';
import type { World } from '../types';
import { lowerHumor } from './people';
import { fmt } from './economy';

export function karsk(w: World) {
  const K = w.karsk;
  const R = w.provinces.rhovan;
  const g = R.garrison;
  // o que os espiões de Karsk acham que existe em Rhovan
  const perceived = Math.max(200, g.soldiers * g.morale * (1 + 0.25 * gauss(w.rng)));
  // instabilidade de Eldoria, vista de longe
  let unrest = 0;
  for (const id of PROVS) unrest += lowerHumor(w.provinces[id]) < -40 ? 1 : 0;
  const instab = unrest / PROVS.length + w.pretender * 0.5 + (w.groups['casa:rhovar'].rung >= 4 ? 0.3 : 0);
  K.troops = Math.max(3000, K.troops + 120 + 1800 * instab + 300 * gauss(w.rng));
  K.aggression = clamp(K.aggression + 0.03 * gauss(w.rng) + 0.05 * (instab - 0.15), 0.05, 1);
  K.estimate = K.troops * (1 + 0.2 * gauss(w.rng));
  const kf = fact(w, 'karsk', 'Tropas de Karsk na fronteira', [
    { label: 'Reforços enviados por Kharad', amount: 120 },
    { label: 'Instabilidade que Karsk percebe em Eldoria', amount: 1800 * instab, ref: latest(w, 'pretendente') },
  ], { value: K.estimate, unit: 'soldados (estimativa)', source: 'comandante de Rhovan', text: `Agressividade percebida: ${Math.round(K.aggression * 100)}%` });
  const mi = monthIndex(w.day);
  if (mi - K.lastRaidMonth < 2) return;
  const ratio = (K.troops * 0.35 - perceived) / perceived;
  const p = clamp(0.02 + K.aggression * 0.25 * Math.max(0, ratio) + 0.12 * Math.max(0, K.aggression - 0.5), 0, 0.45);
  if (!chance(w.rng, p)) return;
  K.lastRaidMonth = mi;
  const force = K.troops * range(w.rng, 0.06, 0.15);
  const defense = g.soldiers * g.morale * range(w.rng, 0.8, 1.3) * 0.9;
  const place = ['Passo de Ardan', 'Pedra do Corvo', 'Forte de Vhal'][Math.floor(range(w.rng, 0, 3))];
  if (defense > force) {
    g.soldiers -= Math.round(force * 0.08);
    K.troops -= force * 0.3;
    g.morale = clamp(g.morale + 0.08, 0, 1);
    const rf = fact(w, 'incursao', `Incursão de Karsk repelida em ${place}`, [
      { label: 'Força da incursão', amount: force },
      { label: 'Defesa da guarnição (soldados × moral)', amount: defense, ref: latest(w, 'guarnicao:rhovan') },
      { label: 'Tropas de Karsk na fronteira', amount: K.troops, ref: kf },
    ], { source: 'comandante de Rhovan' });
    remember(w.groups.exercito.memory, { id: 'vitoria', label: `Vitória em ${place}`, weight: 6, decay: 0.08, strata: [] });
    chron(w, { kind: 'guerra', prov: 'rhovan', weight: 3, fact: rf, title: `Karsk repelido em ${place}`, text: `Cerca de ${fmt(force)} cavaleiros de Karsk atravessaram o Dorn à noite. A guarnição os esperava. O comandante de Rhovan manda dizer que os homens lutaram bem e que lutariam melhor com soldo.` });
  } else {
    const killed = R.strata.camponeses.pop * range(w.rng, 0.004, 0.012);
    R.strata.camponeses.pop -= killed;
    const loot = R.stock.grao * 0.18;
    R.stock.grao -= loot;
    g.soldiers -= Math.round(force * 0.15);
    g.morale = clamp(g.morale - 0.1, 0, 1);
    const rf = fact(w, 'incursao', `Karsk saqueia ${place}`, [
      { label: 'Força da incursão', amount: force },
      { label: 'Defesa da guarnição (soldados × moral)', amount: defense, ref: latest(w, 'guarnicao:rhovan') },
      { label: 'Tropas de Karsk na fronteira', amount: K.troops, ref: kf },
      { label: 'Mortos e levados', amount: -killed },
      { label: 'Grão saqueado', amount: -loot },
    ], { source: 'sobreviventes' });
    remember(R.grievances, { id: 'saque', label: 'Karsk saqueou nossas aldeias e a Coroa não veio', weight: -20, decay: 0.04, strata: ['camponeses', 'artesaos'], fact: rf });
    remember(w.groups['casa:rhovar'].memory, { id: 'desprotegida', label: 'A Coroa não protegeu Rhovan', weight: -8, decay: 0.05, strata: [], fact: rf });
    chron(w, { kind: 'guerra', prov: 'rhovan', weight: 3, fact: rf, title: `Karsk saqueia ${place}`, text: `Cavaleiros de Karsk queimaram aldeias perto de ${place}. Cerca de ${fmt(killed)} pessoas foram mortas ou levadas, e os celeiros foram esvaziados.` });
  }
  w.pauseRequest = 'Incursão de Karsk';
}
