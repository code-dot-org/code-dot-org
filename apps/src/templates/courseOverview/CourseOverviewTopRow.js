import React, { Component, PropTypes } from 'react';
import AssignToSection from './AssignToSection';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

// TODO: these two objects might better live elsewhere
// We want level builders to be able to specify which of these strings is used,
// but then want to make sure to show tachers the localized version
export const ResourceType = {
  curriculum: 'curriculum',
  teacherForum: 'teacherForum',
  professionalLearning: 'professionalLearning',
};

const stringForType = {
  [ResourceType.curriculum]: i18n.curriculum(),
  [ResourceType.teacherForum]: i18n.teacherForum(),
  [ResourceType.professionalLearning]: i18n.professionalLearning(),
};

export default class CourseOverviewTopRow extends Component {
  static propTypes = {
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    resources: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(Object.values(ResourceType)).isRequired,
      link: PropTypes.string.isRequired,
    }))
  };

  render() {
    const { sectionsInfo, id, title } = this.props;
    const resources = [
      {
        type: ResourceType.curriculum,
        link: '/href'
      },
      {
        type: ResourceType.teacherForum,
        link: '/teacher-forum'
      }
    ];

    return (
      <div>
        <AssignToSection
          sectionsInfo={sectionsInfo}
          courseId={id}
          assignmentName={title}
        />
        {resources.map(({type, link}) =>
          <Button
            key={type}
            style={{marginLeft: 10}}
            text={stringForType[type]}
            href={link}
            color={Button.ButtonColor.blue}
          />
        )}
      </div>
    );
  }
}
