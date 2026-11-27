import type { RngState } from './rng';

export const GOODS = ['grao', 'sal', 'la', 'tecido', 'ferro', 'madeira'] as const;
export type GoodId = (typeof GOODS)[number];

export const STRATA = ['camponeses', 'artesaos', 'mercadores', 'clero', 'nobreza'] as const;
export type StratumId = (typeof STRATA)[number];

export const PROVS = ['valtheris', 'altamar', 'veyra', 'dornhelm', 'caldris', 'merovan', 'rhovan', 'esteren'] as const;
export type ProvId = (typeof PROVS)[number];

export type Sector = 'agri' | 'pesca' | 'sal' | 'pasto' | 'mina' | 'mata';

export interface Stratum {
  pop: number;
  wealth: number; // poupança em coroas
  humor: number; // -100..100 (estado, não termina o jogo)
  hunger: number; // 0..1 fração da necessidade de grão não atendida no último ciclo
  lack: number; // 0..1 carência de outros bens
  income: number; // renda do último ciclo
}

export interface Grievance {
  id: string;
  label: string;
  weight: number; // efeito atual no humor (negativo = ressentimento)
  decay: number; // fração que se perde por mês
  strata: StratumId[];
  fact?: string;
}

export type UnrestLevel = 'calma' | 'tensa' | 'motins' | 'revolta';

export interface Garrison {
  soldiers: number;
  morale: number; // 0..1
  arrears: number; // coroas devidas
  monthsUnpaid: number;
}

export interface Province {
  id: ProvId;
  strata: Record<StratumId, Stratum>;
  stock: Record<GoodId, number>;
  price: Record<GoodId, number>;
  demandAvg: Record<GoodId, number>;
  taxRate: number;
  exemptUntilMonth: number; // índice de mês absoluto; -1 = sem isenção
  rain: number; // anomalia de chuva do mês (-1 seca .. +1 encharcado)
  growRain: number[]; // anomalias dos meses de crescimento deste ano
  blight: boolean; // praga no campo neste ano
  unrest: UnrestLevel;
  unrestMonths: number; // meses consecutivos abaixo do limiar
  grievances: Grievance[];
  garrison: Garrison;
  toolsMet: number; // 0..1 ferro para ferramentas atendido no último ciclo
  lastHarvestFactor: number;
  tradeIn: Record<GoodId, number>; // último ciclo
  tradeOut: Record<GoodId, number>;
  relief: number; // grão distribuído pela Coroa, ainda por consumir
  requisition: number; // grão tomado por soldados sem soldo no último ciclo
}

export interface FactFactor {
  label: string;
  amount?: number; // contribuição com sinal, na unidade do fato
  ref?: string; // id de outro fato (o fio continua)
  note?: string;
}

/** Um nó dos Fios: um valor, num momento, com as causas que o produziram. */
export interface Fact {
  id: string;
  day: number;
  key: string;
  label: string;
  value?: number;
  unit?: string;
  text?: string;
  source?: string;
  factors: FactFactor[];
}

export interface ChronEntry {
  id: string;
  day: number;
  kind: 'clima' | 'economia' | 'povo' | 'tesouro' | 'guerra' | 'decreto' | 'politica' | 'reinado';
  title: string;
  text: string;
  prov?: ProvId;
  fact?: string;
  weight: number; // 1 menor .. 3 maior
}

export type GroupId =
  | `casa:${HouseId}`
  | 'igreja'
  | 'exercito'
  | 'liga'
  | `povo:${ProvId}`;

export type HouseId = 'vaelmont' | 'avarenne' | 'deveyr' | 'dorn' | 'caldran' | 'merrow' | 'rhovar' | 'esteren';

export type Rung = 0 | 1 | 2 | 3 | 4 | 5; // 0 aceita, 1 murmúrio, 2 recusa, 3 alternativa, 4 conspiração, 5 ruptura

export interface Group {
  id: GroupId;
  acceptance: number; // -100..100
  rung: Rung;
  rungMonths: number;
  interest: number; // componente de interesses materiais (calculado por sistema)
  memory: Grievance[]; // o que o grupo lembra do soberano
  wealth: number; // para casas e Igreja
  present: boolean; // casas: tem representante na capital
}

export interface Order {
  id: string;
  issued: number;
  arrives: number;
  target: ProvId;
  decree: Decree;
  label: string;
  done: boolean;
}

