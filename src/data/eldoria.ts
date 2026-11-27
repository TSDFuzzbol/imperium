// Dados de Eldoria. Populações e funções vêm da Memória Mestra v1.5 (seção 8.3).
// Todo número que não está no documento é PROPOSTA de calibração, para discutir com o Tales.
import type { GoodId, HouseId, ProvId, Sector, StratumId } from '../engine/types';

export interface ProvData {
  id: ProvId;
  name: string;
  role: string;
  pop: number;
  center: [number, number]; // coordenadas do mapa (0..1000 x 0..1200)
  settlements: string[];
  shares: Record<StratumId, number>;
  sectors: Partial<Record<Sector, number>>; // divisão dos camponeses por setor
  grainYield: number; // sacas de grão por pessoa do setor agrícola por ano (PROPOSTA)
  weave: number; // fração dos artesãos que tecem
  garrison: number;
  house: HouseId;
  foreign?: string; // vizinho estrangeiro na fronteira
}

export const PROV_DATA: Record<ProvId, ProvData> = {
  valtheris: {
    id: 'valtheris', name: 'Valtheris', role: 'Administração, comércio e serviços', pop: 390000,
    center: [505, 545], settlements: ['Valtheris', 'Bellacourt', 'Avenne', 'Ponte Velha'],
    shares: { camponeses: 0.55, artesaos: 0.3, mercadores: 0.08, clero: 0.04, nobreza: 0.03 },
    sectors: { agri: 0.85, pasto: 0.1, mata: 0.05 }, grainYield: 2.4, weave: 0.25, garrison: 1800, house: 'vaelmont',
  },
  altamar: {
    id: 'altamar', name: 'Altamar', role: 'Portos e navegação', pop: 310000,
    center: [520, 1010], settlements: ['Marévia', 'Porto Cinzento', 'Salina', 'Farol de Arven'],
    shares: { camponeses: 0.66, artesaos: 0.22, mercadores: 0.08, clero: 0.02, nobreza: 0.02 },
    sectors: { agri: 0.4, pesca: 0.3, sal: 0.15, pasto: 0.15 }, grainYield: 2.15, weave: 0.2, garrison: 900, house: 'avarenne',
  },
  veyra: {
    id: 'veyra', name: 'Veyra', role: 'Agricultura e grãos', pop: 470000,
    center: [330, 840], settlements: ['Veyrath', 'Campo Alto', 'Três Moinhos', 'Santa Eda'],
    shares: { camponeses: 0.86, artesaos: 0.08, mercadores: 0.03, clero: 0.02, nobreza: 0.01 },
    sectors: { agri: 0.92, pasto: 0.08 }, grainYield: 3.3, weave: 0.15, garrison: 400, house: 'deveyr', foreign: 'Edria',
  },
  dornhelm: {
    id: 'dornhelm', name: 'Dornhelm', role: 'Mineração e metalurgia', pop: 250000,
    center: [560, 215], settlements: ['Kaldheim', 'Mina de Varg', 'Ferro Velho', 'Pedra Branca'],
    shares: { camponeses: 0.72, artesaos: 0.2, mercadores: 0.04, clero: 0.02, nobreza: 0.02 },
    sectors: { agri: 0.45, mina: 0.45, mata: 0.1 }, grainYield: 2.1, weave: 0.1, garrison: 700, house: 'dorn', foreign: 'Mordane',
  },
  caldris: {
    id: 'caldris', name: 'Caldris', role: 'Pecuária e têxteis', pop: 330000,
    center: [190, 590], settlements: ['Caldria', 'Lã Branca', 'Torvale', 'São Orlan'],
    shares: { camponeses: 0.74, artesaos: 0.19, mercadores: 0.04, clero: 0.02, nobreza: 0.01 },
    sectors: { agri: 0.42, pasto: 0.53, mata: 0.05 }, grainYield: 2.15, weave: 0.6, garrison: 400, house: 'caldran', foreign: 'Valedorn',
  },
  merovan: {
    id: 'merovan', name: 'Merovan', role: 'Comércio e estradas', pop: 290000,
    center: [705, 790], settlements: ['Merova', 'Quatro Pontes', 'Estalagem Real', 'Vado do Rei'],
    shares: { camponeses: 0.68, artesaos: 0.18, mercadores: 0.1, clero: 0.02, nobreza: 0.02 },
    sectors: { agri: 0.75, pasto: 0.15, mata: 0.1 }, grainYield: 2.4, weave: 0.3, garrison: 500, house: 'merrow', foreign: 'Theryn',
  },
  rhovan: {
    id: 'rhovan', name: 'Rhovan', role: 'Fronteira militar', pop: 190000,
    center: [840, 470], settlements: ['Rhovar', 'Forte de Vhal', 'Pedra do Corvo', 'Passo de Ardan'],
    shares: { camponeses: 0.82, artesaos: 0.1, mercadores: 0.03, clero: 0.02, nobreza: 0.03 },
    sectors: { agri: 0.7, pasto: 0.2, mata: 0.1 }, grainYield: 1.95, weave: 0.1, garrison: 6500, house: 'rhovar', foreign: 'Karsk',
  },
  esteren: {
    id: 'esteren', name: 'Esteren', role: 'Florestas, madeira e caça', pop: 170000,
    center: [250, 285], settlements: ['Estervale', 'Lenhária', 'Lago Negro', 'Mosteiro de Vey'],
    shares: { camponeses: 0.86, artesaos: 0.08, mercadores: 0.02, clero: 0.03, nobreza: 0.01 },
    sectors: { agri: 0.4, mata: 0.5, pasto: 0.1 }, grainYield: 1.8, weave: 0.1, garrison: 300, house: 'esteren', foreign: 'Mordane',
  },
};

