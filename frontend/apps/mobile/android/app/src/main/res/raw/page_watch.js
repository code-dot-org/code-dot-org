// Last: applies everything the other files registered, then again on every
// change to the page. Attribute changes are watched for the viewport's
// content only.
pageChanged();
new MutationObserver(pageChanged).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['content'],
});
