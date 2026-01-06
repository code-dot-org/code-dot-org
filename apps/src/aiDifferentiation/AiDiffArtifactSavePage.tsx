import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useState} from 'react';

import {clearPendingArtifactMessage} from '@cdo/apps/aichat/redux/slice';
import {TeacherSectionState} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatTextMessage} from './types';

import style from './ai-differentiation.module.scss';

interface Props {
  message: ChatTextMessage;
}

interface IdSet {
  [id: number]: boolean;
}

const AiDiffArtifactSavePage: React.FC<Props> = ({message}) => {
  const [selectedSectionIds, setSelectedSectionIds] = useState<IdSet>({});
  const [toggleValue, setToggleValue] = useState<boolean>(true);

  const sections: TeacherSectionState = useAppSelector(
    state => state.teacherSections || {}
  );

  const dispatch = useAppDispatch();

  console.log(selectedSectionIds);

  const toggleAll = () => {
    setSelectedSectionIds(
      sections.sectionIds.reduce((acc, id) => ({...acc, [id]: toggleValue}), {})
    );
    setToggleValue(oldValue => !oldValue);
  };

  return (
    <div className={style.artifactConfiguration}>
      <div className={style.artifactConfigurationSection}>
        <h3>Which class sections do you want to save this artifact for?</h3>
        <h4>
          The artifact will be shown on the Lesson Materials page for all
          selected class sections.
        </h4>
        <div className={style.artifactConfigurationSectionHeader}>
          <h6>Class Sections</h6>
          <a href="#" onClick={toggleAll}>
            Select All
          </a>
        </div>

        <div className={style.artifactConfigurationCheckboxes}>
          {sections?.sectionIds.map(sectionId => (
            <Checkbox
              size="m"
              label={sections.sections[sectionId].name}
              key={`${sectionId}`}
              name={`${sectionId}`}
              value={`${sectionId}`}
              checked={selectedSectionIds[sectionId] || false}
              onChange={e =>
                setSelectedSectionIds({
                  ...selectedSectionIds,
                  [sectionId]: e.target.checked,
                })
              }
            />
          ))}
        </div>
      </div>
      <div className={style.artifactConfigurationSection}>
        <h3>Which lesson do you want to save this artifact for?</h3>
        <h4>
          The artifact will be shown on the Lesson Materials page for this
          lesson.
        </h4>
        <p>To be implemented...</p>
      </div>
      <a
        href="https://support.code.org/hc/en-us/articles/115001595051-Finding-curriculum-and-lesson-plans"
        rel="noreferrer"
        target="_blank"
        className={style.artifactConfigurationFAQLink}
      >
        <span>How do I access my lesson materials?</span>
        <FontAwesomeV6Icon iconName="arrow-up-right-from-square" />
      </a>
      <div className={style.artifactConfigurationSaveButtons}>
        <Button
          size="m"
          type="secondary"
          color="black"
          onClick={() => dispatch(clearPendingArtifactMessage())}
          text="Cancel"
        />
        <Button
          size="m"
          type="primary"
          color="purple"
          onClick={() => {}}
          text="Save selections"
        />
      </div>
    </div>
  );
};

export default AiDiffArtifactSavePage;
