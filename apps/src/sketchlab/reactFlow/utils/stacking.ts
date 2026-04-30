// Reorder helpers for the nodes/edges arrays. React Flow paints later items
// on top, so moving an element to the end brings it to the front and moving
// it to the start sends it to the back.

export function moveToEnd<T extends {id: string}>(items: T[], id: string): T[] {
  const target = items.find(item => item.id === id);
  if (!target) return items;
  return [...items.filter(item => item.id !== id), target];
}

export function moveToStart<T extends {id: string}>(
  items: T[],
  id: string
): T[] {
  const target = items.find(item => item.id === id);
  if (!target) return items;
  return [target, ...items.filter(item => item.id !== id)];
}
