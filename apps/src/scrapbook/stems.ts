// Sentence stems shown in the scrapbook entry dialog and rendered in the
// gallery. Keys here are the storage keys persisted under
// scrapbook_entries.entry_text on the server. Changing a label is purely a
// frontend edit; adding or removing a stem also requires no schema change,
// though old entries will retain whatever keys they were saved with.
export interface ScrapbookStem {
  key: string;
  label: string;
}

export const SCRAPBOOK_STEMS: ScrapbookStem[] = [
  {key: 'at_first', label: 'At first...'},
  {key: 'but_then', label: 'But then...'},
  {key: 'and_now', label: 'And now...'},
];

export type EntryText = Record<string, string>;
