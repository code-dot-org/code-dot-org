/**
 * Minimal mdast node shape and walker, shared by the syntax transformers.
 *
 * The transformers piggyback on existing markdown (links, images) rather than
 * inventing new syntax, so they post-process the parsed tree instead of
 * extending the tokenizer. They rewrite matched nodes via `data.hName` /
 * `hProperties` / `hChildren`, the hooks `remark-rehype` honors when converting
 * mdast to hast.
 *
 * A local type and walker avoid a dependency on `unist-util-visit` (whose
 * hoisted version in this workspace predates the modern API).
 */
export interface MdastNode {
  type: string;
  url?: string;
  alt?: string;
  value?: string;
  children?: MdastNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: Array<{type: 'text'; value: string}>;
  };
}

/** Depth-first visit of every node of the given type. */
export const visit = (
  node: MdastNode,
  type: string,
  visitor: (node: MdastNode) => void,
): void => {
  if (node.type === type) {
    visitor(node);
  }
  node.children?.forEach(child => visit(child, type, visitor));
};
