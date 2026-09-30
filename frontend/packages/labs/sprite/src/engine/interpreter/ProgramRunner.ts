// The part of apps' JSInterpreter that Sprite Lab runs on: a program over
// JS-Interpreter, stepped in budgets, whose functions native code can call.
// The debugger, breakpoints and code highlighting are not carried.
import {
  CustomMarshaler,
  CustomMarshalingInterpreter,
  type MarshalObject,
} from '@code-dot-org/lab/interpreter';

import type {WatchInterpreter} from '../runtime/types';

const MAX_CALL_STACK_SIZE = 10000;

// Runs after the program and hands queued callbacks to the interpreter.
const EVENT_LOOP =
  '\n;while(true){var __jsCB=getCallback();' +
  'if(__jsCB){setCallbackRetVal(__jsCB.fn.apply(null,__jsCB.arguments || null));}}';

/** An interpreted function as native code calls it. */
export type NativeCallback = ((...args: unknown[]) => unknown) & {
  funcName?: string;
};

/** A value inside the interpreter. */
interface InterpreterObject {
  type?: string;
  isPrimitive?: boolean;
  isCustomMarshal?: boolean;
  node?: {id?: {name: string}};
}

interface QueuedCallback {
  fn: InterpreterObject;
  arguments: unknown[];
}

interface StackFrame {
  node: {type: string; start?: number; id?: {name: string}};
}

/** The interpreter members this file uses that the lab package leaves untyped. */
interface InterpreterInternals {
  paused_: boolean;
  getScope(): object;
  getStackDepth(): number;
  peekStackFrame(): StackFrame | undefined;
  step(): boolean;
  appendCode(code: string): void;
  getProperty(obj: unknown, name: string): InterpreterObject;
  hasProperty(obj: unknown, name: string): boolean;
  getValue(ref: unknown[]): InterpreterObject;
  createPrimitive(value: unknown): InterpreterObject;
  createNativeFunction(wrapper: object): InterpreterObject;
  makeNativeMemberFunction(opts: object): object;
  setPropertyWithoutCustomMarshaling(
    obj: object,
    name: string,
    value: unknown,
  ): void;
  marshalNativeToInterpreter(
    value: unknown,
    parent: unknown,
    maxDepth?: number,
  ): InterpreterObject;
  marshalInterpreterToNative(value: unknown): unknown;
  isa(value: unknown, type: unknown): boolean;
  FUNCTION: unknown;
}

/**
 * Hands every interpreted function that reaches native code to the runner,
 * which makes it callable. Apps did this through a static hook on the class.
 */
class BridgedInterpreter extends CustomMarshalingInterpreter {
  // Set during construction, so it must not be a class field.
  declare bridge?: (fn: InterpreterObject) => NativeCallback;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  marshalInterpreterToNative(interpreterVar: any): any {
    const self = this as unknown as InterpreterInternals;
    if (
      this.bridge &&
      !interpreterVar.isPrimitive &&
      !interpreterVar.isCustomMarshal &&
      self.isa(interpreterVar, self.FUNCTION)
    ) {
      return this.bridge(interpreterVar);
    }
    return super.marshalInterpreterToNative(interpreterVar);
  }
}

export interface ProgramError {
  error: Error;
  /** 1-based line in the user's code, when the error is in it. */
  line: number | undefined;
  /** What the student is shown. */
  message: string;
}

export interface ParseOptions {
  /** Helper code followed by the user's code. */
  code: string;
  /** Where the user's code begins in `code`. */
  userCodeStartOffset?: number;
  /** Called while the interpreter is built, to add globals. */
  initGlobals?: (runner: ProgramRunner) => void;
}

export interface ProgramRunnerOptions {
  maxStepsPerTick?: number;
  /** Native classes whose instances the program uses in place. */
  customMarshalObjects?: MarshalObject[];
  onExecutionError?: (error: ProgramError) => void;
}

export class ProgramRunner implements WatchInterpreter {
  interpreter: CustomMarshalingInterpreter | null = null;
  /** Set once the program's own code has run and the event loop has begun. */
  startedHandlingEvents = false;
  /** Set when a callback returned with nothing left queued behind it. */
  seenReturnFromCallbackDuringExecution = false;
  executionError: Error | null = null;
  isExecuting = false;

  readonly #maxStepsPerTick: number;
  readonly #marshaler: CustomMarshaler;
  readonly #onExecutionError?: (error: ProgramError) => void;
  #globalScope: object | null = null;
  #eventQueue: QueuedCallback[] = [];
  #yieldExecution = false;
  #lastCallbackRetVal: unknown = undefined;
  #code = '';
  #userCodeStartOffset = 0;
  #lastNodeStart: number | undefined = undefined;
  /** Set once an error is reported; the program runs no further. */
  #halted = false;

