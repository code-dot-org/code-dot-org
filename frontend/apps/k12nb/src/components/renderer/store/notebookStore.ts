import {useSyncExternalStore} from 'react';
import {v4 as uuidv4} from 'uuid';

import {Notebook, Output, NOTEBOOK_SKELETON} from '@/schemas/notebook';

export type OutputType = 'result' | 'stdout' | 'error';

// Internal singleton state
const state = {
  content: NOTEBOOK_SKELETON as Notebook,
  updated: null as number | null,
};

// Listeners for subscription
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

export const notebookStore = {
  get content() {
    return state.content;
  },
  get updated() {
    return state.updated;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  clear() {
    state.updated = null;
    state.content = NOTEBOOK_SKELETON;
    emitChange();
  },
  findCell(cellId: string) {
    if (!state.content.cells) return null;
    return state.content.cells.find(cell => cell.id === cellId);
  },
  getSource(cellId: string) {
    const cell = this.findCell(cellId);
    return cell ? cell.source : null;
  },
  getLocalizedSource(cellId: string, locale: string): string[] | undefined {
    const cell = this.findCell(cellId);
    if (!cell) return undefined;
    let source = cell.source;
    if (cell.metadata['i18n'] && cell.metadata['i18n'][locale]) {
      source = cell.metadata['i18n'][locale];
    }
    if (!source) return undefined;
    const globals = state.content.metadata?.globals;
    if (!globals) return source;
    const localizedSource = source.map(line =>
      line.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, variableName) => {
        const globalVar = globals[variableName];
        if (!globalVar) return match;
        const localizedValue = globalVar[locale] || globalVar.default;
        if (localizedValue === undefined) return match;
        return `${localizedValue}`;
      }),
    );
    return localizedSource;
  },
  setSource(cellId: string, source: string[]) {
    const cell = this.findCell(cellId);
    if (cell) {
      cell.source = source.map(line => line + '\n');
      state.updated = Date.now();
      emitChange();
    }
  },
  clearOutputs(cellId: string) {
    const cell = this.findCell(cellId);
    if (cell) {
      cell.outputs = [];
      state.updated = Date.now();
      emitChange();
    }
  },
  getOutputTypes(cellId: string): OutputType[] {
    const result: OutputType[] = [];
    const cell = this.findCell(cellId);
    if (cell) {
      if (
        cell.outputs?.findIndex(
          (output: Output) => output.output_type === 'execute_result',
        ) !== -1
      ) {
        result.push('result');
      }
      if (
        cell.outputs?.findIndex(
          (output: Output) =>
            output.output_type === 'stream' && output.name === 'stdout',
        ) !== -1
      ) {
        result.push('stdout');
      }
      if (
        cell.outputs?.findIndex(
          (output: Output) => output.output_type === 'error',
        ) !== -1
      ) {
        result.push('error');
      }
    }
    return result;
  },
  addStdout(cellId: string, stdout: string) {
    const cell = this.findCell(cellId);
    if (cell) {
      if (!cell.outputs) cell.outputs = [];
      const index = cell.outputs.findIndex(
        (output: Output) =>
          output.output_type === 'stream' && output.name === 'stdout',
      );
      if (index !== -1) {
        if (!cell.outputs[index].text) {
          cell.outputs[index].text = [];
        }
        cell.outputs[index].text.push(stdout);
      } else {
        cell.outputs.push({
          output_type: 'stream',
          name: 'stdout',
          text: [stdout],
        });
      }
      state.updated = Date.now();
      emitChange();
    }
  },
  getStdout(cellId: string) {
    let console = '';
    const cell = this.findCell(cellId);
    if (cell) {
      cell.outputs?.forEach(output => {
        if (output.output_type === 'stream') {
          console += output.text?.join('') || '';
        }
      });
    }
    return console;
  },
  setResult(cellId: string, result: any) {
    const cell = this.findCell(cellId);
    if (cell) {
      if (!cell.outputs) cell.outputs = [];
      const executeResultIndex = cell.outputs.findIndex(
        (output: Output) => output.output_type === 'execute_result',
      );
      if (executeResultIndex !== -1) {
        const existingData = cell.outputs[executeResultIndex].data || {};
        cell.outputs[executeResultIndex].data = {...existingData, ...result};
      } else {
        cell.outputs.push({output_type: 'execute_result', data: result});
      }
      state.updated = Date.now();
      emitChange();
    }
  },
  getResult(cellId: string) {
    let result = {};
    const cell = this.findCell(cellId);
    if (cell) {
      cell.outputs?.forEach(output => {
        if (output.output_type === 'execute_result' && output.data) {
          result = output.data;
        }
      });
    }
    return result;
  },
  setError(cellId: string, traceback: string | string[]) {
    const cell = this.findCell(cellId);
    if (cell) {
      if (!cell.outputs) cell.outputs = [];
      const tracebackArray = Array.isArray(traceback)
        ? traceback
        : traceback.split('\n');
      cell.outputs.push({output_type: 'error', traceback: tracebackArray});
      state.updated = Date.now();
      emitChange();
    }
  },
  getError(cellId: string) {
    let error = '';
    const cell = this.findCell(cellId);
    if (cell) {
      cell.outputs?.forEach(output => {
        if (output.output_type === 'error') {
          error += output.traceback?.join('') || '';
        }
      });
    }
    return error;
  },
  loadNotebook(notebook: Notebook) {
    if (notebook.cells) {
      notebook.cells.forEach(cell => {
        if (!cell.id || typeof cell.id !== 'string' || cell.id.trim() === '') {
          cell.id = uuidv4();
        }
      });
      state.content = notebook;
      emitChange();
    }
  },
  hasTag(cellId: string, tag: string): boolean {
    const cell = this.findCell(cellId);
    if (!cell || !cell.metadata.tags) return false;
    return cell.metadata.tags.includes(tag);
  },
  addTag(cellId: string, tag: string) {
    const cell = this.findCell(cellId);
    if (cell) {
      if (!cell.metadata.tags) cell.metadata.tags = [];
      if (!cell.metadata.tags.includes(tag)) {
        cell.metadata.tags.push(tag);
        state.updated = Date.now();
        emitChange();
      }
    }
  },
  removeTag(cellId: string, tag: string) {
    const cell = this.findCell(cellId);
    if (cell && cell.metadata.tags) {
      const index = cell.metadata.tags.indexOf(tag);
      if (index !== -1) {
        cell.metadata.tags.splice(index, 1);
        state.updated = Date.now();
        emitChange();
      }
    }
  },
  toggleTag(cellId: string, tag: string) {
    if (this.hasTag(cellId, tag)) {
      this.removeTag(cellId, tag);
    } else {
      this.addTag(cellId, tag);
    }
  },
};

// React hook for subscribing to the singleton store
export function useNotebookStore() {
  return useSyncExternalStore(notebookStore.subscribe, () => ({
    content: notebookStore.content,
    updated: notebookStore.updated,
  }));
}
