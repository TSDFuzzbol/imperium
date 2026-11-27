// Habilidades do soberano (CONFIRMADO pelo Tales em 27/11/2026: nomes, porcentagem na tela, 2d6 por baixo).
// Vozes interiores: testes passivos feitos quando alguém pede audiência.
// Testes ativos: opções "[Habilidade, 35%]" nas audiências, com efeito real na simulação.
import { HOUSES, PROV_DATA } from '../data/eldoria';
import { chron, clamp, fact, remember } from './core';
import { rand } from './rng';
import { SKILLS } from './types';
import type { CheckResult, Dispatch, GroupId, HouseId, Laco, Oficio, ProvId, SkillId, Voice, World } from './types';

export const SKILL_DATA: Record<SkillId, { name: string; attr: 'voz' | 'olho' | 'alma' | 'sangue'; what: string; use: string }> = {
  encanto: { name: 'Encanto', attr: 'voz', what: 'O sorriso que abre portas.', use: 'Conquistar o povo e os indecisos.' },
  lingua: { name: 'Língua de Prata', attr: 'voz', what: 'Argumento, lisonja, a frase certa.', use: 'Convencer o conselho e negociar.' },
  peso: { name: 'Peso da Coroa', attr: 'voz', what: 'O silêncio que faz os outros se curvarem.', use: 'Impor respeito às casas.' },
  rostos: { name: 'Leitor de Rostos', attr: 'olho', what: 'Vê o medo atrás da reverência.', use: 'Saber quem mente.' },
  teia: { name: 'Teia', attr: 'olho', what: 'Quem deve a quem, quem dorme com quem.', use: 'Achar conspirações.' },
  tinta: { name: 'Tinta e Pó', attr: 'olho', what: 'Arquivos, leis velhas, números falsos.', use: 'Impostos e contas.' },
  vela: { name: 'Vela Acesa', attr: 'alma', what: 'A fé que sobrou, ou a que você finge.', use: 'A Ordem da Fé e o consolo.' },
  mao: { name: 'Mão Firme', attr: 'alma', what: 'Não tremer quando todos olham.', use: 'Decidir sob pressão.' },
  remorso: { name: 'Remorso', attr: 'alma', what: 'Lembra cada morto das suas ordens.', use: 'Pesa antes da crueldade.' },
  couro: { name: 'Couro Duro', attr: 'sangue', what: 'Aguenta frio, febre e veneno.', use: 'Sobreviver e governar doente.' },
  aco: { name: 'Aço', attr: 'sangue', what: 'O braço que sabe segurar uma lâmina.', use: 'Duelos e o respeito do exército.' },
  faro: { name: 'Faro de Cão', attr: 'sangue', what: 'O pelo da nuca que arrepia.', use: 'Pressentir perigo e traição.' },
};
export const ATTR_NAMES = { voz: 'Voz', olho: 'Olho', alma: 'Alma', sangue: 'Sangue' } as const;
export const FREE_POINTS = 6;
export const SKILL_MAX = 6;

const OFICIO_BASE: Record<Oficio, Partial<Record<SkillId, number>>> = {
  faxineiro: { rostos: 2, faro: 1, teia: 1 },
  cozinheiro: { couro: 1, faro: 1, rostos: 1, encanto: 1 },
  cavalarico: { aco: 2, couro: 1, mao: 1 },
  copista: { tinta: 3, teia: 1 },
  lavadeiro: { teia: 2, rostos: 2 },
  carrasco: { mao: 2, aco: 1, faro: 1 },
  jardineiro: { vela: 1, couro: 1, remorso: 1, encanto: 1 },
};
const LACO_BASE: Record<Laco, SkillId> = { riso: 'encanto', verdade: 'remorso', cuidado: 'vela', salvou: 'aco' };

/** Pontos que vêm do passado (ofício e laço), antes dos pontos livres. */
export function baseSkills(oficio: Oficio, laco: Laco): Record<SkillId, number> {
  const s = Object.fromEntries(SKILLS.map((k) => [k, 1])) as Record<SkillId, number>;
  for (const [k, v] of Object.entries(OFICIO_BASE[oficio])) s[k as SkillId] += v!;
  s[LACO_BASE[laco]] += 1;
  return s;
}
export function skillOf(w: World, k: SkillId) {
  return (w.sovereign.skills ?? baseSkills(w.sovereign.oficio, w.sovereign.laco))[k];
}