  constructor({
    maxStepsPerTick = 10000,
    customMarshalObjects = [],
    onExecutionError,
  }: ProgramRunnerOptions = {}) {
    this.#maxStepsPerTick = maxStepsPerTick;
    this.#marshaler = new CustomMarshaler({objectList: customMarshalObjects});
    this.#onExecutionError = onExecutionError;
  }

  /** Builds the interpreter over `code`. A syntax error is reported, not thrown. */
  parse({code, userCodeStartOffset = 0, initGlobals}: ParseOptions): void {
    this.#code = code;
    this.#userCodeStartOffset = userCodeStartOffset;
    this.#lastNodeStart = undefined;
    this.#halted = false;
    this.#eventQueue = [];
    try {
      const interpreter = new BridgedInterpreter(
        '',
        this.#marshaler,
        (created, scope) => {
          this.interpreter = created;
          this.#globalScope = scope;
          (created as BridgedInterpreter).bridge = fn =>
            this.nativeFunction(fn);
          initGlobals?.(this);
          this.#defineNative('getCallback', this.#getCallback, 5);
          this.#defineNative('setCallbackRetVal', this.#setCallbackRetVal);
        },
      );
      // Globals first, so the program can redefine them.
      this.#internals(interpreter).appendCode(code + EVENT_LOOP);
    } catch (error) {
      this.executionError = error as Error;
      this.#handleError();
    }
  }

  initialized(): boolean {
    return !!this.interpreter;
  }

  /** Whether an error has stopped the program for good. */
  get halted(): boolean {
    return this.#halted;
  }

  /** Detaches the interpreter, so late callbacks do nothing. */
  deinitialize(): void {
    this.interpreter = null;
  }

  isProgramDone(): boolean {
    if (!this.interpreter) {
      return true;
    }
    const frame = this.#internals().peekStackFrame() as
      | (StackFrame & {done?: boolean})
      | undefined;
    return (
      !!this.executionError ||
      !frame ||
      (frame.node.type === 'Program' && !!frame.done)
    );
  }

  /**
   * Steps the program up to the per-tick budget. It stops early when the
   * event loop finds nothing queued, when a native async function blocks,
   * or, with `runUntilCallbackReturn`, when a queued callback returns.
   */
  executeInterpreter(runUntilCallbackReturn = false): void {
    if (this.isExecuting) {
      console.error(
        'Attempt to call executeInterpreter while already executing ignored',
      );
      return;
    }
    if (!this.interpreter || this.#halted) {
      return;
    }
    this.isExecuting = true;
    if (runUntilCallbackReturn) {
      this.#lastCallbackRetVal = undefined;
    }
    this.#yieldExecution = false;
    this.seenReturnFromCallbackDuringExecution = false;

    for (let steps = 0; steps < this.#maxStepsPerTick; steps++) {
      const interpreter = this.interpreter
        ? this.#internals(this.interpreter)
        : null;
      if (
        !interpreter ||
        this.#yieldExecution ||
        interpreter.paused_ ||
        (runUntilCallbackReturn && this.seenReturnFromCallbackDuringExecution)
      ) {
        break;
      }
      // As in apps, each step's outcome replaces the last, a parse error's too.
      this.executionError = null;
      // The stack unwinds when a step throws, so note where it was first.
      this.#lastNodeStart = interpreter.peekStackFrame()?.node.start;
      try {
        interpreter.step();
      } catch (error) {
        this.executionError = error as Error;
      }
      if (interpreter.getStackDepth() > MAX_CALL_STACK_SIZE) {
        this.executionError = new Error('Maximum call stack size exceeded.');
      }
      if (this.executionError || !interpreter.getStackDepth()) {
        if (this.executionError) {
          this.#handleError();
        }
        break;
      }
    }
    this.isExecuting = false;
  }

  /**
   * An interpreted function as a native one. A call queues it; when the
   * program is not already running, the call runs it at once and returns its
   * value, unless it outruns one tick's budget, when it finishes on a later
   * tick and the call returns undefined.
   */
  nativeFunction(fn: InterpreterObject): NativeCallback {
    const callback: NativeCallback = (...args: unknown[]) => {
      if (!this.initialized()) {
        return undefined;
      }
      this.#eventQueue.push({fn, arguments: args});
      if (!this.isExecuting) {
        this.executeInterpreter(true);
        return this.#lastCallbackRetVal;
      }
      return undefined;
    };
    if (fn.node?.id) {
      callback.funcName = fn.node.id.name;
    }
    return callback;
  }

