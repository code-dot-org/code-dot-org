/// <reference lib="webworker" />

import {additionalPackagesFromCode} from './additionalPackagesFromCode';
import {overrides, implementOverride} from './overrides/implementOverride';

let pyodide: any;
let interruptBuffer: Int32Array | null = null;
const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

async function runPythonFile(url: URL) {
  const response = await fetch(url);
  const code = await response.text();
  await pyodide.runPythonAsync(code);
}

async function initialize() {
  console.log(
    'PyodideWorker: Starting Pyodide initialization...',
    process.env.NEXT_PUBLIC_BASE_URL,
  );
  if (process.env.NODE_ENV === 'development') {
    // Local dev server
    const {loadPyodide} = await import(
      /* webpackIgnore: true */ `/pyodide/pyodide.mjs`
    );
    pyodide = await loadPyodide();
  } else {
    // Production
    const {loadPyodide} = await import(
      /* webpackIgnore: true */ `/pyodide/pyodide.mjs`
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
      'PyodideWorker: SharedArrayBuffer is not available, interrupt functionality will be disabled',
    );
  }

  // Override stdout
  console.log('PyodideWorker: Creating override for stdout');
  pyodide.globals.set('_override_stdout', {
    write: (text: string) => {
      self.postMessage({type: 'stdout', text});
      return text.length;
    },
    flush: () => {
      /* no-op */
    },
  });

  // Override input
  console.log('PyodideWorker: Overriding input calls with async equivalent');
  runPythonFile(new URL('./async_input.py', import.meta.url));

  console.log('PyodideWorkder: Creating override for input');
  pyodide.globals.set('_override_input', (prompt?: string) => {
    return new Promise(resolve => {
      self.postMessage({
        type: 'input_request',
        message: prompt || '',
      });

      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'input_response') {
          self.removeEventListener('message', messageHandler);
          resolve(event.data.value);
        }
      };

      self.addEventListener('message', messageHandler);
    });
  });

  // Override base64 image updates
  console.log('PyodideWorker: Creating override for js functions');
  pyodide.globals.set('js', {
    imageBase64: (image_base64: string) => {
      self.postMessage({
        type: 'execute_result',
        result: {'image/png': [image_base64]},
      });
    },
  });

  console.log('PyodideWorker: Initializing Python environment');
  runPythonFile(new URL('./python_init.py', import.meta.url));
}

self.onmessage = async event => {
  if (typeof window === 'undefined') {
    return;
  }
  const {type, ...data} = event.data;

  switch (type) {
    case 'initialize':
      try {
        await initialize();
        self.postMessage({
          type: 'initialized',
          interruptBuffer: interruptBuffer ? interruptBuffer.buffer : null,
          hasInterrupt: hasSharedArrayBuffer,
        });
      } catch (error) {
        console.error('PyodideWorker: Failed to initialize Pyodide:', error);
        self.postMessage({type: 'fatal', error: String(error)});
      }
      break;
    case 'run':
      const code = data.code;
      const cellId = data.cellId;
      try {
        if (pyodide) {
          console.log('PyodideProvider: Loading packages from imports');
          const basePackages = await pyodide.loadPackagesFromImports(code);
          console.log('PyodideProvider: Loading additional packages from code');
          const additionalPackages = await pyodide.loadPackage(
            additionalPackagesFromCode(code),
          );

          console.log('PyodideProvider: Searching for overrides');
          for (const loadedPackage of [
            ...basePackages,
            ...additionalPackages,
          ]) {
            if (overrides.indexOf(loadedPackage.name) !== -1) {
              console.log(
                `PyodideProvider: Implementing override for ${loadedPackage.name}`,
              );
              await implementOverride(pyodide, loadedPackage.name);
            }
          }

          // Transform the code first
          console.log(
            `PyodideProvider: Transforming code to support async inputs`,
          );
          const transformedCode = await pyodide.runPythonAsync(
            `transform_code(${JSON.stringify(code)})`,
          );

          // Run the cell code
          console.log(`PyodideProvider: Running cell ${cellId}`);
          const result = await pyodide.runPythonAsync(`${transformedCode}`);
          console.log('PyodideProvider: Returning result');
          if (result) {
            if (typeof result == 'object') {
              // Add result representations, if they exist
              if ('_repr_svg_' in result) {
                self.postMessage({
                  type: 'execute_result',
                  result: {'image/svg+xml': result._repr_svg_()},
                });
              }
              if ('_repr_html_' in result) {
                self.postMessage({
                  type: 'execute_result',
                  result: {'text/html': result._repr_html_()},
                });
              }
              if ('_repr_png_' in result) {
                self.postMessage({
                  type: 'execute_result',
                  result: {'image/png': result._repr_png_()},
                });
              }
              // Add the default result representation
              self.postMessage({
                type: 'execute_result',
                result: {'text/plain': result.__repr__()},
              });
            } else {
              // The result is not an object. Just pass the result back as a string.
              self.postMessage({
                type: 'execute_result',
                result: {'text/plain': result.toString()},
              });
            }
          }
          self.postMessage({type: 'execute_completed'});
        }
      } catch (error) {
        console.error(error);
        self.postMessage({type: 'error', error: String(error)});
      }
      break;
  }
};
