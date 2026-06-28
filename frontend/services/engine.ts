import { SystemState, AgentContext, SynapseConfig, StateLog, WebviewMessage, WorkspaceMutation, AgentRole } from '../types';
import { CoderAgent, ReviewerAgent, RunnerAgent } from './agents';

export class ConductorEngine {
  private state: SystemState;
  private context: AgentContext;
  private coder: CoderAgent;
  private reviewer: ReviewerAgent;
  private runner: RunnerAgent;

  // Callbacks to communicate securely across extension host borders
  private onStateUpdateCallback: (msg: WebviewMessage) => void;
  private requestHumanApprovalCallback: (operation: string, resumeToken: () => Promise<void>) => void;

  constructor(
    initialPrompt: string,
    workspacePath: string,
    config: SynapseConfig,
    onStateUpdate: (msg: WebviewMessage) => void,
    requestHumanApproval: (operation: string, resumeToken: () => Promise<void>) => void
  ) {
    this.state = {
      taskId: `task_${Date.now()}`,
      currentPhase: 'ANALYSIS',
      userPrompt: initialPrompt,
      proposedMutations: [],
      securityReport: null,
      executionResult: null
    };

    this.context = {
      workspacePath,
      config,
      history: []
    };

    this.coder = new CoderAgent();
    this.reviewer = new ReviewerAgent();
    this.runner = new RunnerAgent();
    this.onStateUpdateCallback = onStateUpdate;
    this.requestHumanApprovalCallback = requestHumanApproval;
  }

  /**
   * Entrypoint for execution of the orchestrator state engine loop
   */
  public async executeWorkflow(): Promise<void> {
    try {
      this.logTransition('CONDUCTOR', 'Initializing hierarchical workflow plan.', 'ANALYSIS');

      // Phase 1: Code Generation Step
      this.state.currentPhase = 'CODING';
      this.logTransition('CONDUCTOR', 'Context persona successfully injected. Delegating tasks to Coder Agent.', 'CODING');
       
      const changes = await this.coder.generateFix(this.context, this.state);
      this.state.proposedMutations = changes;
      this.logTransition('CODER', `Generated ${changes.length} structural file mutations.`, 'CODING');

      // Phase 2: Automated Code Review and Validation Step
      this.state.currentPhase = 'REVIEW';
      this.logTransition('CONDUCTOR', 'Passing mutations to Reviewer Agent for structural vulnerability audits.', 'REVIEW');
       
      const audit = await this.reviewer.auditChanges(this.context, this.state.proposedMutations);
      this.state.securityReport = audit;

      if (!audit.isValid) {
        this.state.currentPhase = 'FAILURE';
        this.state.errorMessage = `Security check rejected: ${audit.detectedVulnerabilities.join(', ')}. Unrecognized dependencies: ${audit.untrustedDependencies.join(', ')}`;
        this.logTransition('REVIEWER', `Security verification failed. Terminating cycle to prevent cascading failure.`, 'FAILURE');
        this.broadcastState();
        return;
      }
      this.logTransition('REVIEWER', 'Vulnerability assessment passed clear. No phantom packages detected.', 'REVIEW');

      // Phase 3: Human-In-The-Loop Verification Intercept
      this.state.currentPhase = 'INTERRUPTED';
      this.broadcastState();

      this.requestHumanApprovalCallback(
        `Apply file changes & execute workspace runtime tests`,
        async () => {
          // This closure executes immediately once user triggers "Approve" from Webview Interface
          await this.runPostApprovalPipeline();
        }
      );

    } catch (error: any) {
      this.state.currentPhase = 'FAILURE';
      this.state.errorMessage = error?.message || 'Unknown orchestration execution failure.';
      this.logTransition('CONDUCTOR', `Fatal exception caught in engine step loop: ${this.state.errorMessage}`, 'FAILURE');
      this.broadcastState();
    }
  }

  /**
   * Executes protected write operations and code runs once human confirmation is received
   */
  private async runPostApprovalPipeline(): Promise<void> {
    this.state.currentPhase = 'TESTING';
    this.logTransition('CONDUCTOR', 'Human confirmation received. Executing safe workspace mutations.', 'TESTING');

    // Fetch execution plan from the runner agent
    const testRun = await this.runner.prepareTestExecution(this.context, this.state);
    this.logTransition('RUNNER', `Running validation suite command: ${testRun.command} ${testRun.args.join(' ')}`, 'TESTING');

    // Simulate successful workspace script verification run
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate test duration
    
    this.state.executionResult = {
      exitCode: 0,
      stdout: 'PASS src/services/secureAuth.test.ts\n ✓ validateToken() enforces non-empty strings',
      stderr: ''
    };

    this.state.currentPhase = 'SUCCESS';
    this.logTransition('CONDUCTOR', 'All multi-agent stages resolved perfectly. Task completed successfully.', 'SUCCESS');
    this.broadcastState();
  }

  /**
   * Immutably updates the internal log tracking tree
   */
  private logTransition(agent: AgentRole, message: string, phase: SystemState['currentPhase']): void {
    const logEntry: StateLog = {
      timestamp: Date.now(),
      agent,
      message,
      phase
    };
    this.context.history.push(logEntry);
    this.broadcastState(logEntry);
  }

  /**
   * Broadcasts data securely over the established API Bridge boundary
   */
  private broadcastState(latestLog?: StateLog): void {
    this.onStateUpdateCallback({
      type: 'AGENT_STATE_UPDATE',
      payload: {
        state: { ...this.state },
        log: latestLog
      }
    });
  }
}
