export interface MiniAppSignal {
  value: string;
  // The detail shape varies per mini-app, so it stays untyped here; subclasses narrow it.
  detail?: unknown;
}

export default abstract class MiniApp {
  abstract handleSignal(signal: MiniAppSignal | null): void;

  // By default mini apps do not track a run state.
  isRunning(): boolean {
    return false;
  }

  onCompile(): void {}

  onClose(): void {}
}
