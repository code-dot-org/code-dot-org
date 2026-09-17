// Local drawing model for the whiteboard challenge. Intentionally decoupled
// from lab2/types so the canvas can evolve independently.

export type DrawingTool =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'text'
  | 'line'
  | 'freedraw';

// Mirrors just the semantic fields needed for the accessible object list and
// aria output. Fabric is authoritative for position, dimensions, and style.
export interface DrawingObjectRecord {
  id: string;
  kind:
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'text'
    | 'line'
    | 'path'
    | 'image';
  description: string;
  // Hex color string; empty when not applicable (e.g. images).
  color: string;
}