// ---------- probabilidade (2d6 + habilidade + circunstância contra a dificuldade) ----------
const TWO_D6 = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]; // formas de tirar 0..12 em 36
export function chanceOf(skill: number, mod: number, dc: number) {
  let ok = 0;
  for (let r = 2; r <= 12; r++) if (r === 12 || (r !== 2 && r + skill + mod >= dc)) ok += TWO_D6[r];
  return clamp(ok / 36, 0.03, 0.97);
}
function roll2d6(w: World) { return 1 + Math.floor(rand(w.rng) * 6) + 1 + Math.floor(rand(w.rng) * 6); }

// ---------- testes ativos ----------
interface CheckDef {
  id: string; skill: SkillId; dc: number; label: string;
  ok: (w: World, d: Dispatch) => string; fail: (w: World, d: Dispatch) => string;
  resolves?: boolean; // sucesso encerra a audiência
}
const mem = (w: World, g: GroupId | undefined, id: string, label: string, weight: number, f?: string) => { if (g) remember(w.groups[g].memory, { id, label, weight, decay: 0.12, strata: [], fact: f }); };
const provMem = (w: World, p: ProvId, id: string, label: string, weight: number) => remember(w.provinces[p].grievances, { id, label, weight, decay: 0.2, strata: ['camponeses', 'artesaos', 'mercadores'] });
const morale = (w: World, p: ProvId, d: number) => { const g = w.provinces[p].garrison; g.morale = clamp(g.morale + d, 0.05, 1); };

