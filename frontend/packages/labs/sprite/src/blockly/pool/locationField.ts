// The locationPicker input's field: a button showing a location, which asks
// the playspace for a point when pressed (apps' locationField and
// locationPicker slice).
import * as BlocklyCore from 'blockly/core';

import {APP_HEIGHT} from '../../constants';

export interface PickedLocation {
  x: number;
  y: number;
}

/**
 * Picks a point on the playspace. `onUpdate` follows the pointer; `onDone`
 * gets the chosen point, or null when picking was cancelled. `costume` names
 * the image the block's sprite would wear, if the block says.
 */
export type LocationPicker = (
  initial: PickedLocation | undefined,
  onUpdate: (location: PickedLocation) => void,
  onDone: (location: PickedLocation | null) => void,
  costume: string | null,
) => void;

let picker: LocationPicker | null = null;

/** The view registers how points are picked; null while it cannot. */
export function setLocationPicker(next: LocationPicker | null): void {
  picker = next;
}

function parseLocation(value: string | null): PickedLocation | undefined {
  try {
    const parsed = value ? JSON.parse(value) : undefined;
    return parsed &&
      typeof parsed === 'object' &&
      Number.isFinite(parsed.x) &&
      Number.isFinite(parsed.y)
      ? {x: parsed.x, y: parsed.y}
      : undefined;
  } catch {
    return undefined;
  }
}

/** The value is the location as JSON, in canvas coordinates. */
export class LocationField extends BlocklyCore.Field<string> {
  override EDITABLE = true;
  override SERIALIZABLE = true;

  constructor(value?: string) {
    super(value ?? '');
  }

  protected override doClassValidation_(value?: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }

  // Blocks show y counting up from the bottom, as the location blocks do.
  protected override getText_(): string {
    const location = parseLocation(this.getValue());
    const text = location ? `(${location.x}, ${APP_HEIGHT - location.y})` : '';
    return `${text} \u{1F4CD}`;
  }

  protected override showEditor_(): void {
    if (!picker) {
      return;
    }
    const original = this.getValue() ?? '';
    const block = this.getSourceBlock();
    // Apps looked on the block and its parent: a location_picker block sits
    // in the socket of the block that makes the sprite.
    const costume =
      block?.getFieldValue('ANIMATION_NAME') ??
      block?.getParent()?.getFieldValue('ANIMATION_NAME');
    picker(
      parseLocation(original),
      location => this.setValue(JSON.stringify(location)),
      // A cancelled pick undoes the live updates.
      location => {
        if (!location) {
          this.setValue(original);
        }
      },
      // Costume values are quoted names, as in '"owl_1"'.
      typeof costume === 'string' ? costume.replace(/^"|"$/g, '') : null,
    );
  }
}
