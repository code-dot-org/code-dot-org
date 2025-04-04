// Folders that should be hidden from users projects.
// .matplotlib is auto-generated when matplotlib is imported, and is not
// something that shows up in "normal" python.
export const HIDDEN_FOLDERS = ['.matplotlib'];

// The folder that user files are written to in the pyodide
// virtual file system.
export const HOME_FOLDER = 'Files';

// Constants for managing input in Python.
// These constants are duplicated in inputServiceWorker.js because service workers cannot import modules.
export const AWAITING_INPUT = 'AWAITING_INPUT';
export const SENDING_INPUT = 'SENDING_INPUT';
export const SERVICE_WORKER_PATH = '/pythonlab-input-sw/';
