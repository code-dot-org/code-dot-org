import {Pathway} from '../types';

export const MAP_LAYOUTS = ['tree', 'destinations'] as const;
export type MapLayoutMode = (typeof MAP_LAYOUTS)[number];
export const ORIENTATIONS = ['n', 'e', 's', 'w'] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export interface MapSettings {
  layout: MapLayoutMode;
  /** Quarter turns clockwise from the authored orientation. */
  turns: number;
}

/**
 * How to draw a pathway's map: the URL's `mapLayout` and `mapOrientation`
 * when present and valid, so a layout can be tried without editing content,
 * else the pathway's `map`, else the tree facing north.
 */
export function resolveMapSettings(
  pathway: Pathway,
  search: string
): MapSettings {
  const params = new URLSearchParams(search);
  const pick = <T extends string>(
    value: string | null | undefined,
    allowed: readonly T[]
  ): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined);
  const layout =
    pick(params.get('mapLayout'), MAP_LAYOUTS) ??
    pick(pathway.map?.layout, MAP_LAYOUTS) ??
    'tree';
  const orientation =
    pick(params.get('mapOrientation'), ORIENTATIONS) ??
    pick(pathway.map?.orientation, ORIENTATIONS) ??
    'n';
  return {layout, turns: ORIENTATIONS.indexOf(orientation)};
}
