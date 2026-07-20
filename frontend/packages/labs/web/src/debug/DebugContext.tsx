import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

// State for the debug panel: what the student's page logged, and what it asked
// the network for. Ported from apps/src/weblab2/redux/{consoleRedux,networkRedux}.ts
// — legacy keeps these in redux; this package holds them in a context, since only
// the preview writes them and only the debug panel reads them.

export type ConsoleLogLevel = 'log' | 'warn' | 'error' | 'info';

export interface ConsoleEntry {
  level: ConsoleLogLevel;
  message: string;
  timestamp: string;
  /** Repeats of the same message collapse into one entry with a count. */
  count: number;
  groupKey: string;
}

export interface NetworkRequestData {
  method?: string;
  startTime: string;
  url: string;
  /** Set when the request was refused by the content-security policy. */
  cspDirectiveViolated?: string;
  blocked?: boolean;
}

export interface NetworkResponseData {
  url: string;
  status?: number;
  timeElapsed?: number;
  body?: string;
  error?: unknown;
  contentType?: string;
}

export interface NetworkEntry {
  id: string;
  request: NetworkRequestData;
  response?: NetworkResponseData;
}

/** Legacy's cap, so a chatty page cannot grow the log without bound. */
const MAX_LOG_ENTRIES = 500;
const MAX_NETWORK_ENTRIES = 500;

interface DebugState {
  logs: ConsoleEntry[];
  requests: NetworkEntry[];
  addConsoleLog: (level: ConsoleLogLevel, args: string[]) => void;
  addNetworkRequest: (id: string, request: NetworkRequestData) => void;
  addNetworkResponse: (id: string, response: NetworkResponseData) => void;
  clear: () => void;
}

const DebugContext = createContext<DebugState>({
  logs: [],
  requests: [],
  addConsoleLog: () => {},
  addNetworkRequest: () => {},
  addNetworkResponse: () => {},
  clear: () => {},
});

export const useDebug = () => useContext(DebugContext);

export const DebugProvider = ({children}: PropsWithChildren) => {
  const [logs, setLogs] = useState<ConsoleEntry[]>([]);
  const [requests, setRequests] = useState<NetworkEntry[]>([]);

  const addConsoleLog = useCallback(
    (level: ConsoleLogLevel, args: string[]) => {
      const message = args.join(' ');
      const groupKey = `${level}:${message}`;
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => {
        // A repeat of the most recent identical message bumps its count and
        // moves to the end, rather than adding a row (legacy's grouping).
        const existing = prev.findIndex(log => log.groupKey === groupKey);
        if (existing !== -1) {
          const entry = prev[existing];
          const next = [
            ...prev.slice(0, existing),
            ...prev.slice(existing + 1),
          ];
          next.push({...entry, count: entry.count + 1, timestamp});
          return next;
        }
        const next = [...prev, {level, message, timestamp, count: 1, groupKey}];
        return next.length > MAX_LOG_ENTRIES ? next.slice(1) : next;
      });
    },
    [],
  );

  const addNetworkRequest = useCallback(
    (id: string, request: NetworkRequestData) => {
      setRequests(prev => {
        const next = [...prev, {id, request}];
        return next.length > MAX_NETWORK_ENTRIES ? next.slice(1) : next;
      });
    },
    [],
  );

  const addNetworkResponse = useCallback(
    (id: string, response: NetworkResponseData) => {
      setRequests(prev =>
        prev.map(entry => (entry.id === id ? {...entry, response} : entry)),
      );
    },
    [],
  );

  const clear = useCallback(() => {
    setLogs([]);
    setRequests([]);
  }, []);

  const value = useMemo(
    () => ({
      logs,
      requests,
      addConsoleLog,
      addNetworkRequest,
      addNetworkResponse,
      clear,
    }),
    [
      logs,
      requests,
      addConsoleLog,
      addNetworkRequest,
      addNetworkResponse,
      clear,
    ],
  );

  return (
    <DebugContext.Provider value={value}>{children}</DebugContext.Provider>
  );
};