function checksFor(topic: string, param: string): CheckDef[] {
  switch (topic) {
    case 'soldo': return [{
      id: 'soldo:lingua', skill: 'lingua', dc: 10, resolves: true, label: 'Convencer o capitão a esperar até a colheita',
      ok: (w) => { morale(w, 'rhovan', 0.06); mem(w, 'exercito', 'palavra', 'O soberano deu a palavra', 4); return 'O capitão aceitou esperar. Saiu dizendo aos homens que o soberano falou com ele de igual para igual.'; },
      fail: (w) => { morale(w, 'rhovan', -0.07); mem(w, 'exercito', 'promessa', 'Promessas no lugar de prata', -5); return 'O capitão ouviu, agradeceu e não acreditou. Os homens souberam da conversa antes do jantar.'; },
    }];
    case 'tarifa': return [{
      id: 'tarifa:lingua', skill: 'lingua', dc: 9, resolves: true, label: 'Prometer rever a tarifa depois da colheita',
      ok: (w) => { mem(w, 'casa:avarenne', 'revisao', 'Promessa de rever a tarifa', 4); provMem(w, 'altamar', 'revisao', 'Promessa de rever a tarifa', 5); return 'O mestre dos armadores saiu satisfeito. Altamar espera, por enquanto.'; },
      fail: (w) => { mem(w, 'casa:avarenne', 'enrolacao', 'Enrolados pelo soberano', -4); return 'O mestre entendeu a manobra. "Já ouvi isso de Teodoro", disse na saída.'; },
    }];
    case 'liga': return [{
      id: 'liga:tinta', skill: 'tinta', dc: 10, label: 'Ler as letras miúdas e pedir juros menores',
      ok: (w, d) => {
        const o = w.liga.offer; if (!o) return 'A oferta já não existe.';
        const old = o.rate; o.rate = Math.round(o.rate * 0.75 * 10000) / 10000;
        const pct = (x: number) => (x * 100).toFixed(1).replace('.', ',') + '%';
        d.text = d.text.replace(pct(old), pct(o.rate));
        return `Achou uma cláusula que a Liga preferia que ninguém lesse. Os juros caíram de ${pct(old)} para ${pct(o.rate)} ao mês.`;
      },
      fail: (w) => { mem(w, 'liga', 'desconfianca', 'O soberano duvidou da Liga', -3); return 'Você não achou nada, e o banqueiro percebeu que você procurava.'; },
    }];
    case 'fome': return [{
      id: `fome:vela`, skill: 'vela', dc: 9, label: 'Mandar uma carta sua para ser lida nas igrejas',
      ok: (w) => { const p = param as ProvId; mem(w, `povo:${p}`, 'carta', 'A carta do soberano', 5); provMem(w, p, 'carta', 'A carta do soberano lida na missa', 6); return `A carta foi lida em todas as igrejas de ${PROV_DATA[p].name}. Muita gente chorou. Pão ela não dá.`; },
      fail: (w) => { const p = param as ProvId; mem(w, `povo:${p}`, 'palavras', 'Palavras não enchem barriga', -3); return `Em ${PROV_DATA[p].name}, riram da carta. "Que ele mande pão, não reza."`; },
    }];
    case 'ordem': return [{
      id: 'ordem:peso', skill: 'peso', dc: 12, resolves: true, label: 'Exigir que os líderes venham a Valtheris',
      ok: (w) => { const p = param as ProvId; provMem(w, p, 'convocados', 'Os líderes foram ouvidos na capital', 8); mem(w, `povo:${p}`, 'convocados', 'Recebidos pelo soberano', 3); return `Os líderes de ${PROV_DATA[p].name} vieram, de chapéu na mão. Voltaram com promessas e medo, e a cidade acalmou.`; },
      fail: (w) => { const p = param as ProvId; provMem(w, p, 'desafio', 'Desafiaram o soberano e nada aconteceu', -6); return `Ninguém de ${PROV_DATA[p].name} apareceu. Agora todos sabem que a ordem pode ser ignorada.`; },
    }, {
      id: 'ordem:encanto', skill: 'encanto', dc: 11, resolves: true, label: 'Prometer ouvir as queixas em pessoa',
      ok: (w) => { const p = param as ProvId; provMem(w, p, 'ouvidos', 'O soberano prometeu ouvir', 6); mem(w, `povo:${p}`, 'ouvidos', 'Um soberano que escuta', 5); return 'A promessa correu pelas ruas mais rápido que o mensageiro. Por ora, esperam para ver.'; },
      fail: (w) => { const p = param as ProvId; mem(w, `povo:${p}`, 'conversa', 'Conversa de palácio', -3); return 'Ninguém acreditou. "Os reis sempre ouvem, depois da colheita."'; },
    }];
    case 'karsk': return [{
      id: 'karsk:mao', skill: 'mao', dc: 10, resolves: true, label: 'Mandar segurar a linha sem reforços',
      ok: (w) => { morale(w, 'rhovan', 0.08); mem(w, 'exercito', 'firmeza', 'Firmeza diante de Karsk', 3); return 'Sua carta foi lida em voz alta no Forte de Vhal. Os homens decidiram que um soberano assim merece a fronteira segura.'; },
      fail: (w) => { morale(w, 'rhovan', -0.08); return 'A carta saiu fria demais. Em Rhovan, leram abandono.'; },
    }];
    case 'tesouro': return [{
      id: 'tesouro:tinta', skill: 'tinta', dc: 10, label: 'Revisar as contas você mesmo, à luz de vela',
      ok: (w) => { const found = Math.round((3000 + rand(w.rng) * 6000) / 100) * 100; w.treasury.coin += found; return `Três noites de livros. Você achou ${found.toLocaleString('pt-BR')} coroas desviadas por um escrivão, que já não trabalha no tesouro.`; },
      fail: () => 'Os números dançaram na sua frente até o amanhecer. Se há desvio, ele é melhor do que você.',
    }];
    case 'casa': {
      const h = param as HouseId; const g = `casa:${h}` as GroupId; const name = HOUSES[h].name;
      return [{
        id: 'casa:peso', skill: 'peso', dc: 11, resolves: true, label: 'Mandar um recado que não é um pedido',
        ok: (w) => { w.groups[g].present = true; mem(w, g, 'curvou', 'Curvou-se ao soberano', -2); return `A ${name} mandou um representante na mesma semana. Ele não sorriu, mas se curvou.`; },
        fail: (w) => { mem(w, g, 'ameaca', 'Ameaçados por um criado de coroa', -6); return `A ${name} respondeu com uma carta educada e nenhum representante. A corte inteira leu.`; },
      }, {
        id: 'casa:encanto', skill: 'encanto', dc: 10, resolves: true, label: 'Escrever de próprio punho, com humildade',
        ok: (w) => { w.groups[g].present = true; mem(w, g, 'humildade', 'Uma carta humilde do soberano', 3); return `A ${name} achou graça na carta, e graça é um começo. Um primo distante chegou à corte.`; },
        fail: (w) => { mem(w, g, 'fraqueza', 'O soberano implora', -3); return `"Ele implora", riram na ${name}. A carta circulou pelas outras casas.`; },
      }];
    }
    case 'igreja': return [{
      id: 'igreja:vela', skill: 'vela', dc: 11, label: 'Rezar com o arcediago, sem testemunhas',
      ok: (w) => { mem(w, 'igreja', 'oracao', 'Rezou com o arcediago', 8); return 'O arcediago saiu da capela diferente. Na Ordem, já se fala de você como alguém de fé.'; },
      fail: (w) => { mem(w, 'igreja', 'fe-ocasiao', 'Fé de ocasião', -4); return 'Você errou a ordem das orações. O arcediago não disse nada, e isso disse tudo.'; },
    }];
    default: return [];
  }
}
function splitTopic(d: Dispatch) { const t = d.topic ?? d.id.split(':')[1]; const [topic, param = ''] = t.split(':'); return { topic, param }; }

