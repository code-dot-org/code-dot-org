import {Markdown, extensions} from '@code-dot-org/markdown';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import LessonTip from '@cdo/apps/templates/lessonOverview/activities/LessonTip';
import ProgressionDetails from '@cdo/apps/templates/lessonOverview/activities/ProgressionDetails';
import {activitySectionShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import i18n from '@cdo/locale';

import styles from '../lesson-plan.module.scss';

export default class ActivitySection extends Component {
  static propTypes = {
    section: activitySectionShape,
    // Keyed by vocabulary reference, e.g. `parameter/csd/2021`. The server
    // resolves the references it finds in the section text; a term missing
    // here renders as its own key.
    vocabularyDefinitions: PropTypes.objectOf(
      PropTypes.shape({
        word: PropTypes.string,
        definition: PropTypes.string.isRequired,
      })
    ),
    // Opens the full-size image dialog. Without it an expandable image renders
    // inline and non-interactive, which is what the levelbuilder preview wants
    // -- there is no dialog mounted there to open.
    onExpandImage: PropTypes.func,
  };

  // Built once per instance: Markdown rebuilds its processor whenever the
  // extension list changes identity. The lookup reads current props.
  markdownExtensions = [
    extensions.expandableImages(
      this.props.onExpandImage ? {onExpand: this.props.onExpandImage} : {}
    ),
    extensions.lenientHeadings,
    extensions.lenientLinkDestinations,
    extensions.visualCodeBlock,
    extensions.vocabularyDefinition({
      lookup: term => this.props.vocabularyDefinitions?.[term],
    }),
    extensions.inlineStyles,
    extensions.details,
  ];

  render() {
    const {section} = this.props;

    return (
      <div>
        {/* Nested under the activity's h3, so h4 in the outline. */}
        <Typography
          variant="h5"
          component="h4"
          id={`activity-section-${section.key}`}
          className={styles.activitySectionHeader}
        >
          {section.displayName}
          {section.duration > 0 && (
            <span>
              {i18n.activityHeaderTime({
                activityDuration: section.duration,
              })}
            </span>
          )}
        </Typography>
        <div className="activity-section-text">
          <div className={styles.textAndProgression}>
            {section.remarks && (
              <div>
                <Typography variant="h6" component="h5">
                  <FontAwesome icon="microphone" />
                  <span className={styles.remarks}>{i18n.remarks()}</span>
                </Typography>
              </div>
            )}
            <div className={classNames(section.remarks && styles.remarksBody)}>
              <Markdown
                content={section.text}
                extensions={this.markdownExtensions}
                bodyVariant="body4"
              />
            </div>
          </div>
        </div>
        {section.scriptLevels.length > 0 && (
          <div className={styles.progression}>
            <ProgressionDetails section={section} />
          </div>
        )}
        <div className="activity-section-text">
          {section.tips.map((tip, index) => {
            return (
              <LessonTip
                key={`tip-${index}`}
                tip={tip}
                vocabularyDefinitions={this.props.vocabularyDefinitions}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
