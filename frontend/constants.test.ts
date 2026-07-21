import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, EXECUTION_SEQUENCE, PERSONAS } from './constants';
import { PhaseId } from './types';

describe('PERSONAS', () => {
  it('has a unique id for every persona', () => {
    const ids = PERSONAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every persona a non-empty name, role and description', () => {
    for (const persona of PERSONAS) {
      expect(persona.name.length).toBeGreaterThan(0);
      expect(persona.role.length).toBeGreaterThan(0);
      expect(persona.description.length).toBeGreaterThan(0);
    }
  });
});

describe('EXECUTION_SEQUENCE', () => {
  it('references only ids that exist in PERSONAS', () => {
    const personaIds = new Set<PhaseId>(PERSONAS.map((p) => p.id));
    for (const phase of EXECUTION_SEQUENCE) {
      expect(personaIds.has(phase)).toBe(true);
    }
  });

  it('contains no duplicate phases', () => {
    expect(new Set(EXECUTION_SEQUENCE).size).toBe(EXECUTION_SEQUENCE.length);
  });

  it('starts with the GraphEngine (M) then the Conductor (A)', () => {
    expect(EXECUTION_SEQUENCE[0]).toBe('M');
    expect(EXECUTION_SEQUENCE[1]).toBe('A');
  });
});

describe('DEFAULT_CONFIG', () => {
  it('enables the flagship engine features by default', () => {
    expect(DEFAULT_CONFIG.enableGraphRAG).toBe(true);
    expect(DEFAULT_CONFIG.enableGhostAgents).toBe(true);
  });

  it('defaults to a secure, vertex-ai synapse configuration', () => {
    const { synapseConfig } = DEFAULT_CONFIG;
    expect(synapseConfig.strictSecurityMode).toBe(true);
    expect(synapseConfig.llmProvider).toBe('vertex-ai');
    expect(synapseConfig.executionEnvironment).toBe('sandboxed-container');
    expect(synapseConfig.maxIterations).toBeGreaterThan(0);
    expect(synapseConfig.allowedDependencies).toContain('react');
    expect(synapseConfig.allowedDependencies.length).toBeGreaterThan(0);
  });
});
