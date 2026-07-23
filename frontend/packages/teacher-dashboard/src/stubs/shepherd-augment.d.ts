// Type augmentation for shepherd.js.
// The moved files use `import {Tour, Step} from 'shepherd.js'` (named exports),
// but the installed version only exports a default namespace. This augmentation
// bridges the difference so typecheck passes without modifying the moved files.
//
// STUB — do not add business logic here.

declare module 'shepherd.js' {
  export class Tour {
    constructor(options?: any);
    addStep(options: any): any;
    addSteps(steps: any[]): any;
    back(): void;
    cancel(): void;
    complete(): void;
    getCurrentStep(): any;
    hide(): void;
    isActive(): boolean;
    next(): void;
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    removeStep(name: string): void;
    show(key?: string | number, forward?: boolean): void;
    start(): void;
    steps: any[];
    options: any;
  }

  export namespace Step {
    interface StepOptions {
      [key: string]: any;
    }
    interface StepOptionsButton {
      [key: string]: any;
    }
  }

  export class Step {
    constructor(tour: Tour, options?: Step.StepOptions);
    cancel(): void;
    complete(): void;
    destroy(): void;
    getTour(): Tour;
    hide(): void;
    isOpen(): boolean;
    show(): void;
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    options: Step.StepOptions;
  }
}
