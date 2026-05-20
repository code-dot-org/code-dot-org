// @ts-expect-error Package has no bundled TypeScript declaration.
import Processor from '@code-dot-org/redactable-markdown';
import defaultSanitizationSchema from 'hast-util-sanitize/lib/github.json';
import React from 'react';
import rehypeRaw from 'rehype-raw';
// @ts-expect-error Package has no bundled TypeScript declaration.
import rehypeReact from 'rehype-react';
import rehypeSanitize from 'rehype-sanitize';
import remarkRehype from 'remark-rehype';
import unified from 'unified';

import styles from './lesson-materials.module.scss';

interface TeacherNoteMarkdownProps {
  markdown: string;
}

const markdownProcessor = unified()
  .use(Processor.getParser())
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeRaw)
  .use(rehypeSanitize, defaultSanitizationSchema as never)
  .use(rehypeReact, {
    createElement: React.createElement,
  });

const TeacherNoteMarkdown: React.FC<TeacherNoteMarkdownProps> = ({
  markdown,
}) => {
  const rendered = Object(markdownProcessor.processSync(markdown).result);
  return <div className={styles.teacherNoteMarkdown}>{rendered}</div>;
};

export default TeacherNoteMarkdown;
