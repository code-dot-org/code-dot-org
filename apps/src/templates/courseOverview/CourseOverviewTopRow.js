import React, { Component, PropTypes } from 'react';
import AssignToSection from './AssignToSection';
import Button from '@cdo/apps/templates/Button';
import ResourceType, { stringForType } from './resourceType';

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
    const { sectionsInfo, id, title, resources } = this.props;
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
