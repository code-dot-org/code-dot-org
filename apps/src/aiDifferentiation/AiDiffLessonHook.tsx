import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
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
        <Typography variant="h1">{title}</Typography>
        <Typography variant="overline1">
          {updated.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Typography>
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
            <Typography variant="overline1">{`Introduction`}</Typography>
          </div>
          <div
            className={classNames(
              style.artifactContent,
              style.artifactContentBlue
            )}
          >
            <Typography component="div" variant="body2">
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
            <Typography
              variant="overline1"
              gutterBottom
            >{`Activity`}</Typography>
          </div>
          <div
            className={classNames(
              style.artifactContent,
              style.artifactContentPurple
            )}
          >
            <Typography component="div" variant="body2" gutterBottom>
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
            <Typography
              variant="overline1"
              gutterBottom
            >{`Reflection`}</Typography>
          </div>
          <div
            className={classNames(
              style.artifactContent,
              style.artifactContentRed
            )}
          >
            <Typography component="div" variant="body2" gutterBottom>
              <SafeMarkdown unwrapped markdown={content.wrap_up} />
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDiffLessonHook;
