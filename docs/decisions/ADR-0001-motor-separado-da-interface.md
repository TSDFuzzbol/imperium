# ADR-0001: motor de simulação separado da interface

- **Estado:** CONFIRMADO (Memória Mestra v1.5 §13.1; ESPEC_FUNDACAO §1)
- **Data:** 26/11/2026 (registrado em 27/11/2026)

## Contexto
A simulação precisa ser testada sem tela, reproduzida por semente e, no futuro, rodar fora da thread da interface.

## Decisão
Todo o jogo vive em `src/engine/` como funções puras sobre um objeto `World`. A interface (`src/ui/`) só lê o `World` e manda comandos (`issue`, `runCheck`, `stepDay`).

## Consequências
- Os testes rodam no Node em menos de 2 segundos.
- Proibido no motor: DOM, `window`, armazenamento, relógio real, `Math.random`.
- Textos para o jogador ainda são montados no motor (Crônica, despachos). Aceitável por enquanto (jogo só em português), mas a formatação de números deve sair de funções próprias, não de `toLocaleString`, para não depender do ambiente.
