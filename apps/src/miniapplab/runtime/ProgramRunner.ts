import {askAi} from '../ai/askAi';

/** How the running program reads and writes the screen. */
export interface RuntimeHost {
  getText: (id: string) => string;
  setText: (id: string, text: string) => void;
  /** How many AI requests are in flight. */
  setPendingAiCount: (count: number) => void;
  onError: (message: string) => void;
}

type ButtonHandler = () => Promise<void>;

/** The object the generated code sees as `MiniApp`. */
interface MiniAppApi {
  onButtonPressed: (id: string, handler: ButtonHandler) => void;
  getText: (id: string) => string;
  setText: (id: string, text: string) => void;
  askAi: (prompt: unknown) => Promise<string>;
}

/**
 * Runs a generated program.  Blocks register button handlers at start; a
 * press runs its handlers, which may await AI answers.  Stopping bumps the
 * run id so late answers from an old run are dropped.
 */
export default class ProgramRunner {
  private handlers = new Map<string, ButtonHandler[]>();
  private runId = 0;
  private pendingAi = 0;

  constructor(private host: RuntimeHost) {}

  /** Throws when the code does not parse. */
  start(code: string) {
    this.stop();
    const runId = this.runId;
    const api = this.makeApi(runId);
    new Function('MiniApp', code)(api);
  }

  stop() {
    this.handlers.clear();
    this.runId++;
    this.pendingAi = 0;
    this.host.setPendingAiCount(0);
  }

  pressButton(id: string) {
    const runId = this.runId;
    (this.handlers.get(id) || []).forEach(handler => {
      handler().catch(error => {
        if (runId === this.runId) {
          this.host.onError(errorMessage(error));
        }
      });
    });
  }

  private makeApi(runId: number): MiniAppApi {
    const isCurrent = () => runId === this.runId;
    return {
      onButtonPressed: (id, handler) => {
        if (!isCurrent()) {
          return;
        }
        const list = this.handlers.get(id) || [];
        list.push(handler);
        this.handlers.set(id, list);
      },
      getText: id => this.host.getText(id),
      setText: (id, text) => {
        if (isCurrent()) {
          this.host.setText(id, String(text));
        }
      },
      // Resolves to the answer, or to a message the program can show in
      // its place; it never rejects, so the blocks inside still run.
      askAi: async prompt => {
        const promptText = String(prompt).trim();
        if (!promptText) {
          return 'Ask the AI something first.';
        }
        this.host.setPendingAiCount(++this.pendingAi);
        try {
          const answer = await askAi(promptText);
          return answer || 'The AI had nothing to say.';
        } catch (error) {
          return aiErrorText(error);
        } finally {
          if (isCurrent()) {
            this.host.setPendingAiCount(--this.pendingAi);
          }
        }
      },
    };
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function aiErrorText(error: unknown): string {
  const message = errorMessage(error);
  if (/403|401|forbidden|unauthorized|sign/i.test(message)) {
    return 'Sign in to ask the AI.';
  }
  return 'The AI could not answer right now.  ' + message;
}
