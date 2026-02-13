import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Typography, {
  Heading1,
  OverlineOneText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import SafeMarkdown from '../templates/SafeMarkdown';

import {LessonHook} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffLessonHookProps {
  title: string;
  updated: Date;
  content: LessonHook;
}

const AiDiffLessonHook: React.FC<AiDiffLessonHookProps> = ({
  title,
  updated,
  content,
}) => {
  return (
    <div className={style.artifactContainer}>
      <div className={style.artifactHeader}>
        <Heading1>{title}</Heading1>
        <OverlineOneText>
          {updated.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </OverlineOneText>
      </div>
      <div className={style.artifactContentBlocksContainer}>
        <div className={style.artifactContentBlock}>
          <div
            className={classNames(
              style.artifactContentLabel,
              style.artifactContentLabelBlue
            )}
          >
            <FontAwesomeV6Icon
              iconName={`thought-bubble`}
              className={style.artifactIcon}
            />
            <OverlineOneText>{`Introduction`}</OverlineOneText>
          </div>
          <div
            className={classNames(
              style.artifactContent,
              style.artifactContentBlue
            )}
          >
            <Typography semanticTag="div" visualAppearance="body-two">
              <SafeMarkdown unwrapped markdown={content.introduction} />
            </Typography>
          </div>
        </div>

        <div className={style.artifactContentBlock}>
          <div
            className={classNames(
              style.artifactContentLabel,
              style.artifactContentLabelPurple
            )}
          >
            <FontAwesomeV6Icon
              iconName={`paintbrush-pencil`}
              className={style.artifactIcon}
            />
            <OverlineOneText>{`Activity`}</OverlineOneText>
          </div>
          <div
            className={classNames(
              style.artifactContent,
              style.artifactContentPurple
            )}
          >
            <Typography semanticTag="div" visualAppearance="body-two">
              <SafeMarkdown unwrapped markdown={content.activity} />
            </Typography>
          </div>
        </div>

        <div className={style.artifactContentBlock}>
          <div
            className={classNames(
              style.artifactContentLabel,
              style.artifactContentLabelRed
            )}
          >
            <FontAwesomeV6Icon
              iconName={`lightbulb-on`}
              className={style.artifactIcon}
            />
            <OverlineOneText>{`Reflection`}</OverlineOneText>
          </div>
          <div
            className={classNames(
              style.artifactContent,
              style.artifactContentRed
            )}
          >
            <Typography semanticTag="div" visualAppearance="body-two">
              <SafeMarkdown unwrapped markdown={content.wrap_up} />
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDiffLessonHook;
