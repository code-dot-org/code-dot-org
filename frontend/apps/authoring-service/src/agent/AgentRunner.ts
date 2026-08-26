import type {AuthoringState} from '../state/AuthoringState.js';
import type {ChatScope} from '../store/SessionStore.js';

export interface AgentTurnInput {
  turnId: string;
  sessionId: string;
  scope: ChatScope;
  message: string;
  state: AuthoringState;
}

/**
 * The seam the embedded `@anthropic-ai/claude-agent-sdk` authoring agent
 * implements. A turn owns its own progress reporting: it emits `agent-status`
 * events and appends chat messages through `input.state`, and resolves when the
 * turn is over. Rejecting is allowed; the caller reports the failure.
 */
export interface AgentRunner {
  runTurn(input: AgentTurnInput): Promise<void>;
}

const NOT_WIRED =
  'The authoring agent is not wired up yet. This service records your message ' +
  'and the change log, and serves curriculum state over /api — the ' +
  'claude-agent-sdk runner replaces EchoAgentRunner at the construction point ' +
  'in src/server.ts.';

/** Placeholder runner: proves the streaming path end to end, changes nothing. */
export class EchoAgentRunner implements AgentRunner {
  async runTurn(input: AgentTurnInput): Promise<void> {
    const {state, turnId, scope} = input;
    state.emit({type: 'agent-status', turnId, status: 'started'});
    state.appendChatMessage('agent', NOT_WIRED, scope);
    state.emit({type: 'agent-status', turnId, status: 'done'});
  }
}
