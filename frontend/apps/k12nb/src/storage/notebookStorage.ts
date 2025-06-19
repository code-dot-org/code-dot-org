import type { Notebook, Cell } from "@shared/schemas/notebook";
import { v4 as uuidv4 } from "uuid";

export interface NotebookInfo {
  id: string;
  title: string;
  lastModified?: Date;
  created: Date;
}

const DB_NAME = "NotebookDB";
const STORE_NAME = "notebooks";
const DB_VERSION = 2;

let db: IDBDatabase | null = null;

const deleteDatabase = async (): Promise<void> => {
  if (db) {
    db.close();
    db = null;
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const createDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Database error:", request.error);
      db = null;
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;

      // Double check that our store exists
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.warn("Store not found after initialization");
        db.close();
        db = null;
        reject(new Error("Store not created properly"));
        return;
      }

      resolve(db);
    };

    request.onupgradeneeded = event => {
      console.log("Upgrading database...");
      const database = (event.target as IDBOpenDBRequest).result;

      // If the store exists, delete it and recreate
      if (database.objectStoreNames.contains(STORE_NAME)) {
        database.deleteObjectStore(STORE_NAME);
      }

      console.log("Creating store:", STORE_NAME);
      database.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
  });
};

export const initDB = async (): Promise<IDBDatabase> => {
  if (db) return db;

  try {
    return await createDatabase();
  } catch (error) {
    console.warn("Error creating database, attempting reset:", error);
    await deleteDatabase();
    return createDatabase();
  }
};

interface NotebookRecord {
  id: string;
  notebook: Notebook;
  lastModified: number;
  created: number;
}

const getDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("lastModified", "lastModified");
        store.createIndex("created", "created");
      } else if (event.oldVersion < 2) {
        // Add created field to existing records
        const tx = request.transaction;
        if (tx) {
          const store = tx.objectStore(STORE_NAME);
          store.openCursor().onsuccess = e => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor) {
              const record = cursor.value;
              if (!record.created) {
                record.created = record.lastModified || Date.now();
                cursor.update(record);
              }
              cursor.continue();
            }
          };
        }
      }
    };
  });
};

export const saveNotebook = async (id: string, notebook: Notebook): Promise<void> => {
  const database = await getDB();

  if (!database.objectStoreNames.contains(STORE_NAME)) {
    throw new Error("Database not properly initialized");
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = database.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      // Check if notebook already exists
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingRecord = getRequest.result as NotebookRecord | undefined;
        const now = Date.now();

        const record: NotebookRecord = {
          id,
          notebook,
          lastModified: now,
          created: existingRecord?.created || now,
        };

        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      };

      getRequest.onerror = () => reject(getRequest.error);

      tx.oncomplete = () => database.close();
    } catch (err) {
      reject(err);
    }
  });
};

export const getNotebook = async (id: string): Promise<Notebook> => {
  const database = await getDB();

  if (!database.objectStoreNames.contains(STORE_NAME)) {
    throw new Error("Database not properly initialized");
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = database.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      const request = store.get(id);

      request.onsuccess = () => {
        const record = request.result as NotebookRecord;
        if (!record) {
          reject(new Error("Notebook not found"));
          return;
        }
        resolve(record.notebook);
      };

      request.onerror = () => reject(request.error);

      tx.oncomplete = () => database.close();
    } catch (err) {
      reject(err);
    }
  });
};

export const listNotebooks = async (): Promise<NotebookInfo[]> => {
  const database = await getDB();

  if (!database.objectStoreNames.contains(STORE_NAME)) {
    throw new Error("Database not properly initialized");
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = database.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result as NotebookRecord[];
        const notebooks = records.map(record => ({
          id: record.id,
          title: record.notebook.metadata?.title || "Untitled Notebook",
          lastModified: new Date(record.lastModified),
          created: new Date(record.created),
        }));

        // Sort by created date, newest first
        notebooks.sort((a, b) => b.created.getTime() - a.created.getTime());

        resolve(notebooks);
      };

      request.onerror = () => reject(request.error);

      tx.oncomplete = () => database.close();
    } catch (err) {
      reject(err);
    }
  });
};

export const deleteNotebook = async (id: string): Promise<void> => {
  const database = await getDB();

  if (!database.objectStoreNames.contains(STORE_NAME)) {
    throw new Error("Database not properly initialized");
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = database.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      store.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    } catch (err) {
      reject(err);
    }
  });
};

