import { AgentContext, SystemState, WorkspaceMutation, SecurityReport } from '../types';
import { SynapseAI, extractJsonArray } from './synapse';

const CODER_SYSTEM_PROMPT = `You are a Coder Agent inside the SynapseAI multi-agent system.
Your role is to generate precise, secure file mutations for the requested task.

Return a JSON array of WorkspaceMutation objects – nothing else.
Each object must have exactly these fields:
  "type"     : "CREATE_FILE" | "UPDATE_FILE" | "DELETE_FILE"
  "filePath" : relative path (e.g. "src/services/auth.ts")
  "content"  : complete file content as a single string

Rules:
- No markdown fences, no prose, no extra keys.
- Avoid eval(), exec(), and dynamic require().
- Only use dependencies that are part of the project.
- Example output: [{"type":"CREATE_FILE","filePath":"src/utils/validate.ts","content":"export const validate = (v: string) => Boolean(v);"}]`;

/**
 * The Coder Agent builds type-safe file mutations.
 * When llmProvider is 'vertex-ai', it calls SynapseAI for real code generation.
 * Falls back to a safe simulation on any error or when provider is 'custom'.
 */
export class CoderAgent {
  public async generateFix(context: AgentContext, state: SystemState): Promise<WorkspaceMutation[]> {
    if (context.config.llmProvider === 'vertex-ai') {
      try {
        const ai = new SynapseAI(context.config);
        const userPrompt =
          `Task: ${state.userPrompt}\n` +
          `Workspace root: ${context.workspacePath}\n` +
          `Allowed dependencies: ${context.config.allowedDependencies.join(', ')}\n` +
          `Generate the necessary file mutations.`;

        const raw = await ai.generate(CODER_SYSTEM_PROMPT, userPrompt);
        const mutations = extractJsonArray<WorkspaceMutation>(raw);
        if (mutations && mutations.length > 0) return mutations;
      } catch {
        // Fall through to simulation
      }
    }

    // Simulation fallback
    return [
      {
        type: 'CREATE_FILE',
        filePath: 'src/services/secureAuth.ts',
        content: `// Context-Aware Persona injected code\nexport const validateToken = (token: string): boolean => {\n  if (!token) return false;\n  // Avoid insecure defaults\n  return token.startsWith("secure_hdr_");\n};`
      }
    ];
  }
}

/**
 * The Reviewer Agent operates as an automated AppSec gate.
 * Validates dependencies and structural integrity to minimize trust deficits.
 */
export class ReviewerAgent {
  public async auditChanges(context: AgentContext, mutations: WorkspaceMutation[]): Promise<SecurityReport> {
    const detectedVulnerabilities: string[] = [];
    const untrustedDependencies: string[] = [];

    for (const mutation of mutations) {
      // Guardrail 1: Mitigation against Phantom/Hallucinated Open-Source Packages
      const importMatches = mutation.content.match(/from\s+['"]([^'"]+)['"]/g) || [];
      for (const match of importMatches) {
        const dep = match.replace(/from\s+['"]|['"]/g, '');
        if (dep.startsWith('.') || dep.startsWith('src/')) continue;
         
        if (!context.config.allowedDependencies.includes(dep)) {
          untrustedDependencies.push(dep);
        }
      }

      // Guardrail 2: Scan for unsafe raw evaluations or execution models
      if (mutation.content.includes('eval(') || mutation.content.includes('exec(')) {
        detectedVulnerabilities.push(`Critical security flaw: execution construct found in ${mutation.filePath}`);
      }
    }

    return {
      isValid: detectedVulnerabilities.length === 0 && untrustedDependencies.length === 0,
      detectedVulnerabilities,
      untrustedDependencies
    };
  }
}

/**
 * The Runner Agent constructs tasks meant to be executed inside sandboxed environments.
 */
export class RunnerAgent {
  public async prepareTestExecution(context: AgentContext, state: SystemState): Promise<{ command: string; args: string[] }> {
    // Enforces predictable testing pathways preventing arbitrary command injection.
    return {
      command: 'npm',
      args: ['run', 'test', '--', '--runTestsByPath', 'src/services/secureAuth.ts']
    };
  }
}