/** Estradas entre províncias (PROPOSTA geográfica): km e qualidade (1 = boa). */
export const ROADS: [ProvId, ProvId, number, number][] = [
  ['esteren', 'dornhelm', 140, 0.6],
  ['esteren', 'valtheris', 150, 0.7],
  ['esteren', 'caldris', 130, 0.6],
  ['dornhelm', 'valtheris', 135, 0.8],
  ['dornhelm', 'rhovan', 150, 0.6],
  ['rhovan', 'valtheris', 140, 0.8],
  ['rhovan', 'merovan', 150, 0.7],
  ['valtheris', 'merovan', 120, 1.0],
  ['valtheris', 'veyra', 135, 0.9],
  ['valtheris', 'caldris', 140, 0.8],
  ['caldris', 'veyra', 120, 0.7],
  ['veyra', 'merovan', 150, 0.9],
  ['veyra', 'altamar', 115, 0.8],
  ['merovan', 'altamar', 110, 1.0],
];

export const KM_PER_DAY = 38; // um mensageiro a cavalo por estradas reais (PROPOSTA)

export interface GoodData { name: string; unit: string; base: number; perishable: number }
export const GOOD_DATA: Record<GoodId, GoodData> = {
  grao: { name: 'Grão', unit: 'sacas', base: 1.0, perishable: 0.01 },
  sal: { name: 'Sal', unit: 'sacas', base: 3.0, perishable: 0 },
  la: { name: 'Lã', unit: 'fardos', base: 2.0, perishable: 0.01 },
  tecido: { name: 'Tecido', unit: 'peças', base: 5.0, perishable: 0.005 },
  ferro: { name: 'Ferro', unit: 'quintais', base: 4.0, perishable: 0 },
  madeira: { name: 'Madeira', unit: 'carradas', base: 1.5, perishable: 0.01 },
};

