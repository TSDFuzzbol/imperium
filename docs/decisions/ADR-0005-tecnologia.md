# ADR-0005: manter TypeScript + motor próprio + interface web

- **Estado:** PROPOSTA (aguarda o ok do Tales)
- **Data:** 27/11/2026

## Contexto e opções
Ver `docs/architecture/AVALIACAO_TECNOLOGICA.md` (seis opções comparadas: atual, atual + Preact, Godot, Unity, Rust/WebAssembly, React Native/Flutter).

## Decisão proposta
Manter TypeScript, motor próprio e interface web como PWA. Reforçar com: persistência versionada (E1), simulação em Web Worker (E2), interface em módulos (ADR-0006) e Capacitor no futuro, se houver lojas.

## Consequências
- Nenhum código que funciona é jogado fora.
- Reavaliar se um ano de jogo passar de 2 s num iPhone antigo ou o save passar de 20 MB depois da E1.
