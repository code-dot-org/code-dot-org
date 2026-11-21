// The words a schema can give the schema form, beyond zod's own `title`
// and `description`. Import this module from a schema that uses them.
//
// `feature` marks an optional group as a feature the level turns on, and
// is the label of its switch. `widget` asks for a control other than the
// one the node's type would get: one the form has (lines, names, markdown,
// json) or one its caller supplies. `defaultValue` is what the lab does
// when a setting is not set, so a box can show it.

declare module 'zod' {
  interface GlobalMeta {
    feature?: string;
    widget?: string;
    placeholder?: string;
    defaultValue?: unknown;
  }
}

export {};
