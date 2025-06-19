import React, {useEffect, useRef} from 'react';

import {usePyodideStore} from '@/components/renderer/store/pyodideStore';
import {notebookStore} from '@/components/renderer/store/notebookStore';
// Assume notebookStore and other imports exist

export default function PyodideProvider({
  notebookId,
  locale,
  children,
}: {
  notebookId: string;
  locale: string;
  children: React.ReactNode;
}) {
  const pyodideStore = usePyodideStore();
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Start new worker
    console.log('PyodideProvider: Starting new worker for ' + notebookId);
    pyodideStore.setWorkerStatus('initializing');
    const worker = new Worker(
      new URL(
        '@/components/renderer/pyodide/PyodideWorker.ts',
        import.meta.url,
      ),
      {type: 'module'},
    );
    workerRef.current = worker;
    worker.postMessage({type: 'initialize'});

    worker.onmessage = (event: MessageEvent<any>) => {
      const {type, text, result, message, error, interruptBuffer} = event.data;
      switch (type) {
        case 'initialized':
          console.log('PyodideProvider: Pyodide is initialized');
          pyodideStore.setWorkerStatus('ready');
          if (interruptBuffer) {
            pyodideStore.setInterruptBuffer(new Int32Array(interruptBuffer));
            console.log('PyodideProvider: Set Interrupt Buffer');
          }
          break;
        case 'stdout':
          if (pyodideStore.runningCellId) {
            notebookStore.addStdout(pyodideStore.runningCellId, text);
          }
          break;
        case 'input_request':
          pyodideStore.requestUserInput(message);
          break;
        case 'execute_result':
          if (pyodideStore.runningCellId) {
            if (result) {
              notebookStore.setResult(pyodideStore.runningCellId, result);
            }
          }
          break;
        case 'execute_completed':
          pyodideStore.executionCompleted();
          break;
        case 'error':
          if (pyodideStore.runningCellId) {
            notebookStore.setError(pyodideStore.runningCellId, error);
          }
          pyodideStore.executionCompleted();
          break;
        case 'fatal':
          pyodideStore.setFatalError(error);
          break;
      }
    };

    return () => {
      // Cleanup worker
      console.log('PyodideProvider: Terminating worker.');
      pyodideStore.setWorkerStatus('terminating');
      worker.terminate();
      workerRef.current = null;
    };
  }, [notebookId]);

  // Watch executionStatus
  useEffect(() => {
    if (
      pyodideStore.executionStatus === 'queued' &&
      pyodideStore.runningCellId != null
    ) {
      const code = notebookStore.getLocalizedSource(
        pyodideStore.runningCellId,
        locale,
      );
      workerRef.current?.postMessage({
        type: 'run',
        cellId: pyodideStore.runningCellId,
        code: code?.join(''),
      });
    }
  }, [pyodideStore.executionStatus, pyodideStore.runningCellId, locale]);

  // Watch inputStatus
  useEffect(() => {
    if (pyodideStore.inputStatus === 'submitted') {
      workerRef.current?.postMessage({
        type: 'input_response',
        value: pyodideStore.userInput,
      });
    }
  }, [pyodideStore.inputStatus, pyodideStore.userInput]);

  return <>{children}</>;
}
