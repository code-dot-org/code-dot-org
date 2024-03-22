import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';

export default class EmptySection extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    className: PropTypes.string,
  };

  render() {
    const {sectionId, className} = this.props;

    return (
      <div className={className}>
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
