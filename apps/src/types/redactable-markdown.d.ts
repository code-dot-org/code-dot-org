import {Plugin} from 'unified';
declare module '@code-dot-org/redactable-markdown' {
  const redactableMarkdown: {getParser: () => Plugin};
  export default redactableMarkdown;
}
