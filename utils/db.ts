const DB_NAME = 'ultrasound-narrations-db';
const STORE_NAME = 'narrations';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject("IndexedDB is not supported by this browser.");
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject("Error opening IndexedDB.");
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }
  return dbPromise;
}

export async function saveNarration(key: string, audioBuffer: ArrayBuffer): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(audioBuffer, key);
      
      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        console.error('Transaction error:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to save narration to IndexedDB:", error);
  }
}

export async function getNarration(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve((request.result as ArrayBuffer) || null);
      };

      request.onerror = () => {
        console.error('Request error:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to get narration from IndexedDB:", error);
    return null;
  }
}