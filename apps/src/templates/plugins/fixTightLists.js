/**
 * This is a terrible, horrible, no good, very bad hack.
 *
 * In short, markdown lists can be either "loose", meaning with list items
 * separated by extra newlines, or "tight". Most (all?) of the lists in our
 * level content are tight.
 *
 * In nearly all markdown implementations, tight lists do NOT wrap their
 * textual content in paragraph tags, and loose lists do. Unfortunately, in
 * remark, all list content is wrapped in paragraph tags. Until that can be
 * fixed, we apply a post-tokenization cleanup step to go through and
 * conditionally remove paragraph tags that should not have been created in
 * the first place.
 *
 * Possible fixes are in-discussion at:
 *
 * https://github.com/syntax-tree/mdast-util-to-hast/pull/23
 * https://github.com/remarkjs/remark/pull/349
 */
module.exports = function fixTightLists() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const originalList = tokenizers.list;
  tokenizers.list = function (eat, value, silent) {
    const result = originalList.call(this, eat, value, silent);

    if (result && !result.loose && result.children) {
      result.children.forEach(function (listItem) {
        if (listItem.children) {
          listItem.children = listItem.children.reduce(function (children, child) {
            if (child.type === "paragraph") {
              children = children.concat(child.children);
            } else {
              children.push(child);
            }
            return children;
          }, []);
        }
      });
    }

    return result;
  };
};

