import React, { Component, PropTypes } from 'react';
import AssignToSection from './AssignToSection';
import Button from '@cdo/apps/templates/Button';
import { stringForType, resourceShape } from './resourceType';

const styles = {
  main: {
    marginBottom: 10,
    position: 'relative',
  },
};

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
      <div style={styles.main}>
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
            target="blank"
            color={Button.ButtonColor.blue}
          />
        )}
      </div>
    );
  }
}
