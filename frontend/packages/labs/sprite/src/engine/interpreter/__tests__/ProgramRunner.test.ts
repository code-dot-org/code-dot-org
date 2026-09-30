import {describe, expect, it, vi} from 'vitest';

import {type ProgramError, ProgramRunner} from '../ProgramRunner';

function run(
  code: string,
  globals: Record<string, unknown> = {},
  options: ConstructorParameters<typeof ProgramRunner>[0] = {},
) {
  const runner = new ProgramRunner(options);
  runner.parse({
    code,
    initGlobals: r => {
      for (const [name, value] of Object.entries(globals)) {
        r.createGlobalProperty(name, value);
      }
    },
  });
  runner.executeInterpreter();
  return runner;
}

describe('ProgramRunner', () => {
  it('runs the program, then waits in its event loop', () => {
    const log = vi.fn();
    const runner = run('log(1 + 2);', {log});
    expect(log).toHaveBeenCalledWith(3);
    expect(runner.startedHandlingEvents).toBe(true);
    expect(runner.isProgramDone()).toBe(false);
  });

  it('calls a program function from native code and returns its value', () => {
    const runner = run('function double(n) { return n * 2; }');
    expect(runner.findGlobalFunction('double')?.(21)).toBe(42);
    expect(runner.seenReturnFromCallbackDuringExecution).toBe(true);
  });

  it('hands a callback to a native command as a callable function', () => {
    let stored: ((n: number) => unknown) | undefined;
    const runner = run('keep(function tripled(n) { return n * 3; });', {
      keep: (fn: (n: number) => unknown) => (stored = fn),
    });
    expect(runner.initialized()).toBe(true);
    expect(stored?.(5)).toBe(15);
    expect((stored as {funcName?: string}).funcName).toBe('tripled');
  });

  it('runs callbacks queued during a call before that call completes', () => {
    const order: string[] = [];
    const callbacks: (() => void)[] = [];
    const runner = run(
      [
        'on(function a() { note("a"); });',
        'on(function b() { note("b"); });',
        'function draw() { fire(); note("draw"); }',
      ].join('\n'),
      {
        on: (fn: () => void) => callbacks.push(fn),
        fire: () => callbacks.forEach(fn => fn()),
        note: (s: string) => order.push(s),
      },
    );
    runner.findGlobalFunction('draw')?.();
    expect(order).toEqual(['draw', 'a', 'b']);
    expect(runner.seenReturnFromCallbackDuringExecution).toBe(true);
  });

  it('finishes a long call on later ticks', () => {
    const runner = run(
      'var done = false; function slow() { for (var i = 0; i < 500; i++) {} done = true; }',
      {},
      {maxStepsPerTick: 200},
    );
    for (let i = 0; i < 20 && !runner.startedHandlingEvents; i++) {
      runner.executeInterpreter();
    }
    expect(runner.findGlobalFunction('slow')?.()).toBeUndefined();
    expect(runner.evaluateWatchExpression('done')).toBe(false);
    for (
      let i = 0;
      i < 100 && !runner.seenReturnFromCallbackDuringExecution;
      i++
    ) {
      runner.executeInterpreter();
    }
    expect(runner.evaluateWatchExpression('done')).toBe(true);
  });

  it('reads variables and their properties', () => {
    const runner = run('var score = 3; var o = {a: {b: "x"}};');
    expect(runner.evaluateWatchExpression('score')).toBe(3);
    expect(runner.evaluateWatchExpression('o.a.b')).toBe('x');
    expect(runner.evaluateWatchExpression('missing')).toBeInstanceOf(
      ReferenceError,
    );
    expect(runner.evaluateWatchExpression('1 + 1')).toBeInstanceOf(Error);
  });

  it('lets the program redefine a global', () => {
    const runner = run('function greet() { return "mine"; }', {
      greet: () => 'native',
    });
    expect(runner.findGlobalFunction('greet')?.()).toBe('mine');
  });

  it('reports a syntax error with its line', () => {
    const errors: ProgramError[] = [];
    const runner = run(
      'var a = 1;\nvar = ;',
      {},
      {onExecutionError: e => errors.push(e)},
    );
    expect(runner.initialized()).toBe(true);
    expect(errors).toHaveLength(1);
    expect(errors[0].error).toBeInstanceOf(SyntaxError);
    expect(errors[0].line).toBe(2);
  });

  it('reports a runtime error in user code, with apps wording', () => {
    const errors: ProgramError[] = [];
    const runner = new ProgramRunner({onExecutionError: e => errors.push(e)});
    const helper = 'function help() {}\n';
    runner.parse({
      code: helper + 'help();\nnope();',
      userCodeStartOffset: helper.length,
    });
    runner.executeInterpreter();
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(2);
    expect(errors[0].message).toContain('we can’t figure out what nope is');
    expect(runner.isProgramDone()).toBe(true);
  });

  it('ignores calls after deinitialize', () => {
    const runner = run('function f() { return 1; }');
    const f = runner.findGlobalFunction('f');
    runner.deinitialize();
    expect(f?.()).toBeUndefined();
    expect(runner.isProgramDone()).toBe(true);
  });
});
