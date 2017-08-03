import React, { Component, PropTypes } from 'react';
import AssignToSection from './AssignToSection';
import Button from '@cdo/apps/templates/Button';
import { stringForType, resourceShape } from './resourceType';

export default class CourseOverviewTopRow extends Component {
  static propTypes = {
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired,
  };

  render() {
    const { sectionsInfo, id, title, resources } = this.props;
    return (
      <div style={{marginBottom: 10}}>
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
