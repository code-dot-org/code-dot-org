/**
 * Wrapper for window.performance that no-ops for unavailable methods
 */

function safeWrap(methodName, defaultReturn) {
  if (window.performance && window.performance[methodName]) {
    return window.performance[methodName].bind(window.performance);
  } else {
    return () => defaultReturn;
  }
}

export const clearMarks = safeWrap('clearMarks');
export const clearMeasures = safeWrap('clearMeasures');
export const mark = safeWrap('mark');
export const measure = safeWrap('measure');
export const getEntriesByName = safeWrap('getEntriesByName', []);
