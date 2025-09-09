import {pino} from 'pino';

type LoggerNamespace = 'contentful' | 'revalidate';
const loggers = new Map<LoggerNamespace, pino.Logger>();
const defaultLogger = pino();

export function getLogger(namespace: LoggerNamespace) {
  if (!loggers.has(namespace)) {
    loggers.set(namespace, defaultLogger.child({name: namespace}));
  }

  return loggers.get(namespace)!;
}
