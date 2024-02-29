export function getCollabWorker() {
  return new Worker(new URL('./collabWorker.ts', import.meta.url));
}

export const collabWorker = getCollabWorker();