  /** The global function `name` as a native one, if the program defines it. */
  findGlobalFunction(name: string): NativeCallback | undefined {
    if (!this.interpreter || !this.#globalScope) {
      return undefined;
    }
    const fn = this.#internals().getProperty(this.#globalScope, name);
    return fn?.type === 'function' ? this.nativeFunction(fn) : undefined;
  }

  /**
   * Defines a global. A function is called with `parent` as `this`; any
   * other value is copied into the interpreter.
   */
  createGlobalProperty(name: string, value: unknown, parent?: unknown): void {
    const interpreter = this.#internals();
    const interpreterValue =
      typeof value === 'function'
        ? interpreter.createNativeFunction(
            interpreter.makeNativeMemberFunction({
              nativeFunc: value,
              nativeParentObj: parent,
            }),
          )
        : interpreter.marshalNativeToInterpreter(value, parent ?? window);
    interpreter.setPropertyWithoutCustomMarshaling(
      this.#globalScope as object,
      name,
      interpreterValue,
    );
  }

  /**
   * The value of a variable or a dotted path from one, as the program sees
   * it now. Returns an Error it cannot evaluate, as apps did.
   */
  evaluateWatchExpression(expression: string): unknown {
    if (!this.interpreter) {
      return new Error('Not running');
    }
    const interpreter = this.#internals();
    const path = expression.trim().split('.');
    if (!path.every(part => /^[A-Za-z_$][\w$]*$/.test(part))) {
      return new Error('Invalid');
    }
    try {
      let value = this.#valueFromScope(path[0]);
      for (const part of path.slice(1)) {
        value = interpreter.getValue([value, part]);
      }
      return interpreter.marshalInterpreterToNative(value);
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  #valueFromScope(name: string): InterpreterObject {
    const interpreter = this.#internals();
    let scope = interpreter.getScope() as {parentScope?: object} | undefined;
    while (scope) {
      if (interpreter.hasProperty(scope, name)) {
        return interpreter.getProperty(scope, name);
      }
      scope = scope.parentScope;
    }
    throw new ReferenceError('Unknown identifier: ' + name);
  }

  #defineNative(
    name: string,
    nativeFunc: (...args: never[]) => unknown,
    maxDepth?: number,
  ): void {
    const interpreter = this.#internals();
    interpreter.setPropertyWithoutCustomMarshaling(
      this.#globalScope as object,
      name,
      interpreter.createNativeFunction(
        interpreter.makeNativeMemberFunction({nativeFunc, maxDepth}),
      ),
    );
  }

  #getCallback = (): QueuedCallback | undefined => {
    this.startedHandlingEvents = true;
    const next = this.#eventQueue.shift();
    if (next === undefined) {
      this.#yieldExecution = true;
    }
    return next;
  };

  #setCallbackRetVal = (value: unknown): void => {
    if (this.#eventQueue.length === 0) {
      this.seenReturnFromCallbackDuringExecution = true;
      this.#lastCallbackRetVal = value;
    }
  };

  #handleError(): void {
    this.#halted = true;
    const error = this.executionError as Error & {loc?: {line: number}};
    const line = error.loc ? error.loc.line : this.#userCodeLine();
    this.#onExecutionError?.({error, line, message: friendlyMessage(error)});
  }

  /** The 1-based line of user code the interpreter is at, if any. */
  #userCodeLine(): number | undefined {
    const start = this.#lastNodeStart;
    if (start === undefined || start < this.#userCodeStartOffset) {
      return undefined;
    }
    const before = this.#code.slice(this.#userCodeStartOffset, start);
    return before.split('\n').length;
  }

  #internals(interpreter = this.interpreter): InterpreterInternals {
    return interpreter as unknown as InterpreterInternals;
  }
}

/** Apps' wording for the reference errors students hit most. */
function friendlyMessage(error: Error): string {
  const message = String(error);
  const name = /(.*) is not defined/.exec(
    error instanceof ReferenceError ? error.message : '',
  )?.[1];
  if (!name) {
    return message;
  }
  if (name === '__') {
    return 'It looks like you left one of the parameters empty.';
  }
  return (
    `Oops, we can’t figure out what ${name} is - perhaps you ` +
    `meant the string “${name}” with quotes? If this is meant to be a ` +
    `variable, make sure you declared a variable: var ${name}`
  );
}