export type Decree =
  | { verb: 'taxar'; prov: ProvId | 'reino'; rate: number }
  | { verb: 'isentar'; prov: ProvId; months: number }
  | { verb: 'tarifa'; rate: number }
  | { verb: 'pedagio'; rate: number }
  | { verb: 'comprar_grao'; prov: ProvId; qty: number }
  | { verb: 'distribuir_grao'; prov: ProvId; qty: number }
  | { verb: 'importar_grao'; qty: number }
  | { verb: 'pagar_soldo'; prov: ProvId; share: number }
  | { verb: 'enviar_tropas'; from: ProvId; to: ProvId; qty: number }
  | { verb: 'credito_liga'; accept: boolean }
  | { verb: 'doar_igreja'; amount: number }
  | { verb: 'convocar_casa'; house: HouseId }
  | { verb: 'esperar'; dispatch: string }
  | { verb: 'persuadir'; dispatch: string; check: string };

export interface Command {
  day: number;
  decree: Decree;
  publico: boolean;
  text?: string;
}

export interface DispatchOption {
  label: string;
  decree: Decree;
}

export interface Voice { skill: SkillId | 'memoria'; text: string }

export interface Dispatch {
  id: string;
  topic?: string;
  voices?: Voice[];
  day: number;
  expires: number;
  who: string; // papel de quem fala
  face: 'soldado' | 'mercador' | 'campones' | 'clerigo' | 'nobre' | 'tesoureiro' | 'intendente' | 'espiao';
  prov?: ProvId;
  group?: GroupId;
  title: string;
  text: string;
  options: DispatchOption[];
  fact?: string;
  urgent: boolean;
  answered: boolean;
  tried?: string[]; // testes já tentados nesta audiência (cada um só uma vez)
}

export interface Report {
  prov: ProvId;
  madeDay: number;
  arrives: number;
  source: string;
  certainty: 'visto' | 'relatorio' | 'estimativa' | 'boato';
  pop: number;
  hunger: number;
  humor: number;
  grainStock: number;
  grainMonths: number;
  grainPrice: number;
  unrest: UnrestLevel;
  soldiers: number;
  morale: number;
  facts: Record<string, string>; // chave -> id do fato
}

export const SKILLS = ['encanto', 'lingua', 'peso', 'rostos', 'teia', 'tinta', 'vela', 'mao', 'remorso', 'couro', 'aco', 'faro'] as const;
export type SkillId = (typeof SKILLS)[number];

/** Resultado de um teste ativo, para a interface mostrar. */
export interface CheckResult { id: string; day: number; skill: SkillId; chance: number; success: boolean; title: string; text: string }

export type Oficio = 'faxineiro' | 'cozinheiro' | 'cavalarico' | 'copista' | 'lavadeiro' | 'carrasco' | 'jardineiro';
export type Laco = 'riso' | 'verdade' | 'cuidado' | 'salvou';

export interface Sovereign {
  name: string;
  title: 'rei' | 'rainha';
  age: number;
  oficio: Oficio;
  origem: ProvId;
  laco: Laco;
  traits: string[];
  look: { skin: number; hair: number; hairStyle: number; beard: number; scar: boolean; build: number };
  skills?: Record<SkillId, number>; // 1..6; saves antigos não têm, e caem na base do ofício
}

export interface World {
  version: 1;
  seed: number;
  rng: RngState;
  day: number; // dias desde o início da campanha
  sovereign: Sovereign;
  provinces: Record<ProvId, Province>;
  treasury: {
    coin: number;
    debt: number;
    interest: number; // por mês
    adminArrears: number;
    lastIncome: number;
    lastExpense: number;
    history: { month: number; coin: number; income: number; expense: number }[];
  };
  port: { tariff: number; world: Record<GoodId, number> };
  tolls: number;
  liga: { offer: null | { amount: number; rate: number; expires: number }; privilegeUntilMonth: number };
  granary: number; // celeiro real (sacas de grão em Valtheris)
  karsk: { troops: number; aggression: number; lastRaidMonth: number; estimate: number };
  groups: Record<string, Group>;
  anointed: boolean;
  pretender: number; // 0..1 quanto se fala de um pretendente
  orders: Order[];
  facts: Record<string, Fact>;
  factIndex: Record<string, string>;
  seq: number;
  chronicle: ChronEntry[];
  dispatches: Dispatch[];
  reports: Partial<Record<ProvId, Report>>;
  pendingReports: Report[];
  log: Command[];
  pauseRequest: string | null;
  lastCheck?: CheckResult;
  flows: { a: ProvId | 'mar'; b: ProvId | 'mar'; g: GoodId; qty: number }[];
}
