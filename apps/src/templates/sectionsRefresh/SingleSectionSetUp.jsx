import Button from '@code-dot-org/component-library/button';
import Chips from '@code-dot-org/component-library/chips';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import SectionAvatar from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/sectionAvatars/SectionAvatar';
import {StudentGradeLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import SectionAvatarEditDialog from '../studioHomepages/teacherHomepageV2/sectionAvatars/SectionAvatarEditDialog';

import moduleStyles from './sections-refresh.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';
import styles from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/sectionAvatars/section-avatars.module.scss';

export default function SingleSectionSetUp({
  sectionNum,
  section,
  updateSection,
  batchUpdateSection,
  isNewSection,
  isLoading = false,
}) {
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const gradeOptions = StudentGradeLevels.map(g => ({label: g, value: g}));
  const participantType = isNewSection
    ? queryParams('participantType')
    : section.participantType;

  const handleAvatarUpdate = (color, emoji) => {
    batchUpdateSection({
      avatar_color: color,
      avatar_emoji: emoji,
    });
    setShowAvatarDialog(false);
  };

  return (
    <div>
      <div className={moduleStyles.containerWithMarginTop}>
        <Heading2>{i18n.classSection()}</Heading2>
        <label className={moduleStyles.typographyLabelTwo}>
          {i18n.className()}

          {isLoading ? (
            <div
              className={classNames(
                moduleStyles.skeletonTextField,
                skeletonizeContent.skeletonizeContent
              )}
            />
          ) : (
            <input
              required
              type="text"
              id="uitest-section-name-setup"
              className={moduleStyles.classNameTextField}
              value={section.name}
              onChange={e => updateSection('name', e.target.value)}
              disabled={isLoading}
            />
          )}
        </label>
      </div>
      <label className={moduleStyles.typographyLabelTwo}>
        {i18n.avatar()}
        <div className={styles.avatarContainer}>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <SectionAvatar
                color={section.avatar_color || 0}
                emoji={section.avatar_emoji || 0}
                size={'m'}
              />
              <Button
                className={styles.avatarButton}
                text={i18n.editAvatar()}
                aria-label={i18n.editAvatar()}
                type={'secondary'}
                color={'gray'}
                size={'s'}
                onClick={() => setShowAvatarDialog(true)}
              />
            </>
          )}
        </div>
      </label>
      {participantType === ParticipantAudience.student && (
        <div className={moduleStyles.containerWithMarginTop}>
          <Chips
            label={i18n.chooseGrades()}
            name="grades"
            required={true}
            requiredMessageText={i18n.chooseAtLeastOne()}
            options={gradeOptions}
            values={section.grades || []}
            setValues={g => updateSection('grades', g)}
            disabled={isLoading}
          />
        </div>
      )}
      {showAvatarDialog && (
        <SectionAvatarEditDialog
          closeCallback={() => setShowAvatarDialog(false)}
          saveCallback={handleAvatarUpdate}
          avatarColor={section.avatar_color}
          avatarEmoji={section.avatar_emoji}
        />
      )}
    </div>
  );
}

SingleSectionSetUp.propTypes = {
  sectionNum: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  updateSection: PropTypes.func.isRequired,
  batchUpdateSection: PropTypes.func.isRequired,
  isNewSection: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
};
