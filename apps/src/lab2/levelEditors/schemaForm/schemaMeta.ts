// The meta a schema can give the schema form, beyond zod's own `title` and
// `description`. Import this module from a schema that uses it.
//
// `feature` marks an optional group as a feature the level turns on, and
// is the label of its switch. `widget` asks for a control other than the
// one the node's type would get: one the form has (lines, names, markdown,
// json, reference) or one its caller supplies. `defaultValue` is what the
// lab does when a setting is not set, so the form can show that value in
// the unset control.
//
// A reference field's `options` says where its choices come from. In the
// whole value, `*` stands for every key or index: "skills.*" gives the keys
// of the skills map, "checkpoints.*.id" each checkpoint's id, and a
// trailing `*` over a list of names gives the names themselves. Each
// leading "../" starts one step up from the field instead, as in
// "../choices.*.id". "@name" names a list the page supplies (SchemaForm's
// suppliedOptions). A map's `keyOptions` says where its keys come from,
// the same way.

declare module 'zod' {
  interface GlobalMeta {
    feature?: string;
    widget?: string;
    placeholder?: string;
    defaultValue?: unknown;
    options?: string;
    keyOptions?: string;
  }
}

export {};
