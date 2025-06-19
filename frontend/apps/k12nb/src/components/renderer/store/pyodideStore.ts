import {useState, useCallback} from 'react';

export type ExecutionStatus = 'idle' | 'queued' | 'running';
export type InputStatus = 'idle' | 'waiting' | 'submitted';
export type WorkerStatus =
  | 'initializing'
  | 'ready'
  | 'error'
  | 'interrupted'
  | 'terminating';

export function usePyodideStore() {
  const [executionStatus, setExecutionStatus] =
    useState<ExecutionStatus>('idle');
  const [workerStatus, setWorkerStatus] =
    useState<WorkerStatus>('initializing');
  const [runningCellId, setRunningCellId] = useState<string | null>(null);
  const [interruptBuffer, setInterruptBufferState] =
    useState<Int32Array | null>(null);
  const [fatalErrorTrace, setFatalErrorTrace] = useState('');
  const [inputStatus, setInputStatus] = useState<InputStatus>('idle');
  const [inputPrompt, setInputPrompt] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string | null>(null);

  const setInterruptBuffer = useCallback((buffer: Int32Array) => {
    setInterruptBufferState(buffer);
  }, []);

  const clearInterruptBuffer = useCallback(() => {
    if (interruptBuffer) {
      interruptBuffer[0] = 0;
      setInterruptBufferState(new Int32Array(interruptBuffer));
    }
  }, [interruptBuffer]);

  const interruptExecution = useCallback(() => {
    if (interruptBuffer) {
      interruptBuffer[0] = 2;
      setInterruptBufferState(new Int32Array(interruptBuffer));
    }
    setExecutionStatus('idle');
  }, [interruptBuffer]);

  const executeCell = useCallback(
    (cellId: string) => {
      if (executionStatus === 'idle' && workerStatus === 'ready') {
        setRunningCellId(cellId);
        setExecutionStatus('queued');
      }
    },
    [executionStatus, workerStatus],
  );

  const executionCompleted = useCallback(() => {
    setRunningCellId(null);
    setExecutionStatus('idle');
  }, []);

  const setFatalError = useCallback((trace: string) => {
    setWorkerStatus('error');
    setFatalErrorTrace(trace);
  }, []);

  const requestUserInput = useCallback((prompt: string) => {
    setInputStatus('waiting');
    setUserInput(null);
    setInputPrompt(prompt);
  }, []);

  const submitUserInput = useCallback((input: string | null) => {
    setInputStatus('submitted');
    setUserInput(input);
  }, []);

  // For compatibility with watcher patterns, you can add subscribe methods if needed

  return {
    executionStatus,
    setExecutionStatus,
    workerStatus,
    setWorkerStatus,
    runningCellId,
    setRunningCellId,
    interruptBuffer,
    setInterruptBuffer,
    clearInterruptBuffer,
    interruptExecution,
    executeCell,
    executionCompleted,
    fatalErrorTrace,
    setFatalError,
    inputStatus,
    setInputStatus,
    inputPrompt,
    setInputPrompt,
    userInput,
    setUserInput,
    requestUserInput,
    submitUserInput,
  };
}
