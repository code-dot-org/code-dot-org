import {Plugin} from 'unified';
declare module '@code-dot-org/remark-plugins' {
  const details: Plugin;
  const clickableText: Plugin;
  const expandableImages: Plugin;
  const visualCodeBlock: Plugin;
  const xmlAsTopLevelBlock: Plugin;

  export {
    details,
    clickableText,
    expandableImages,
    visualCodeBlock,
    xmlAsTopLevelBlock,
  };
}