export function dispatchChecks(w: World, d: Dispatch) {
  const { topic, param } = splitTopic(d);
  return checksFor(topic, param).filter((c) => !(d.tried ?? []).includes(c.id)).map((c) => ({ ...c, chance: checkChance(w, d, c) }));
}
function mod(w: World, d: Dispatch) { return d.group ? clamp(Math.round(w.groups[d.group].acceptance / 25), -3, 3) : 0; }
function checkChance(w: World, d: Dispatch, c: CheckDef) { return chanceOf(skillOf(w, c.skill), mod(w, d), c.dc); }

/** Faz o teste. Chamado por issue() para o verbo 'persuadir'. */
export function runCheck(w: World, dispatchId: string, checkId: string): string | null {
  const d = w.dispatches.find((x) => x.id === dispatchId && !x.answered);
  if (!d) return 'Essa audiência já terminou.';
  const { topic, param } = splitTopic(d);
  const c = checksFor(topic, param).find((x) => x.id === checkId);
  if (!c || (d.tried ?? []).includes(checkId)) return 'Esse caminho já foi tentado.';
  const chance = checkChance(w, d, c);
  const r = roll2d6(w);
  const success = r === 12 || (r !== 2 && r + skillOf(w, c.skill) + mod(w, d) >= c.dc);
  (d.tried ??= []).push(checkId);
  const text = success ? c.ok(w, d) : c.fail(w, d);
  if (success && c.resolves) d.answered = true;
  const name = SKILL_DATA[c.skill].name;
  const f = fact(w, `teste:${checkId}`, `${name}: ${success ? 'sucesso' : 'falha'}`, [
    { label: `Habilidade ${name}: ${skillOf(w, c.skill)}` },
    { label: `Dificuldade: ${c.dc}` },
    { label: mod(w, d) ? `Disposição de quem ouve: ${mod(w, d) > 0 ? '+' : ''}${mod(w, d)}` : 'Quem ouve não tem disposição a favor nem contra' },
    { label: `Chance: ${Math.round(chance * 100)}%` },
  ], { source: 'você mesmo' });
  const res: CheckResult = { id: `${checkId}:${w.day}`, day: w.day, skill: c.skill, chance, success, title: c.label, text };
  w.lastCheck = res;
  chron(w, { kind: 'reinado', weight: 2, prov: d.prov, fact: f, title: `${c.label}: ${success ? 'conseguiu' : 'falhou'}`, text });
  return null;
}

