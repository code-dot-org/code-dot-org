/// <reference lib="webworker" />

/**
 * Ported from jupyter-k12 (MIT, Simon Guest). Adapted for @code-dot-org/notebook-lab.
 *
 * Pyodide Web Worker — runs Python code in a dedicated thread.
 *
 * The worker boots Pyodide on the `initialize` message, then handles `run`,
 * `reset`, and `input_response` messages.  It posts structured messages back
 * to the main thread per the worker-protocol contract.  Only one `run` is
 * active at a time; the provider must queue additional requests.
 */

import { additionalPackagesFromCode } from './additionalPackagesFromCode';
import { overrides, implementOverride } from './overrides/implementOverride';

// ---------------------------------------------------------------------------
// Worker-local state
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any;

/** Interrupt buffer view; null when SharedArrayBuffer is unavailable. */
let interruptBuffer: Int32Array | null = null;

/** True when SharedArrayBuffer (and therefore interrupt support) is available. */
const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetches a Python file relative to this worker's URL and runs it in the
 * current Pyodide namespace.
 * @param url URL of the .py file to execute
 * @returns Whatever pyodide.runPythonAsync returns (typically undefined)
 */
async function runPythonFile(url: URL): Promise<unknown> {
  const response = await fetch(url);
  const code = await response.text();
  return await pyodide.runPythonAsync(code);
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Bootstraps the Pyodide runtime:
 * 1. Loads Pyodide from the appropriate URL (dev vs. production).
 * 2. Creates the SharedArrayBuffer interrupt channel when available.
 * 3. Overrides stdout and input() with bridged JS implementations.
 * 4. Runs python_init.py to wire the bridges into builtins.
 */
async function initialize(): Promise<void> {
  console.log('PyodideWorker: Starting Pyodide initialization...');

  // @ts-ignore — import.meta.env is a Vite-injected constant
  if (import.meta.env.DEV) {
    const { loadPyodide } = await import(
      new URL(/* @vite-ignore */ '/pyodide/pyodide.mjs', import.meta.url).toString()
    );
    pyodide = await loadPyodide();
  } else {
    const { loadPyodide } = await import(
      new URL(/* @vite-ignore */ '../pyodide/pyodide.mjs', import.meta.url).toString()
    );
    pyodide = await loadPyodide();
  }

  console.log('PyodideWorker: Checking for interrupt buffer');
  if (hasSharedArrayBuffer) {
    const buffer = new SharedArrayBuffer(4);
    interruptBuffer = new Int32Array(buffer);
    pyodide.setInterruptBuffer(interruptBuffer);
    console.log('PyodideWorker: Interrupt buffer created');
  } else {
    console.warn(
      'PyodideWorker: SharedArrayBuffer unavailable — interrupt functionality disabled'
    );
  }

  // Bridge Python stdout to the main thread.
  console.log('PyodideWorker: Installing stdout override');
  pyodide.globals.set('_override_stdout', {
    write: (text: string) => {
      self.postMessage({ type: 'stdout', text });
      return text.length;
    },
    flush: () => {
      /* no-op */
    },
  });

  // Bridge input() to an async round-trip through the main thread.
  console.log('PyodideWorker: Installing async input transformer');
  await runPythonFile(new URL('./async_input.py', import.meta.url));

  console.log('PyodideWorker: Installing input() override');
  pyodide.globals.set('_override_input', (prompt?: string) => {
    return new Promise<string>(resolve => {
      self.postMessage({
        type: 'input_request',
        message: prompt ?? '',
      });

      /**
       * One-shot message handler that resolves when the main thread replies.
       * Handles null (cancelled) by injecting a KeyboardInterrupt via the
       * _pending_interrupt sentinel checked by the async input machinery.
       */
      const handleInputResponse = (event: MessageEvent) => {
        if (event.data.type !== 'input_response') return;
        self.removeEventListener('message', handleInputResponse);

        const value: string | null = event.data.value;
        if (value === null) {
          // Cancelled — raise KeyboardInterrupt in the running Python frame.
          pyodide.globals.set('_pending_interrupt', true);
          // Resolve with empty string; the interrupt flag causes Python to raise.
          resolve('');
        } else {
          resolve(value);
        }
      };

      self.addEventListener('message', handleInputResponse);
    });
  });

  // Provide a js.imageBase64 bridge for matplotlib/pygame overrides.
  console.log('PyodideWorker: Installing js.imageBase64 bridge');
  pyodide.globals.set('js', {
    imageBase64: (imageBase64: string) => {
      self.postMessage({ type: 'execute_result', result: { 'image/png': [imageBase64] } });
    },
  });

  console.log('PyodideWorker: Running python_init.py');
  await runPythonFile(new URL('./python_init.py', import.meta.url));
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

self.onmessage = async (event: MessageEvent): Promise<void> => {
  const { type, ...data } = event.data as { type: string; [k: string]: unknown };

  switch (type) {
    case 'initialize': {
      try {
        await initialize();
        self.postMessage({
          type: 'initialized',
          interruptBuffer: interruptBuffer ? interruptBuffer.buffer : null,
          hasInterrupt: hasSharedArrayBuffer,
          pyodideVersion: pyodide.version,
        });
      } catch (error) {
        console.error('PyodideWorker: Fatal initialization error:', error);
        self.postMessage({ type: 'fatal', error: String(error) });
      }
      break;
    }

    case 'reset': {
      console.log('PyodideWorker: Resetting globals');
      await runPythonFile(new URL('./python_reset_globals.py', import.meta.url));
      self.postMessage({ type: 'reset_completed' });
      break;
    }

    case 'run': {
      const code = data.code as string;
      const cellId = data.cellId as string;

      // Clear any stale interrupt signal before each run.
      if (interruptBuffer !== null) {
        Atomics.store(interruptBuffer, 0, 0);
      }

      try {
        if (!pyodide) break;

        console.log(`PyodideWorker: Loading packages from imports for cell ${cellId}`);
        const basePackages = await pyodide.loadPackagesFromImports(code);

        console.log(`PyodideWorker: Loading additional packages for cell ${cellId}`);
        const additionalPackages = await pyodide.loadPackage(
          additionalPackagesFromCode(code)
        );

        // Apply post-load overrides for any newly loaded packages.
        console.log(`PyodideWorker: Applying overrides for cell ${cellId}`);
        for (const loadedPackage of [...basePackages, ...additionalPackages]) {
          const override = overrides.find(
            config => config.module === (loadedPackage as { name: string }).name
          );
          if (override) {
            console.log(
              `PyodideWorker: Applying override for ${(loadedPackage as { name: string }).name}`
            );
            await implementOverride(
              pyodide,
              (loadedPackage as { name: string }).name
            );
          }
        }

        // Rewrite synchronous input() calls to awaited form.
        console.log(`PyodideWorker: Transforming code for async input`);
        const transformedCode = await pyodide.runPythonAsync(
          `_transform_code(${JSON.stringify(code)})`
        );

        console.log(`PyodideWorker: Executing cell ${cellId}`);
        const result: unknown = await pyodide.runPythonAsync(transformedCode as string);

        if (result !== null && result !== undefined) {
          if (typeof result === 'object') {
            if ('_repr_svg_' in result) {
              self.postMessage({
                type: 'execute_result',
                cellId,
                result: { 'image/svg+xml': (result as { _repr_svg_: () => string })._repr_svg_() },
              });
            }
            if ('_repr_html_' in result) {
              self.postMessage({
                type: 'execute_result',
                cellId,
                result: { 'text/html': (result as { _repr_html_: () => string })._repr_html_() },
              });
            }
            if ('_repr_png_' in result) {
              self.postMessage({
                type: 'execute_result',
                cellId,
                result: { 'image/png': (result as { _repr_png_: () => string })._repr_png_() },
              });
            }
            self.postMessage({
              type: 'execute_result',
              cellId,
              result: {
                'text/plain': (result as { __repr__: () => string }).__repr__(),
              },
            });
          } else {
            self.postMessage({
              type: 'execute_result',
              cellId,
              result: { 'text/plain': String(result) },
            });
          }
        }

        self.postMessage({ type: 'execute_completed', cellId });
      } catch (error) {
        console.error('PyodideWorker: Execution error:', error);
        self.postMessage({ type: 'error', cellId, error: String(error) });
      }
      break;
    }

    default:
      console.warn(`PyodideWorker: Unrecognised message type: ${type}`);
      break;
  }
};
