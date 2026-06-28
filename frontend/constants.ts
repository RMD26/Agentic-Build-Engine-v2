import { Persona, PhaseId, ProjectConfig } from './types';

export const PERSONAS: Persona[] = [
  { id: 'M', name: 'GraphEngine', role: 'Semantic Memory', description: 'Maps workspace to vector DB for project-wide context.' },
  { id: 'A', name: 'Conductor', role: 'Orchestrator', description: 'Plans and delegates tasks to specialist agents.' },
  { id: 'B', name: 'Designer', role: 'Visual Designer', description: 'Defines visual identity and theme.' },
  { id: 'C', name: 'DB Architect', role: 'Database Architect', description: 'Designs the data model and schema.' },
  { id: 'D', name: 'API Engineer', role: 'API Engineer', description: 'Designs data transport layers.' },
  { id: 'F', name: 'Coder', role: 'Senior Full-Stack', description: 'Implements application code.' },
  { id: 'E', name: 'Runner', role: 'Isolated Execution', description: 'Executes code/tests in a secure sandbox.' },
  { id: 'G', name: 'Auth Engineer', role: 'Security', description: 'Implements authentication & security.' },
  { id: 'H', name: 'Agent Builder', role: 'AI Architect', description: 'Designs AI agent systems.' },
  { id: 'I', name: 'Test Engineer', role: 'QA', description: 'Writes test suites.' },
  { id: 'J', name: 'DevOps', role: 'Deployment', description: 'Makes the app deployable.' },
  { id: 'K', name: 'Docs Writer', role: 'Technical Writer', description: 'Documents the project.' },
  { id: 'L', name: 'Reviewer', role: 'Strict Auditor', description: 'Critiques code against strict security/perf rules.' },
  { id: 'N', name: 'GhostAgent', role: 'Proactive Scanner', description: 'Asynchronously monitors files for vulnerabilities.' },
];

export const EXECUTION_SEQUENCE: PhaseId[] = ['M', 'A', 'B', 'C', 'D', 'F', 'L', 'E', 'G', 'H', 'I', 'J', 'K'];

export const DEFAULT_CONFIG: ProjectConfig = {
  name: 'nexus-core-app',
  framework: 'Next.js 14+ (App Router)',
  ui: 'Tailwind CSS + shadcn/ui',
  database: 'Prisma + PostgreSQL',
  auth: 'NextAuth v5',
  enableGraphRAG: true,
  enableGhostAgents: true,
  synapseConfig: {
    maxIterations: 5,
    strictSecurityMode: true,
    autoFixEnabled: false,
    executionEnvironment: 'sandboxed-container',
    llmProvider: 'vertex-ai',
    allowedDependencies: ['react', 'next-auth', 'zod', 'zustand', 'lodash', 'axios']
  }
};