// ---------- vozes interiores ----------
type VoiceDef = { skill: SkillId; dc: number; text: (w: World, d: Dispatch, param: string) => string };
const VOICES: Record<string, VoiceDef[]> = {
  soldo: [
    { skill: 'rostos', dc: 9, text: () => 'Ele não quer só a prata. Quer ser ouvido na frente dos homens dele.' },
    { skill: 'faro', dc: 10, text: () => 'Quando ele falou de Karsk, olhou para a porta. Alguém em Rhovan já está conversando com o outro lado.' },
    { skill: 'aco', dc: 8, text: () => 'Mão calejada, cicatriz no queixo. Esse homem já segurou uma ponte. Merece mais que um "aguarde".' },
  ],
  colheita: [
    { skill: 'couro', dc: 9, text: () => 'Você sente na pele: o ar de Veyra está seco demais para março. O intendente está sendo otimista.' },
    { skill: 'remorso', dc: 10, text: () => 'Se a colheita falhar, quem morre primeiro são os que nunca vão saber o seu nome.' },
  ],
  tarifa: [
    { skill: 'teia', dc: 9, text: () => 'A Casa Avarenne tem metade dos navios de Altamar. O "porto" que ele defende tem dono.' },
    { skill: 'tinta', dc: 10, text: () => 'Pelos livros, a tarifa rende pouco. O que pesa é o tecido de Caldran, que ela protege.' },
  ],
  liga: [
    { skill: 'tinta', dc: 9, text: () => 'Três anos de pedágio pela metade custam mais que os juros. Faça a conta antes de sorrir.' },
    { skill: 'rostos', dc: 10, text: () => 'O banqueiro sorri com a boca. Os olhos estão contando o seu reino.' },
    { skill: 'teia', dc: 11, text: () => 'A Liga emprestou a Teodoro também. E foi a Liga que mais lucrou com a morte dele.' },
  ],
  fome: [
    { skill: 'remorso', dc: 7, text: () => 'Casca de árvore. Você conhece o gosto. Quem cresceu servindo conhece.' },
    { skill: 'rostos', dc: 9, text: () => 'O pároco não está exagerando. Ele está escolhendo as palavras para não chorar na sua frente.' },
    { skill: 'vela', dc: 10, text: () => 'Se a Igreja alimenta quem você não alimenta, é a Igreja que eles vão seguir.' },
  ],
  ordem: [
    { skill: 'mao', dc: 9, text: () => 'Hesitar agora é pior que errar. Decida antes do jantar.' },
    { skill: 'remorso', dc: 9, text: () => 'Soldados numa cidade com fome não mantêm a ordem. Fazem viúvas.' },
    { skill: 'teia', dc: 11, text: (w, d, p) => `Motim não nasce sozinho. Alguém em ${PROV_DATA[p as ProvId]?.name ?? 'lá'} está pagando a cerveja dos agitadores.` },
  ],
  karsk: [
    { skill: 'faro', dc: 8, text: () => 'Fogueiras demais para um acampamento, de menos para um exército. Karsk quer ser visto.' },
    { skill: 'aco', dc: 10, text: () => 'Rhovan tem rio na frente e forte nas costas. Com moral, metade daqueles homens segura o dobro.' },
  ],
  tesouro: [
    { skill: 'tinta', dc: 8, text: () => 'A coluna de "despesas da corte" é redonda demais. Números honestos nunca são redondos.' },
    { skill: 'lingua', dc: 10, text: () => 'O tesoureiro disse "devemos mais" rápido demais. Ele tem um credor favorito.' },
  ],
  casa: [
    { skill: 'peso', dc: 9, text: () => 'Uma cadeira vazia é uma pergunta. Se você não responder, a corte responde por você.' },
    { skill: 'teia', dc: 10, text: (w, d, p) => `A ${HOUSES[p as HouseId]?.name ?? 'casa'} não está ausente. Está esperando para ver quem cai primeiro.` },
  ],
  igreja: [
    { skill: 'vela', dc: 8, text: () => 'Ele não duvida de você. Ele duvida do preço. A Ordem quer uma cadeira no conselho.' },
    { skill: 'rostos', dc: 10, text: () => 'O arcediago evitou dizer "rei". Disse "Majestade" três vezes, como quem conta moedas.' },
  ],
};
const MEMORIA: Record<Oficio, string[]> = {
  faxineiro: ['Você já varreu o chão onde ele está de pé. Ele nunca olhou para baixo.', 'Os corredores ouvem tudo. Você sabe, porque você era o corredor.'],
  cozinheiro: ['Gente com fome fala devagar e mente rápido. Você aprendeu isso na fila da cozinha.', 'Quem traz o pão sabe quem come primeiro. Sempre os mesmos.'],
  cavalarico: ['Cavalo assustado não se acalma com grito. Gente também não.', 'Você conhece esse cheiro de estábulo nas botas dele. É de quem viajou a noite inteira.'],
  copista: ['Toda queixa vira papel, e todo papel um dia é lido por alguém como você.', 'As letras dele inclinam para a esquerda. Escreveu com pressa, ou com medo.'],
  lavadeiro: ['A camisa dele foi lavada ontem e já tem suor. Ele não dormiu.', 'Você já lavou o sangue de gente mais importante que ele.'],
  carrasco: ['Você já viu esse olhar no cadafalso. É de quem acha que ainda há saída.', 'Medo tem cheiro. Você aprendeu a não comentar.'],
  jardineiro: ['Tudo que cresce precisa de tempo. Quem tem fome não tem.', 'Raiz podre não aparece até a planta cair.'],
};

/** Testes passivos: quais vozes aparecem nesta audiência. */
export function attachVoices(w: World, d: Dispatch) {
  const { topic, param } = splitTopic(d);
  const out: Voice[] = [];
  for (const v of VOICES[topic] ?? []) {
    if (roll2d6(w) + skillOf(w, v.skill) >= v.dc && out.length < 2) out.push({ skill: v.skill, text: v.text(w, d, param) });
  }
  // a memória de criado cala com o tempo de trono
  if (rand(w.rng) < clamp(0.6 - w.day / 900, 0.08, 0.6)) {
    const lines = MEMORIA[w.sovereign.oficio];
    out.push({ skill: 'memoria', text: lines[Math.floor(rand(w.rng) * lines.length)] });
  }
  d.voices = out;
}