export const loadBlankNotebook = async (): Promise<Notebook> => {
  try {
    const response = await fetch(`./templates/blank.ipynb`);
    if (!response.ok) {
      throw new Error(`Failed to load blank notebook template: ${response.statusText}`);
    }
    const notebook = await response.json();
    
    // Ensure every cell has an id property
    notebook.cells.forEach((cell: Cell) => {
      if (!cell.id) {
        cell.id = uuidv4();
      }
    });
    
    return notebook;
  } catch (err) {
    throw new Error(
      `Failed to load blank notebook template: ${err instanceof Error ? err.message : String(err)}`
    );
  }
};

export const loadSampleNotebook = async (samplePath: string): Promise<Notebook> => {
  try {
    const response = await fetch(`/samples/${samplePath}`);
    if (!response.ok) {
      throw new Error(`Failed to load sample notebook: ${response.statusText}`);
    }
    const notebook = await response.json();
    
    // Ensure every cell has an id property
    notebook.cells.forEach((cell: Cell) => {
      if (!cell.id) {
        cell.id = uuidv4();
      }
    });
    
    return notebook;
  } catch (err) {
    throw new Error(
      `Failed to load sample notebook: ${err instanceof Error ? err.message : String(err)}`
    );
  }
};

export const importNotebookFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const notebook: Notebook = JSON.parse(content);
        
        // Validate notebook structure
        if (!notebook.cells || !Array.isArray(notebook.cells)) {
          throw new Error('Invalid notebook format: missing or invalid cells array');
        }
        
        // Set default values if missing
        if (!notebook.metadata) {
          notebook.metadata = {};
        }
        
        if (!notebook.nbformat) {
          notebook.nbformat = 4;
        }
        
        if (!notebook.nbformat_minor) {
          notebook.nbformat_minor = 2;
        }
        
        // Ensure all cells have IDs and required properties
        notebook.cells.forEach((cell: Cell) => {
          if (!cell.id) {
            cell.id = uuidv4();
          }
          if (!cell.metadata) {
            cell.metadata = {};
          }
          if (!cell.source) {
            cell.source = [];
          }
        });
        
        // Set a default title if none exists
        if (!notebook.metadata.title) {
          notebook.metadata.title = file.name.replace('.ipynb', '') || 'Imported Notebook';
        }
        
        // Save notebook to storage
        const id = uuidv4();
        await saveNotebook(id, notebook);
        
        resolve(id);
        
      } catch (parseError) {
        reject(new Error(`Failed to parse notebook file: ${parseError instanceof Error ? parseError.message : String(parseError)}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the selected file'));
    };
    
    reader.readAsText(file);
  });
};

const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const importNotebookFromUrl = async (url: string): Promise<string> => {
  // Validate URL format
  if (!validateUrl(url)) {
    throw new Error('Please enter a valid URL (must start with http:// or https://)');
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notebook: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    const notebook: Notebook = JSON.parse(content);
    
    // Validate notebook structure
    if (!notebook.cells || !Array.isArray(notebook.cells)) {
      throw new Error('Invalid notebook format: missing or invalid cells array');
    }
    
    // Set default values if missing
    if (!notebook.metadata) {
      notebook.metadata = {};
    }
    
    if (!notebook.nbformat) {
      notebook.nbformat = 4;
    }
    
    if (!notebook.nbformat_minor) {
      notebook.nbformat_minor = 2;
    }
    
    // Ensure all cells have IDs and required properties
    notebook.cells.forEach((cell: Cell) => {
      if (!cell.id) {
        cell.id = uuidv4();
      }
      if (!cell.metadata) {
        cell.metadata = {};
      }
      if (!cell.source) {
        cell.source = [];
      }
    });
    
    // Set a default title if none exists
    if (!notebook.metadata.title) {
      // Extract filename from URL or use default
      const urlPath = new URL(url).pathname;
      const filename = urlPath.split('/').pop() || 'imported-notebook.ipynb';
      notebook.metadata.title = filename.replace('.ipynb', '') || 'Imported Notebook';
    }
    
    // Save notebook to storage
    const id = uuidv4();
    await saveNotebook(id, notebook);
    
    return id;
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to import notebook from URL: ${String(error)}`);
  }
};
