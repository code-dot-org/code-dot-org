import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
// import {
//   BodyTwoText,
//   Heading1,
//   Heading3,
// } from '@cdo/apps/componentLibrary/typography';
import color from '@cdo/apps/util/color';
// import LevelTypesBox from './LevelTypesBox';
import TeacherActionsBox from './TeacherActionsBox';

export default function IconKey({
  sectionId,
  isViewingLevelProgress,
  hasLevelValidation,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const caret = isOpenA => (isOpenA ? 'caret-down' : 'caret-right');

  // const sectionContent = () => <LevelTypesBox />;

  const clickListener = () => setIsOpen(!isOpen);

  return (
    <div>
      <Button
        id={sectionId}
        style={styles.label}
        styleAsText
        icon={caret(isOpen)}
        onClick={clickListener}
      >
        {i18n.iconKey()}
      </Button>
      <div>{isOpen && <TeacherActionsBox isViewingLevelProgress={true} />}</div>
    </div>
  );
}

IconKey.propTypes = {
  sectionId: PropTypes.number.isRequired,
  isViewingLevelProgress: PropTypes.bool,
  hasLevelValidation: PropTypes.bool,
};

const styles = {
  label: {
    fontFamily: 'Metropolis',
    color: color.light_gray_900,
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '148%',
  },
};
