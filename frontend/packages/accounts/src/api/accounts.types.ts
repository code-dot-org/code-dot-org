// Partial so indexed access is `string[] | undefined`; the `?.` guards at
// every read site are load-bearing, not defensive-by-convention.
export type FieldErrors = Partial<Record<string, string[]>>;
