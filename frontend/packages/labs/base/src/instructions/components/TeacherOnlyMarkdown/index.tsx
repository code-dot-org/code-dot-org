import type {FunctionComponent} from 'react';

import Markdown from '@code-dot-org/markdown';

import moduleStyles from './teacherOnlyMarkdown.module.scss';

export interface TeacherOnlyMarkdownProps {
  content?: string;
  hideContainer: boolean;
}

const TeacherOnlyMarkdown: FunctionComponent<TeacherOnlyMarkdownProps> = ({
  content,
  hideContainer,
}) => {
  if (!content) {
    return;
  }

  // Hides the teal container/header (Lab2 does not use the container).
  return hideContainer ? (
    <div className={moduleStyles.content}></div>
  ) : (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.header}>For Teachers Only</div>
      <Markdown>{content}</Markdown>
    </div>
  );
};

export default TeacherOnlyMarkdown;
