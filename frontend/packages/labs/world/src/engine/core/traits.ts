// Reference-counted dependency resolution, used for both a World's Rules and an
// Actor's Traits (DESIGN.md: "Traits that are implied via dependency are
// reference counted").
//
// The rule (from DESIGN.md): adding an item pulls in the items it requires;
// removing an explicitly-added item does not remove a dependency that another
// surviving item still requires; and an item that was added explicitly but is
// also required by a survivor stays present even after its explicit removal.
//
// We track two counts per item: `explicit` (times the caller added it directly)
// and `implied` (times a present item requires it). The item is present while
// explicit + implied > 0. This generic class is instantiated over Rule and over
// Trait; `getDeps` yields the requirements and `keyOf` gives a stable identity.

interface Entry<T> {
  item: T;
  explicit: number;
  implied: number;
}

export class DependencySet<T> {
  private readonly getDeps: (item: T) => readonly T[];
  private readonly keyOf: (item: T) => string;
  private readonly entries = new Map<string, Entry<T>>();

  constructor(getDeps: (item: T) => readonly T[], keyOf: (item: T) => string) {
    this.getDeps = getDeps;
    this.keyOf = keyOf;
  }

  /** Add `item`. `explicit` false marks it as pulled in by a dependent. */
  add(item: T, explicit = true): void {
    const key = this.keyOf(item);
    let entry = this.entries.get(key);
    const wasPresent = entry !== undefined && this.total(entry) > 0;
    if (!entry) {
      entry = {item, explicit: 0, implied: 0};
      this.entries.set(key, entry);
    }
    if (explicit) {
      entry.explicit += 1;
    } else {
      entry.implied += 1;
    }
    // Recurse only when the item first becomes present, so each dependency edge
    // contributes exactly one implied count.
    if (!wasPresent) {
      for (const dep of this.getDeps(item)) {
        this.add(dep, false);
      }
    }
  }

  /** Remove one explicit add of `item`; cascades to now-orphaned dependencies. */
  remove(item: T): void {
    const entry = this.entries.get(this.keyOf(item));
    if (!entry || entry.explicit === 0) {
      return;
    }
    entry.explicit -= 1;
    if (this.total(entry) === 0) {
      this.drop(entry);
    }
  }

  private dropImplied(item: T): void {
    const entry = this.entries.get(this.keyOf(item));
    if (!entry || entry.implied === 0) {
      return;
    }
    entry.implied -= 1;
    if (this.total(entry) === 0) {
      this.drop(entry);
    }
  }

  private drop(entry: Entry<T>): void {
    this.entries.delete(this.keyOf(entry.item));
    for (const dep of this.getDeps(entry.item)) {
      this.dropImplied(dep);
    }
  }

  private total(entry: Entry<T>): number {
    return entry.explicit + entry.implied;
  }

  has(item: T): boolean {
    return this.entries.has(this.keyOf(item));
  }

  /** Total reference count for `item` (0 if absent). */
  count(item: T): number {
    const entry = this.entries.get(this.keyOf(item));
    return entry ? this.total(entry) : 0;
  }

  /** All present items, in insertion order. */
  items(): T[] {
    return [...this.entries.values()].map(e => e.item);
  }
}
