import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';

export default class EmptySection extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
  };

  render() {
    const {sectionId} = this.props;

    return (
      <div style={styles.text}>
        <img src={emptyDesk} alt={'empty desk'} />
        <Heading3>{i18n.emptySectionHeadline()}</Heading3>
        <BodyTwoText>{i18n.emptySectionDescription()}</BodyTwoText>
        <Button
          __useDeprecatedTag
          href={`/teacher_dashboard/sections/${sectionId}/manage_students`}
          text={i18n.addStudents()}
          color={Button.ButtonColor.brandSecondaryDefault}
          style={{margin: 0}}
          aria-label={i18n.addStudentsToCurrentSection()}
        />
      </div>
    );
  }
}

const styles = {
  text: {
    textAlign: 'center',
    paddingTop: 10,
    maxWidth: '538px',
  },
};