/** Produção mensal por pessoa de cada setor (PROPOSTA). O grão agrícola é anual e cai na colheita. */
export const SECTOR_OUTPUT: Record<Sector, Partial<Record<GoodId, number>>> = {
  agri: {},
  pesca: { grao: 0.17 },
  sal: { sal: 0.15 },
  pasto: { la: 0.06, grao: 0.05 },
  mina: { ferro: 0.06 },
  mata: { madeira: 0.15, grao: 0.03 },
};

/** Distribuição da colheita de grão pelos meses (1..12). Proposta: agosto a outubro. */
export const HARVEST_MONTHS: Record<number, number> = { 8: 0.4, 9: 0.5, 10: 0.1 };
export const GROW_MONTHS = [3, 4, 5, 6, 7];

/** Necessidade mensal por pessoa (PROPOSTA). 1 saca de grão alimenta 10 pessoas por mês. */
export const NEEDS: Record<StratumId, Record<GoodId, number>> = {
  camponeses: { grao: 0.1, sal: 0.002, la: 0, tecido: 0.002, ferro: 0, madeira: 0.012 },
  artesaos: { grao: 0.1, sal: 0.002, la: 0, tecido: 0.004, ferro: 0.003, madeira: 0.015 },
  mercadores: { grao: 0.1, sal: 0.003, la: 0, tecido: 0.02, ferro: 0.001, madeira: 0.03 },
  clero: { grao: 0.1, sal: 0.003, la: 0, tecido: 0.015, ferro: 0.0005, madeira: 0.03 },
  nobreza: { grao: 0.12, sal: 0.004, la: 0, tecido: 0.08, ferro: 0.004, madeira: 0.06 },
};
export const SOLDIER_NEEDS: Partial<Record<GoodId, number>> = { grao: 0.1, ferro: 0.006, tecido: 0.003 };

export const WAGE = 1.3; // coroas por soldado por mês
export const ADMIN_COST = 1100; // por província por mês
export const COURT_COST = 6000;
export const CROWN_LANDS = 4000;
export const TITHE = 0.05; // dízimo para o clero
export const RENT = 0.1; // renda da terra para a nobreza (produção rural)
export const WEAVE_RATE = 0.1; // peças de tecido por tecelão por mês

export const STRATUM_NAMES: Record<StratumId, string> = {
  camponeses: 'Camponeses', artesaos: 'Artesãos', mercadores: 'Mercadores', clero: 'Clero', nobreza: 'Nobreza local',
};

export interface HouseData { id: HouseId; name: string; prov: ProvId; interest: string; acceptance: number; present: boolean }
export const HOUSES: Record<HouseId, HouseData> = {
  vaelmont: { id: 'vaelmont', name: 'Casa Vaelmont', prov: 'valtheris', interest: 'Preservar influência na corte', acceptance: -10, present: true },
  avarenne: { id: 'avarenne', name: 'Casa Avarenne', prov: 'altamar', interest: 'Expandir comércio marítimo', acceptance: -5, present: true },
  deveyr: { id: 'deveyr', name: 'Casa de Veyr', prov: 'veyra', interest: 'Controlar terras e produção agrícola', acceptance: -15, present: true },
  dorn: { id: 'dorn', name: 'Casa Dorn', prov: 'dornhelm', interest: 'Monopolizar concessões minerais', acceptance: 0, present: true },
  caldran: { id: 'caldran', name: 'Casa Caldran', prov: 'caldris', interest: 'Proteger manufaturas e propriedades', acceptance: -5, present: true },
  merrow: { id: 'merrow', name: 'Casa Merrow', prov: 'merovan', interest: 'Controlar rotas, crédito e pedágios', acceptance: -10, present: true },
  rhovar: { id: 'rhovar', name: 'Casa Rhovar', prov: 'rhovan', interest: 'Ampliar autonomia militar', acceptance: -38, present: false },
  esteren: { id: 'esteren', name: 'Casa Esteren', prov: 'esteren', interest: 'Preservar domínio florestal', acceptance: 5, present: true },
};

export const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const START_YEAR = 1427;
export const START_OFFSET = 2 * 30 + 11; // 12 de Março
